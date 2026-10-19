/**
 * SVG builder for <Diagram>: plain strings, built at build time, no client JS.
 *
 * Colours are CSS custom properties set in diagrams.css (--dg-x, --dg-y, --dg-z for the axes, as
 * in the Second Life build tool; --dg-accent, --dg-purple, --dg-teal for highlights; --dg-fg,
 * --dg-muted, --dg-grid, --dg-surface, --dg-bg for the page). They go in style attributes, which
 * accept var() everywhere; presentation attributes do not in every browser.
 *
 * 3D diagrams use one orthographic camera (yaw -22°, looking down 35°) so that every diagram on a
 * page reads the same way, and lengths along an axis compare at a glance.
 */

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Mat3 = [Vec3, Vec3, Vec3];

export const DEG = Math.PI / 180;

/** Colour names usable in builder calls, mapped to the CSS custom properties. */
export const C = {
	x: 'var(--dg-x)', y: 'var(--dg-y)', z: 'var(--dg-z)',
	accent: 'var(--dg-accent)', purple: 'var(--dg-purple)', teal: 'var(--dg-teal)',
	fg: 'var(--dg-fg)', muted: 'var(--dg-muted)', grid: 'var(--dg-grid)', surface: 'var(--dg-surface)', bg: 'var(--dg-bg)',
	tealFill: 'var(--dg-teal-fill)', accentFill: 'var(--dg-accent-fill)',
} as const;
export const AXIS = [C.x, C.y, C.z] as const;

// Vector and matrix maths. Matrices act on column vectors: mv(M, v) is LSL's `v * rot` when M is
// rot's matrix, and mm(A, B) applies B first, so LSL's `a * b` is mm(B, A).
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const rotZ = (a: number): Mat3 => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
export const rotY = (a: number): Mat3 => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
export const IDENTITY: Mat3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const mm = (A: Mat3, B: Mat3): Mat3 =>
	A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j])) as Mat3;
export const mv = (M: Mat3, v: Vec3): Vec3 =>
	M.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) as Vec3;
export const col = (M: Mat3, i: number): Vec3 => [M[0][i], M[1][i], M[2][i]];

const num = (n: number) => (Math.round(n * 100) / 100).toString();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Style = Record<string, string | number | undefined>;
const styleAttr = (s: Style) => {
	const css = Object.entries(s).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}:${v}`).join(';');
	return css ? ` style="${css}"` : '';
};

export type LineOpts = { width?: number; dash?: string; opacity?: number };
export type TextOpts = { anchor?: 'start' | 'middle' | 'end'; bold?: boolean; size?: number };
export type GizmoOpts = { gap?: number; both?: boolean; width?: number; head?: number };

/** Collects SVG elements as strings. Coordinates are in viewBox units. */
export class Svg {
	private parts: string[] = [];
	private ids = 0;
	constructor(readonly id: string) {}

	raw(s: string) { this.parts.push(s); }
	uid(prefix: string) { return `${this.id}-${prefix}${this.ids++}`; }

	line(a: Vec2, b: Vec2, stroke: string, o: LineOpts = {}) {
		this.raw(`<line x1="${num(a[0])}" y1="${num(a[1])}" x2="${num(b[0])}" y2="${num(b[1])}"${styleAttr({
			stroke, 'stroke-width': o.width ?? 1, 'stroke-dasharray': o.dash, opacity: o.opacity, 'stroke-linecap': 'round',
		})}/>`);
	}
	polygon(points: Vec2[], fill: string, stroke?: string, width = 1.2) {
		const d = 'M' + points.map(p => `${num(p[0])},${num(p[1])}`).join(' L') + 'Z';
		this.raw(`<path d="${d}"${styleAttr({ fill, stroke, 'stroke-width': stroke ? width : undefined, 'stroke-linejoin': 'round' })}/>`);
	}
	path(d: string, s: Style) { this.raw(`<path d="${d}"${styleAttr(s)}/>`); }
	circle(c: Vec2, r: number, fill: string, stroke?: string, width = 2) {
		this.raw(`<circle cx="${num(c[0])}" cy="${num(c[1])}" r="${num(r)}"${styleAttr({ fill, stroke, 'stroke-width': stroke ? width : undefined })}/>`);
	}
	/** A point marker with a halo in the page colour, so it stands out over lines. */
	dot(c: Vec2, fill: string, r = 5) { this.circle(c, r, fill, C.bg, 2); }
	rect(x: number, y: number, w: number, h: number, s: Style, rx = 0) {
		this.raw(`<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}"${rx ? ` rx="${rx}"` : ''}${styleAttr(s)}/>`);
	}
	text(p: Vec2, s: string, fill: string, o: TextOpts = {}) {
		this.raw(`<text x="${num(p[0])}" y="${num(p[1])}"${o.anchor && o.anchor !== 'start' ? ` text-anchor="${o.anchor}"` : ''}${styleAttr({
			fill, 'font-weight': o.bold ? 600 : undefined, 'font-size': o.size ? `${o.size}px` : undefined,
		})}>${esc(s)}</text>`);
	}
	open(attrs: string) { this.raw(`<g ${attrs}>`); }
	close() { this.raw('</g>'); }

	/** A solid triangular arrowhead with its tip at `tip`, pointing along `dir`. */
	head(tip: Vec2, dir: Vec2, fill: string, size = 9) {
		const n = Math.hypot(dir[0], dir[1]) || 1, u: Vec2 = [dir[0] / n, dir[1] / n], v: Vec2 = [-u[1], u[0]];
		const base: Vec2 = [tip[0] - u[0] * size, tip[1] - u[1] * size];
		this.polygon([tip, [base[0] + v[0] * size * .45, base[1] + v[1] * size * .45], [base[0] - v[0] * size * .45, base[1] - v[1] * size * .45]], fill);
	}

	/** A straight arrow from a to b with a solid head. */
	arrow(a: Vec2, b: Vec2, stroke: string, o: LineOpts & { head?: number } = {}) {
		const d: Vec2 = [b[0] - a[0], b[1] - a[1]], n = Math.hypot(d[0], d[1]) || 1, h = o.head ?? 10;
		this.line(a, [b[0] - d[0] / n * h * .8, b[1] - d[1] / n * h * .8], stroke, { width: o.width ?? 2.4, dash: o.dash, opacity: o.opacity });
		this.head(b, d, stroke, h);
	}

	/**
	 * The Second Life move gizmo for one axis: a thin stem and a solid head, split by a gap at the
	 * origin. With `both`, the negative half is drawn too, and its head also points the positive
	 * way, as in the viewer.
	 */
	gizmo(o: Vec2, dir: Vec2, len: number, colour: string, g: GizmoOpts = {}) {
		const gap = g.gap ?? 6, width = g.width ?? 2.2, size = g.head ?? 9;
		const n = Math.hypot(dir[0], dir[1]) || 1, u: Vec2 = [dir[0] / n, dir[1] / n];
		const half = (from: number, to: number) => {
			const tip: Vec2 = [o[0] + u[0] * to, o[1] + u[1] * to];
			if (width) this.line([o[0] + u[0] * from, o[1] + u[1] * from], [tip[0] - u[0] * size, tip[1] - u[1] * size], colour, { width });
			this.head(tip, u, colour, size);
		};
		half(gap, len);
		if (g.both ?? true) half(-len, -gap);
	}

	/** An arc of radius r around c from angle a0 to a1 (degrees, screen space, y down), with a head at the end. */
	arcArrow(c: Vec2, r: number, a0: number, a1: number, colour: string, width = 2.2) {
		const p = (a: number): Vec2 => [c[0] + r * Math.cos(a * DEG), c[1] + r * Math.sin(a * DEG)];
		const [s, e] = [p(a0), p(a1)], cw = a1 > a0, large = Math.abs(a1 - a0) > 180 ? 1 : 0;
		this.path(`M${num(s[0])},${num(s[1])} A${num(r)},${num(r)} 0 ${large} ${cw ? 1 : 0} ${num(e[0])},${num(e[1])}`, { fill: 'none', stroke: colour, 'stroke-width': width });
		const t: Vec2 = cw ? [-Math.sin(a1 * DEG), Math.cos(a1 * DEG)] : [Math.sin(a1 * DEG), -Math.cos(a1 * DEG)];
		this.head(e, t, colour, 10);
	}

	toString() { return this.parts.join(''); }
}

export type CameraOpts = { scale: number; centre: Vec2; target: Vec3; yaw?: number; pitch?: number };

/** An orthographic camera over a Z-up world, plus helpers that draw in world coordinates. */
export class Scene3D {
	readonly yaw: Mat3;
	readonly sinP: number;
	readonly cosP: number;
	constructor(readonly svg: Svg, readonly cam: CameraOpts) {
		this.yaw = rotZ(cam.yaw ?? -22 * DEG);
		const p = cam.pitch ?? 35 * DEG;
		this.sinP = Math.sin(p);
		this.cosP = Math.cos(p);
	}
	/** Screen position of a world point. */
	P(p: Vec3): Vec2 { const [x, y] = this.project(p); return [x, y]; }
	/** Screen position plus depth (larger is further away). */
	project(p: Vec3): [number, number, number] {
		const t = this.cam.target, q = mv(this.yaw, [p[0] - t[0], p[1] - t[1], p[2] - t[2]]);
		return [this.cam.centre[0] + q[0] * this.cam.scale, this.cam.centre[1] - (q[1] * this.sinP + q[2] * this.cosP) * this.cam.scale, q[1] * this.cosP - q[2] * this.sinP];
	}
	/** Screen direction of a world direction at a point. */
	dir(at: Vec3, d: Vec3): Vec2 { const a = this.P(at), b = this.P(add(at, mul(d, 0.01))); return [b[0] - a[0], b[1] - a[1]]; }

	line(a: Vec3, b: Vec3, stroke: string, o?: LineOpts) { this.svg.line(this.P(a), this.P(b), stroke, o); }
	text(p: Vec3, off: Vec2, s: string, fill: string, o?: TextOpts) { const q = this.P(p); this.svg.text([q[0] + off[0], q[1] + off[1]], s, fill, o); }
	dot(p: Vec3, fill: string, r?: number) { this.svg.dot(this.P(p), fill, r); }

	/** A flat grid on z = 0 from (x0, y0) to (x1, y1), one line per `step`. */
	grid(x0: number, y0: number, x1: number, y1: number, step = 1, o: LineOpts = {}) {
		for (let x = x0; x <= x1 + 1e-6; x += step) this.line([x, y0, 0], [x, y1, 0], C.grid, o);
		for (let y = y0; y <= y1 + 1e-6; y += step) this.line([x0, y, 0], [x1, y, 0], C.grid, o);
	}
	/** A gizmo for a frame with rotation R at o; `lens` per axis in px, 0 skips that axis. */
	gizmo(o: Vec3, R: Mat3, lens: [number, number, number], g?: GizmoOpts) {
		const p = this.P(o);
		lens.forEach((len, i) => { if (len) this.svg.gizmo(p, this.dir(o, col(R, i)), len, AXIS[i], g); });
	}
	/** Faint full-length axis lines through o, as the viewer draws them while editing. */
	through(o: Vec3, R: Mat3, len: number, opacity = .35) {
		for (let i = 0; i < 3; i++) { const d = col(R, i); this.line(add(o, mul(d, -len)), add(o, mul(d, len)), AXIS[i], { opacity }); }
	}
	/** A ruler along d from o, ticks every `step`, labels every `every`, ticks pointing along `side`. */
	ruler(o: Vec3, d: Vec3, from: number, to: number, step: number, every: number, fmt: (t: number) => string, side: Vec3,
		colour: string = C.fg, tick = .25, labelAt = .6) {
		this.line(add(o, mul(d, from)), add(o, mul(d, to)), colour, { opacity: .75 });
		for (let t = from; t <= to + 1e-6; t += step) {
			const p = add(o, mul(d, t));
			this.line(p, add(p, mul(side, tick)), colour, { opacity: .75 });
			if (Math.abs(t / every - Math.round(t / every)) < 1e-6) this.text(add(p, mul(side, labelAt)), [0, 4], fmt(t), C.muted, { anchor: 'middle' });
		}
	}
	/** Faces of a box (centre c and rotation R in world space), for depth-sorted drawing with draw(). */
	box(c: Vec3, R: Mat3, size: Vec3, fill: string, stroke: string) {
		const h = mul(size, .5), corners: Vec3[] = [];
		for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push(add(c, mv(R, [sx * h[0], sy * h[1], sz * h[2]])));
		return [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]].map(f => {
			const ps = f.map(i => this.project(corners[i]));
			return { points: ps.map(p => [p[0], p[1]] as Vec2), depth: ps.reduce((a, p) => a + p[2], 0) / 4, fill, stroke };
		});
	}
	/** Draws faces back to front. Good enough for separate convex boxes. */
	draw(faces: { points: Vec2[]; depth: number; fill: string; stroke: string }[]) {
		for (const f of [...faces].sort((a, b) => b.depth - a.depth)) this.svg.polygon(f.points, f.fill, f.stroke);
	}
}
