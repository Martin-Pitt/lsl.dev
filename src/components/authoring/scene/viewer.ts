/**
 * The <Scene> viewer, loaded on demand by Scene.astro's script (a separate chunk with three.js;
 * GLTFLoader is a further chunk, fetched only for scenes with a <Model>).
 *
 * Coordinates stay in Second Life's frame: Z up (camera.up = +Z), metres, Euler rotations in
 * LSL order (llEuler2Rot applies X, then Y, then Z, which is three's 'ZYX' order). The root
 * group carries the root's pos/rot; children are its children, so their pos/rot are local to it.
 *
 * Controls: drag orbits the target; wheel or pinch zooms; Alt+drag orbits around the clicked
 * point; Ctrl+Alt+drag (or right/middle drag, or two fingers) pans; Shift+Alt+drag zooms;
 * arrow keys orbit and +/- zoom when the canvas has focus; the Turn slider sets the yaw; Reset
 * restores the first view. Auto-spin (until the first interaction) and the explode animation are
 * off/instant under prefers-reduced-motion.
 */
import {
	WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, MeshStandardMaterial, BoxGeometry, CylinderGeometry,
	SphereGeometry, TorusGeometry, BufferGeometry, Float32BufferAttribute, HemisphereLight, DirectionalLight,
	GridHelper, Vector3, Euler, Color, Box3, Raycaster, Vector2, TextureLoader, SRGBColorSpace, MathUtils,
	type Object3D, type Material,
} from 'three';
import type { Part } from './parts';

const D2R = MathUtils.DEG2RAD;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDark = () => document.documentElement.dataset.theme !== 'light';

/** Unit-size geometries (1 m on each axis), scaled per prim; oriented as SL's shapes. */
function geometry(shape: Part['shape']): BufferGeometry {
	switch (shape) {
		case 'cylinder': return new CylinderGeometry(0.5, 0.5, 1, 40).rotateX(Math.PI / 2); // axis Z
		case 'sphere': return new SphereGeometry(0.5, 40, 24);
		case 'torus': return new TorusGeometry(0.375, 0.125, 20, 48).rotateY(Math.PI / 2); // revolves around X, hole size 0.25
		case 'prism': {
			// SL's prism: a triangular profile in XY extruded along Z (flat-shaded, non-indexed).
			const [a, b, c] = [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]];
			const v = (p: number[], z: number) => [p[0], p[1], z];
			const tri = (...t: number[][]) => t.flat();
			const lo = -0.5, hi = 0.5;
			const pos = [
				...tri(v(a, lo), v(c, lo), v(b, lo)), ...tri(v(a, hi), v(b, hi), v(c, hi)),
				...[[a, b], [b, c], [c, a]].flatMap(([p, q]) => tri(v(p, lo), v(q, lo), v(q, hi), v(p, lo), v(q, hi), v(p, hi))),
			];
			const g = new BufferGeometry();
			g.setAttribute('position', new Float32BufferAttribute(pos, 3));
			// Planar UVs from XY, so a texture still maps.
			g.setAttribute('uv', new Float32BufferAttribute(pos.flatMap((n, i) => (i % 3 === 2 ? [] : [n + 0.5])), 2));
			g.computeVertexNormals();
			return g;
		}
		default: return new BoxGeometry(1, 1, 1);
	}
}

/** Any CSS colour (light-dark(), color-mix(), oklab()) to a three Color, via a 1px canvas. */
const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
function cssColour(css: string): Color {
	ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return new Color(r / 255, g / 255, b / 255);
}

export async function mount(fig: HTMLElement) {
	const stage = fig.querySelector<HTMLElement>('.au-scene__stage')!;
	const view = fig.querySelector<HTMLElement>('.au-scene__view')!;
	const msg = fig.querySelector<HTMLElement>('.au-scene__msg')!;
	const bar = fig.querySelector<HTMLElement>('.au-scene__bar')!;
	const turn = bar.querySelector<HTMLInputElement>('input[type=range]')!;
	const resetBtn = bar.querySelector<HTMLButtonElement>('.au-scene__reset')!;
	const explodeBtn = bar.querySelector<HTMLButtonElement>('.au-scene__explode');
	const hint = bar.querySelector<HTMLElement>('.au-scene__hint')!;
	const labelsEl = fig.querySelector<HTMLElement>('.au-scene__labels')!;
	const lines = fig.querySelector<SVGSVGElement>('.au-scene__lines')!;
	const { parts, grid: wantGrid } = JSON.parse(fig.querySelector('.au-scene__data')!.textContent!) as { parts: Part[]; grid: boolean };
	const caption = fig.querySelector('figcaption')?.textContent?.trim() ?? '';

	let renderer: WebGLRenderer;
	try {
		renderer = new WebGLRenderer({ antialias: true, alpha: true });
	} catch {
		fig.classList.add('is-nogl');
		msg.textContent = 'This browser can’t show the 3D view (WebGL is unavailable). The parts are listed below.';
		fig.querySelector('details')!.open = true;
		return;
	}
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
	renderer.setClearColor(0, 0); // transparent: the stage's CSS background shows through
	const canvas = renderer.domElement;
	canvas.tabIndex = 0;
	canvas.setAttribute('role', 'img');
	canvas.setAttribute('aria-label', `3D view: ${caption}`);
	hint.id ||= `au-scene-hint-${Math.random().toString(36).slice(2, 8)}`;
	canvas.setAttribute('aria-describedby', hint.id);
	view.append(canvas);

	const scene = new Scene();
	const camera = new PerspectiveCamera(40, 1, 0.01, 2000);
	camera.up.set(0, 0, 1);
	const hemi = new HemisphereLight();
	hemi.position.set(0, 0, 1);
	const sun = new DirectionalLight();
	sun.position.set(-3, -5, 8);
	const fill = new DirectionalLight();
	fill.position.set(5, 3, 2);
	scene.add(hemi, sun, fill);

	// Parts: the root group holds the root's transform; every other part is its child.
	type Built = { part: Part; obj: Object3D; base: Vector3; out: Vector3; label?: HTMLElement };
	const built: Built[] = [];
	const rootPart = parts.find(p => p.root)!;
	const rootGroup = new Group();
	rootGroup.position.set(...rootPart.pos);
	rootGroup.rotation.copy(new Euler(rootPart.rot[0] * D2R, rootPart.rot[1] * D2R, rootPart.rot[2] * D2R, 'ZYX'));
	scene.add(rootGroup);
	const textures = new TextureLoader();
	const hasModels = parts.some(p => p.kind === 'model');
	const gltf = hasModels ? new (await import('three/addons/loaders/GLTFLoader.js')).GLTFLoader() : null;

	await Promise.all(parts.map(async part => {
		const holder = new Group();
		if (!part.root) {
			holder.position.set(...part.pos);
			holder.rotation.copy(new Euler(part.rot[0] * D2R, part.rot[1] * D2R, part.rot[2] * D2R, 'ZYX'));
		}
		if (part.kind === 'model' && gltf) {
			const g = await gltf.loadAsync(part.src!).catch(() => null);
			if (g) {
				g.scene.rotation.x = Math.PI / 2; // glTF is Y-up
				g.scene.scale.set(part.size[0], part.size[2], part.size[1]);
				holder.add(g.scene);
			}
		} else {
			const opaque = part.alpha === undefined || part.alpha >= 1;
			const mat = new MeshStandardMaterial({
				color: part.color ?? (part.texture ? '#ffffff' : '#c3c7cf'), roughness: 0.82, metalness: 0,
				transparent: !opaque, opacity: part.alpha ?? 1, depthWrite: opaque,
			});
			if (part.texture) {
				textures.loadAsync(part.texture).then(t => { t.colorSpace = SRGBColorSpace; mat.map = t; mat.needsUpdate = true; request(); }).catch(() => {});
			}
			const mesh = new Mesh(geometry(part.shape), mat);
			mesh.scale.set(...part.size);
			holder.add(mesh);
		}
		holder.userData.part = part.name;
		rootGroup.add(holder);
		built.push({ part, obj: holder, base: holder.position.clone(), out: holder.position.clone() });
	}));
	built.sort((a, b) => parts.indexOf(a.part) - parts.indexOf(b.part));
	scene.updateMatrixWorld(true);

	// Framing: the bounding sphere of the whole object, then exploded offsets from it.
	const box = new Box3().setFromObject(rootGroup);
	const size = box.getSize(new Vector3());
	const radius = Math.max(size.length() / 2, 0.1);
	for (const b of built) {
		if (b.part.root) continue;
		const dir = b.base.lengthSq() > 1e-6 ? b.base.clone().normalize() : new Vector3(0, 0, 1);
		b.out = b.base.clone().multiplyScalar(1.6).addScaledVector(dir, radius * 0.45);
	}
	// The exploded bounds: exploding shifts the target and zooms by the difference, on top of the user's view.
	for (const b of built) b.obj.position.copy(b.out);
	scene.updateMatrixWorld(true);
	const exBox = new Box3().setFromObject(rootGroup);
	for (const b of built) b.obj.position.copy(b.base);
	scene.updateMatrixWorld(true);
	const exShift = exBox.getCenter(new Vector3()).sub(box.getCenter(new Vector3()));
	const exZoom = Math.max(exBox.getSize(new Vector3()).length() / 2, 0.1) / radius;

	let gridHelper: GridHelper | null = null;
	if (wantGrid) {
		const span = Math.max(2, Math.ceil(radius * 4));
		gridHelper = new GridHelper(span, span * 2);
		gridHelper.rotation.x = Math.PI / 2;
		gridHelper.position.set(box.getCenter(new Vector3()).x, box.getCenter(new Vector3()).y, box.min.z - 0.001);
		const m = gridHelper.material as Material & { transparent: boolean; opacity: number };
		m.transparent = true; m.opacity = 0.5; m.depthWrite = false;
		scene.add(gridHelper);
	}

	// Theme: lights and grid follow the page theme (Starlight's data-theme) and the CSS tokens.
	function theme() {
		const dark = isDark();
		hemi.color.set(dark ? '#d8dcf0' : '#ffffff');
		hemi.groundColor.set(dark ? '#2a2e3a' : '#9a9a9a');
		hemi.intensity = dark ? 1.4 : 1.6;
		sun.intensity = dark ? 1.7 : 1.9;
		fill.intensity = dark ? 0.45 : 0.55;
		if (gridHelper) {
			const c = cssColour(getComputedStyle(stage).color);
			(gridHelper.material as any).color = c;
			(gridHelper.material as any).vertexColors = false;
			(gridHelper.material as Material).needsUpdate = true;
		}
		request();
	}
	new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

	// Camera: spherical coordinates around a target, Z up.
	const home = { target: box.getCenter(new Vector3()), r: radius / Math.sin((camera.fov * D2R) / 2) * 1.15, yaw: -55 * D2R, pitch: 68 * D2R };
	const target = home.target.clone();
	let r = home.r, yaw = home.yaw, pitch = home.pitch;
	const clampPitch = () => { pitch = MathUtils.clamp(pitch, 0.05, Math.PI - 0.05); };
	const clampR = () => { r = MathUtils.clamp(r, radius * 0.4, home.r * 12); };
	function place() {
		camera.position.set(
			target.x + r * Math.sin(pitch) * Math.cos(yaw),
			target.y + r * Math.sin(pitch) * Math.sin(yaw),
			target.z + r * Math.cos(pitch),
		);
		camera.lookAt(target);
		const deg = Math.round(MathUtils.euclideanModulo((yaw - home.yaw) / D2R, 360)) % 360;
		turn.value = String(deg);
		turn.setAttribute('aria-valuetext', `${deg} degrees`);
	}
	/** Re-derives yaw/pitch/r from the camera's current position after the target moves. */
	function retarget(p: Vector3) {
		target.copy(p);
		const d = camera.position.clone().sub(target);
		r = d.length(); pitch = Math.acos(MathUtils.clamp(d.z / r, -1, 1)); yaw = Math.atan2(d.y, d.x);
		clampPitch(); clampR();
	}

	// Explode: t eases 0 → 1; labels show while exploded.
	let t = 0, lastE = 0, goal = 0, spinning = !reduced(), visible = true, raf = 0, last = 0;
	function stopSpin() { spinning = false; }
	function setExplode(on: boolean) {
		goal = on ? 1 : 0;
		explodeBtn?.setAttribute('aria-pressed', String(on));
		fig.classList.toggle('is-exploded', on);
		if (reduced()) t = goal;
		request();
	}

	// Labels: DOM boxes placed from projected 3D points, nudged apart so they don't overlap.
	for (const b of built) {
		const el = document.createElement('div');
		el.className = 'au-scene__label';
		const strong = document.createElement('strong');
		strong.textContent = b.part.name + (b.part.root ? ' (root)' : '');
		el.append(strong);
		if (b.part.note) { const s = document.createElement('span'); s.textContent = b.part.note; el.append(s); }
		if (b.part.inventory) { const s = document.createElement('span'); s.className = 'au-scene__label-inv'; s.textContent = 'Has contents'; el.append(s); }
		labelsEl.append(el);
		b.label = el;
	}
	const tmpBox = new Box3(), tmpV = new Vector3();
	function layoutLabels(w: number, h: number) {
		const show = t > 0.98;
		labelsEl.hidden = !show;
		lines.replaceChildren();
		if (!show) return;
		const items = built.map(b => {
			tmpBox.setFromObject(b.obj);
			tmpBox.getCenter(tmpV);
			tmpV.z = tmpBox.max.z;
			const p = tmpV.clone().project(camera);
			const el = b.label!;
			return { el, ax: (p.x + 1) / 2 * w, ay: (1 - p.y) / 2 * h, lw: el.offsetWidth, lh: el.offsetHeight, x: 0, y: 0, behind: p.z > 1 };
		});
		const gap = 6;
		for (const it of items) { it.x = MathUtils.clamp(it.ax - it.lw / 2, 4, w - it.lw - 4); it.y = it.ay - it.lh - 18; }
		// Relax: push overlapping pairs apart vertically (top one up, lower one down), a few passes.
		items.sort((a, b) => a.y - b.y);
		for (let pass = 0; pass < 8; pass++) {
			let moved = false;
			for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
				const a = items[i], b = items[j];
				if (a.x < b.x + b.lw + gap && b.x < a.x + a.lw + gap && a.y < b.y + b.lh + gap && b.y < a.y + a.lh + gap) {
					const push = (a.y + a.lh + gap - b.y) / 2 + 0.5;
					a.y -= push; b.y += push; moved = true;
				}
			}
			if (!moved) break;
		}
		const ns = 'http://www.w3.org/2000/svg';
		for (const it of items) {
			it.y = MathUtils.clamp(it.y, 4, h - it.lh - 4);
			it.el.style.translate = `${Math.round(it.x)}px ${Math.round(it.y)}px`;
			it.el.style.visibility = it.behind ? 'hidden' : '';
			if (it.behind) continue;
			const line = document.createElementNS(ns, 'line');
			const ly = it.y + it.lh / 2 < it.ay ? it.y + it.lh : it.y;
			line.setAttribute('x1', String(it.ax)); line.setAttribute('y1', String(it.ay));
			line.setAttribute('x2', String(MathUtils.clamp(it.ax, it.x + 8, it.x + it.lw - 8))); line.setAttribute('y2', String(ly));
			const dot = document.createElementNS(ns, 'circle');
			dot.setAttribute('cx', String(it.ax)); dot.setAttribute('cy', String(it.ay)); dot.setAttribute('r', '3');
			lines.append(line, dot);
		}
	}

	// Rendering on demand: a frame runs only when something changed or is animating.
	let w = 0, h = 0;
	function resize() {
		w = stage.clientWidth; h = stage.clientHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / Math.max(h, 1);
		camera.updateProjectionMatrix();
		lines.setAttribute('viewBox', `0 0 ${w} ${h}`);
		request();
	}
	function request() { if (!raf && visible) raf = requestAnimationFrame(frame); }
	function frame(now: number) {
		raf = 0;
		const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
		last = now;
		let again = false;
		if (spinning) { yaw += dt * 8 * D2R; again = true; }
		if (t !== goal) {
			t = goal > t ? Math.min(goal, t + dt / 0.6) : Math.max(goal, t - dt / 0.6);
			again = true;
		}
		const e = t * t * (3 - 2 * t);
		if (e !== lastE) { target.addScaledVector(exShift, e - lastE); r *= Math.pow(exZoom, e - lastE); lastE = e; }
		for (const b of built) b.obj.position.lerpVectors(b.base, b.out, e);
		place();
		renderer.render(scene, camera);
		layoutLabels(w, h);
		if (again) request(); else last = 0;
	}

	// Pointer controls.
	const ray = new Raycaster(), ndc = new Vector2();
	const pointers = new Map<number, { x: number; y: number }>();
	let mode: 'orbit' | 'pan' | 'zoom' | null = null, pinch = 0;
	function pan(dx: number, dy: number) {
		const k = (2 * r * Math.tan((camera.fov * D2R) / 2)) / Math.max(h, 1);
		const right = new Vector3().setFromMatrixColumn(camera.matrix, 0);
		const up = new Vector3().setFromMatrixColumn(camera.matrix, 1);
		target.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
	}
	canvas.addEventListener('pointerdown', e => {
		stopSpin();
		canvas.setPointerCapture(e.pointerId);
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); mode = 'pan'; return; }
		if (e.altKey && (e.ctrlKey || e.metaKey)) mode = 'pan';
		else if (e.altKey && e.shiftKey) mode = 'zoom';
		else if (e.button === 1 || e.button === 2) mode = 'pan';
		else mode = 'orbit';
		if (e.altKey && mode === 'orbit') {
			// SL alt-cam: focus on the clicked point, then orbit around it.
			const rect = canvas.getBoundingClientRect();
			ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
			ray.setFromCamera(ndc, camera);
			const hit = ray.intersectObject(rootGroup, true)[0];
			if (hit) { retarget(hit.point); request(); }
		}
		e.preventDefault();
	});
	canvas.addEventListener('pointermove', e => {
		const prev = pointers.get(e.pointerId);
		if (!prev || !mode) return;
		const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
		prev.x = e.clientX; prev.y = e.clientY;
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			const d = Math.hypot(a.x - b.x, a.y - b.y);
			if (pinch) { r *= pinch / d; clampR(); }
			pinch = d;
			pan(dx / 2, dy / 2);
		} else if (mode === 'orbit') { yaw -= dx * 0.01; pitch -= dy * 0.01; clampPitch(); }
		else if (mode === 'pan') pan(dx, dy);
		else if (mode === 'zoom') { r *= Math.exp(dy * 0.01); clampR(); }
		request();
	});
	const end = (e: PointerEvent) => { pointers.delete(e.pointerId); if (!pointers.size) mode = null; pinch = 0; };
	canvas.addEventListener('pointerup', end);
	canvas.addEventListener('pointercancel', end);
	canvas.addEventListener('contextmenu', e => e.preventDefault());
	canvas.addEventListener('wheel', e => { e.preventDefault(); stopSpin(); r *= Math.exp(e.deltaY * (e.deltaMode ? 0.05 : 0.0015)); clampR(); request(); }, { passive: false });
	canvas.addEventListener('keydown', e => {
		const step = (e.shiftKey ? 15 : 5) * D2R;
		const keys: Record<string, () => void> = {
			ArrowLeft: () => { yaw -= step; }, ArrowRight: () => { yaw += step; },
			ArrowUp: () => { pitch -= step; clampPitch(); }, ArrowDown: () => { pitch += step; clampPitch(); },
			'+': () => { r /= 1.15; clampR(); }, '=': () => { r /= 1.15; clampR(); }, '-': () => { r *= 1.15; clampR(); },
			Home: reset,
		};
		const fn = keys[e.key];
		if (!fn || e.altKey || e.ctrlKey || e.metaKey) return;
		e.preventDefault(); stopSpin(); fn(); request();
	});
	turn.addEventListener('input', () => { stopSpin(); yaw = home.yaw + Number(turn.value) * D2R; request(); });
	function reset() { target.copy(home.target).addScaledVector(exShift, lastE); r = home.r * Math.pow(exZoom, lastE); yaw = home.yaw; pitch = home.pitch; stopSpin(); request(); }
	resetBtn.addEventListener('click', reset);
	explodeBtn?.addEventListener('click', () => { stopSpin(); setExplode(goal === 0); });

	new ResizeObserver(resize).observe(stage);
	new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) request(); }).observe(fig);
	fig.classList.add('is-live');
	bar.hidden = false;
	theme();
	resize();
}
