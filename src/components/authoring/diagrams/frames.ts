/**
 * Coordinate frame diagrams, for guides/coordinate-frames and reference/coordinate-frames.
 * Each entry is drawn into an Svg of its own viewBox. `title` and `desc` become the SVG's
 * accessible name and description, and the Markdown export; `caption` is the default caption.
 */
import { Svg, Scene3D, C, DEG, IDENTITY, add, mul, mm, mv, rotY, rotZ, col, type Vec2, type Vec3, type Mat3 } from './lib';

export type DiagramDef = {
	width: number;
	height: number;
	title: string;
	desc: string;
	caption?: string;
	build: (svg: Svg) => void;
};

const m = (t: number) => `${t}m`;

const regionGlobal: DiagramDef = {
	width: 680, height: 290,
	title: 'Region and global coordinates',
	desc: 'A grid of regions seen from above at an angle. One region is outlined, with its +X (east), +Y (north) and +Z (up) axes at its south-west corner and a ruler along X from 0 to 256 metres. A dashed line from the grid origin to that corner is labelled llGetRegionCorner(). An object inside the region is at llGetPos() <180, 150, 24>; its global position is the region corner plus llGetPos().',
	caption: 'Region coordinates run 0–256 m from the region\'s south-west corner. Global coordinates add llGetRegionCorner(), the corner\'s position on the grid.',
	build(svg) {
		const s = new Scene3D(svg, { scale: .6, centre: [370, 180], target: [384, 256, 0] });
		for (let i = 0; i <= 3; i++) s.line([i * 256, 0, 0], [i * 256, 512, 0], C.grid, { width: 1.5 });
		for (let j = 0; j <= 2; j++) s.line([0, j * 256, 0], [768, j * 256, 0], C.grid, { width: 1.5 });
		const c: Vec3 = [256, 0, 0];
		for (let k = 32; k < 256; k += 32) {
			s.line(add(c, [k, 0, 0]), add(c, [k, 256, 0]), C.grid, { opacity: .45 });
			s.line(add(c, [0, k, 0]), add(c, [256, k, 0]), C.grid, { opacity: .45 });
		}
		const corners: Vec3[] = [[0, 0, 0], [256, 0, 0], [256, 256, 0], [0, 256, 0], [0, 0, 0]];
		for (let i = 0; i < 4; i++) s.line(add(c, corners[i]), add(c, corners[i + 1]), C.accent, { width: 2 });
		s.gizmo(c, IDENTITY, [56, 44, 44], { both: false, gap: 0 });
		s.text(add(c, [0, 80, 0]), [-8, 0], '+Y north', C.y, { anchor: 'end' });
		s.text(add(c, [0, 0, 80]), [0, -4], '+Z up', C.z, { anchor: 'middle' });
		s.ruler(c, [1, 0, 0], 0, 256, 32, 64, m, [0, -1, 0], C.x, 8, 30);
		s.dot([0, 0, 0], C.muted, 4);
		s.text([0, 0, 0], [0, -10], 'grid <0,0,0>', C.muted, { anchor: 'middle' });
		s.line([0, 0, 0], [250, 0, 0], C.purple, { width: 2, dash: '6 4' });
		s.text([110, 0, 0], [0, 18], 'llGetRegionCorner()', C.purple, { anchor: 'middle' });
		const obj = add(c, [180, 150, 24]);
		s.line(obj, [obj[0], obj[1], 0], C.muted, { dash: '2 3' });
		s.line(c, obj, C.fg, { width: 1.4, dash: '5 4' });
		s.dot(obj, C.fg);
		s.text(obj, [10, -4], 'llGetPos()  <180, 150, 24>', C.fg);
		s.text(obj, [10, 10], 'global = corner + llGetPos()', C.purple);
		s.text(add(c, [128, 256, 0]), [0, -8], 'this region', C.accent, { anchor: 'middle', bold: true });
		s.text([640, 384, 0], [0, 0], 'neighbour', C.muted, { anchor: 'middle' });
	},
};

const rootChild: DiagramDef = {
	width: 680, height: 270,
	title: 'Root and child prims',
	desc: 'A root prim above the region grid, rotated 35 degrees around Z, with its own grid and axes. A child prim sits at llGetLocalPos() <2.6, 1.2, 1.0>, drawn as dashed steps along the root\'s red X, green Y and blue Z axes. A ruler in metres runs along the root\'s X axis. A dashed line from the region origin to the root is labelled llGetRootPosition().',
	caption: 'llGetLocalPos() is measured along the root\'s own axes (the dashed steps), not the region\'s. The faint lines are the axes running through each frame.',
	build(svg) {
		const s = new Scene3D(svg, { scale: 30, centre: [330, 150], target: [4.2, 4, .8] });
		s.grid(0, 0, 8, 8);
		const O: Vec3 = [0, 0, 0];
		s.through(O, IDENTITY, 2.5, .3);
		s.gizmo(O, IDENTITY, [22, 18, 20]);
		s.text(O, [0, 22], 'region <0,0,0>', C.muted, { anchor: 'middle' });
		const root: Vec3 = [4.6, 3.6, 1.6], R = rotZ(35 * DEG), at = (p: Vec3) => add(root, mv(R, p));
		s.through(root, R, 4, .45);
		s.line(root, [root[0], root[1], 0], C.muted, { dash: '2 3' });
		for (let i = -1; i <= 3; i++) s.line(at([i, -1, 0]), at([i, 2, 0]), C.accent, { width: .8, opacity: .4 });
		for (let j = -1; j <= 2; j++) s.line(at([-1, j, 0]), at([3, j, 0]), C.accent, { width: .8, opacity: .4 });
		s.ruler(at([0, -1.2, 0]), col(R, 0), 0, 3, .5, 1, m, mul(col(R, 1), -1), C.x, .18, .5);
		s.line(O, root, C.fg, { width: 1.2, dash: '5 4' });
		s.text(mul(root, .5), [8, 14], 'llGetRootPosition()', C.fg);
		const off: Vec3 = [2.6, 1.2, 1];
		s.line(root, at([off[0], 0, 0]), C.x, { width: 1.4, dash: '3 3' });
		s.line(at([off[0], 0, 0]), at([off[0], off[1], 0]), C.y, { width: 1.4, dash: '3 3' });
		s.line(at([off[0], off[1], 0]), at(off), C.z, { width: 1.4, dash: '3 3' });
		const child = at(off);
		s.line(root, child, C.accent, { width: 2.4 });
		s.gizmo(root, R, [22, 18, 20]);
		s.dot(root, C.fg);
		s.dot(child, C.accent);
		s.text(root, [-12, -12], 'root', C.fg, { anchor: 'end', bold: true });
		s.text(child, [9, -3], 'child', C.accent, { bold: true });
		s.text(child, [9, 10], 'llGetLocalPos() <2.6, 1.2, 1.0>', C.accent);
	},
};

const rotateVector: DiagramDef = {
	width: 680, height: 230,
	title: 'Rotating a vector with * rot and / rot',
	desc: 'Two top-down panels of an object facing 35 degrees. Left: the local vector <2,0,0> times the object\'s rotation becomes a vector pointing along the object\'s forward axis in region axes. Right: a region-space offset target minus llGetPos(), divided by the rotation, becomes <2,0,0>, dead ahead for the object.',
	caption: '* rot turns a vector from the object\'s frame into region axes; / rot turns it back.',
	build(svg) {
		const a = 35 * DEG, S = 55;
		const panel = (ox: number, title: string, toRegion: boolean) => {
			const o: Vec2 = [ox, 140];
			svg.text([ox + 40, 22], title, C.fg, { anchor: 'middle', bold: true });
			svg.line([o[0] - 110, o[1]], [o[0] + 150, o[1]], C.x, { opacity: .3 });
			svg.line([o[0], o[1] + 70], [o[0], o[1] - 110], C.y, { opacity: .3 });
			const fx: Vec2 = [Math.cos(a), -Math.sin(a)], fy: Vec2 = [-Math.sin(a), -Math.cos(a)];
			svg.line([o[0] - fx[0] * 100, o[1] - fx[1] * 100], [o[0] + fx[0] * 150, o[1] + fx[1] * 150], C.x, { opacity: .55, dash: '2 3' });
			svg.gizmo(o, fx, 22, C.x, { gap: 4, head: 7, width: 1.6 });
			svg.gizmo(o, fy, 18, C.y, { gap: 4, head: 7, width: 1.6 });
			svg.circle(o, 4, C.fg);
			const v: Vec2 = [o[0] + 2 * S, o[1]], vr: Vec2 = [o[0] + 2 * S * fx[0], o[1] + 2 * S * fx[1]];
			if (toRegion) {
				svg.arrow(o, v, C.muted, { width: 2, dash: '5 4' });
				svg.arrow(o, vr, C.accent);
				svg.text([v[0] + 8, v[1] + 4], '<2,0,0> local', C.muted);
				svg.text([vr[0] + 8, vr[1] - 2], '<2,0,0> * rot', C.accent);
				svg.text([vr[0] + 8, vr[1] + 12], 'ahead, in region axes', C.muted);
				svg.arcArrow(o, 70, 0, -35, C.accent, 1.5);
			} else {
				svg.arrow(o, vr, C.muted, { width: 2, dash: '5 4' });
				svg.arrow(o, v, C.accent);
				svg.text([vr[0] + 8, vr[1] - 2], 'target − llGetPos()', C.muted);
				svg.text([v[0] + 8, v[1] - 4], '… / rot', C.accent);
				svg.text([v[0] + 8, v[1] + 10], '= <2,0,0> ahead', C.muted);
				svg.arcArrow(o, 70, -35, 0, C.accent, 1.5);
			}
			svg.text([o[0] - 10, o[1] + 28], 'object faces 35°', C.muted, { anchor: 'end' });
		};
		panel(130, 'local → region: v * rot', true);
		panel(460, 'region → local: v / rot', false);
	},
};

/**
 * The simulator's physics shape of a standing avatar, seen from the side (x forward, z up), with
 * the origin at the avatar's position: the centre of its agent box. From the Alchemy viewer's world
 * census (indra/newview/skcensusavatarshape.cpp, standingCorners), which measured the hull by
 * casting rays at avatars in-world. Each level is [back x, front x, z]; the widths don't change
 * with height, only the levels' heights do.
 */
function standingSilhouette(agentHeight: number): Vec2[] {
	const half = Math.max(agentHeight, .3) * .5 + .05;
	const lower = -half + .648;
	const widest = Math.min(Math.max(.333 + (half - .6444) * .66, lower + .01), half - .01);
	const levels: [number, number, number][] = [
		[-.051, .051, -half], [-.195, .225, Math.min(lower, widest - .01)], [-.226, .225, widest], [-.113, .113, half]];
	return [...levels.map(([, f, z]) => [f, z] as Vec2), ...levels.reverse().map(([b, , z]) => [b, z] as Vec2)];
}

const attachment: DiagramDef = {
	width: 680, height: 300,
	title: 'Attachments: what the simulator sees',
	desc: "A side view of the simulator's physics shape of a standing avatar, a faceted hull narrow at the feet and widest at the shoulders, with the avatar's position at its centre and its axes: +X forward, +Z up. To the simulator, the avatar's position is every attachment's attach point: the attachment root is that position plus its llGetLocalPos() offset, and llGetPos() and llGetRot() report the avatar. A faint waving figure is the animated pose the viewer renders; a dashed copy of the attachment sits on its raised hand, the same offset from the real attach point, which only the viewer knows.",
	caption: "The simulator has no skeleton: to it, every attach point is the avatar's position, and llGetPos() and llGetRot() report the avatar. llGetLocalPos() is the attachment's offset from its attach point; the viewer applies the same offset from the attach point on the animated skeleton.",
	build(svg) {
		const ground = 272, x = 255, S = 150, agentHeight = 1.189;
		const outline = standingSilhouette(agentHeight);
		const foot = outline[0][1];
		const P = (p: Vec2): Vec2 => [x + p[0] * S, ground - (p[1] - foot) * S];
		svg.line([90, ground], [560, ground], C.grid, { width: 1.5 });
		// What the simulator sees: the measured hull.
		svg.polygon(outline.map(P), C.surface, C.fg, 1.5);
		// The rendered pose, waving: only the viewer knows it. Side view, facing +X.
		const limb = (pts: Vec2[], width = 7) => {
			for (let i = 1; i < pts.length; i++) svg.line(P(pts[i - 1]), P(pts[i]), C.muted, { width, opacity: .55 });
		};
		const shoulder: Vec2 = [0, .36], hip: Vec2 = [0, -.04], elbow: Vec2 = [.2, .5], wrist: Vec2 = [.36, .7];
		limb([[.07, -.64], [.05, -.33], hip], 8);
		limb([[-.05, -.64], [-.03, -.33], hip], 8);
		limb([hip, shoulder], 12);
		limb([shoulder, [-.04, .12], [0, -.1]]);
		limb([shoulder, elbow, wrist]);
		svg.circle(P([.02, .5]), .085 * S, C.bg, C.muted, 2);
		svg.text([x, ground + 18], `physics shape for an agent height (z of llGetAgentSize) of ${agentHeight} m`, C.muted, { anchor: 'middle' });
		// The hand's rotation: the forearm's direction, measured from the body's up (screen angle, clockwise positive).
		const handPt = P(wrist), e = P(elbow);
		const handDeg = Math.atan2(handPt[0] - e[0], e[1] - handPt[1]) / DEG;
		const turn = (v: Vec2): Vec2 => {
			const c = Math.cos(handDeg * DEG), s = Math.sin(handDeg * DEG);
			return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
		};
		// The point `d` along the direction of v from p.
		const turnFrom = (p: Vec2, v: Vec2, d: number): Vec2 => {
			const n = Math.hypot(v[0], v[1]) || 1;
			return [p[0] + v[0] / n * d, p[1] + v[1] / n * d];
		};
		// The left hand, palm towards the viewer, fingers along the forearm. Its attach point's axes, as
		// tested in-world: +X along the thumb (backwards here), +Y from the wrist to the fingertips, +Z out
		// of the back of the hand (into the screen here).
		svg.open(`transform="translate(${handPt[0]},${handPt[1]}) rotate(${handDeg})" style="opacity:.55"`);
		svg.rect(-8, -30, 16, 30, { fill: 'var(--dg-muted)' }, 7);
		svg.path('M-7,-6 L-11,-12', { stroke: 'var(--dg-muted)', 'stroke-width': 4, 'stroke-linecap': 'round' });
		svg.close();
		// The attachment's stored offset from its attach point, <0.4, 0, 0>: simulator data, in the attach point's axes.
		const offLen = .4 * S;
		// Viewer: the attach point on the animated hand, turned with it, and the same offset along its +X.
		const offH = turn([-offLen, 0]), ghost: Vec2 = [handPt[0] + offH[0], handPt[1] + offH[1]];
		svg.gizmo(handPt, turn([-1, 0]), 28, C.x, { head: 8, width: 2, gap: 8 });
		svg.gizmo(handPt, turn([0, -1]), 28, C.y, { head: 8, width: 2, gap: 8 });
		svg.circle(handPt, 6, C.bg, C.z, 2);
		svg.path(`M${handPt[0] - 3.5},${handPt[1] - 3.5} L${handPt[0] + 3.5},${handPt[1] + 3.5} M${handPt[0] + 3.5},${handPt[1] - 3.5} L${handPt[0] - 3.5},${handPt[1] + 3.5}`, { stroke: 'var(--dg-z)', 'stroke-width': 1.8 });
		svg.arrow(turnFrom(handPt, offH, 30), turnFrom(handPt, offH, offLen - 12), C.accent, { width: 1.6, dash: '3 3', head: 8 });
		svg.open(`transform="translate(${ghost[0]},${ghost[1]}) rotate(${handDeg})"`);
		svg.rect(-10, -10, 20, 20, { fill: 'none', stroke: 'var(--dg-accent)', 'stroke-width': 2, 'stroke-dasharray': '4 3' }, 3);
		svg.close();
		svg.text([ghost[0] - 18, ghost[1] - 10], 'where the viewer draws it', C.muted, { bold: true, anchor: 'end' });
		svg.text([ghost[0] - 18, ghost[1] + 4], "<0.4, 0, 0> along the hand's +X", C.accent, { anchor: 'end' });
		svg.text([ghost[0] - 18, ghost[1] + 18], '(the thumb), viewer only', C.purple, { anchor: 'end' });
		svg.text([handPt[0] + 34, handPt[1] - 4], 'ATTACH_LHAND, animated', C.purple);
		svg.text([handPt[0] + 34, handPt[1] + 10], '+Y fingers, +Z into the screen', C.muted);
		// Simulator: the avatar's position stands in for every attach point, and the same offset applies from it.
		const centre = P([0, 0]), sim: Vec2 = [centre[0] + offLen, centre[1]];
		svg.gizmo(centre, [1, 0], 30, C.x);
		svg.gizmo(centre, [0, -1], 30, C.z);
		svg.arrow([centre[0] + 34, centre[1]], [sim[0] - 12, sim[1]], C.accent, { width: 2.4, head: 10 });
		svg.circle(centre, 5.5, C.purple, C.bg, 2);
		svg.rect(sim[0] - 10, sim[1] - 10, 20, 20, { fill: 'var(--dg-accent)', stroke: 'var(--dg-bg)', 'stroke-width': 2 }, 3);
		svg.text([sim[0] + 18, sim[1] - 18], 'attachment root,', C.accent, { bold: true });
		svg.text([sim[0] + 18, sim[1] - 4], 'as the simulator sees it', C.accent, { bold: true });
		svg.text([sim[0] + 18, sim[1] + 10], 'avatar position + <0.4, 0, 0>', C.accent);
		svg.text([sim[0] + 18, sim[1] + 24], 'along the avatar\'s +X', C.accent);
		svg.text([centre[0] + 6, centre[1] + 18], '+X forward', C.x);
		svg.text([centre[0] + 6, centre[1] - 38], '+Z up', C.z);
		svg.text([centre[0] - 50, centre[1] - 4], 'avatar position', C.fg, { anchor: 'end', bold: true });
		svg.text([centre[0] - 50, centre[1] + 10], "= the simulator's attach point", C.purple, { anchor: 'end' });
		svg.text([centre[0] - 50, centre[1] + 24], 'llGetPos(), llGetRot()', C.fg, { anchor: 'end' });
	},
};

const localFlag: DiagramDef = {
	width: 680, height: 230,
	title: 'The local flag of physics functions',
	desc: 'Two top-down panels of an object turned 35 degrees. With llApplyImpulse(<1,0,0>, FALSE) the push points due east along the region\'s X axis. With TRUE it points along the object\'s own +X.',
	caption: 'With FALSE the vector is in region axes, whichever way the object faces. With TRUE it is in the object\'s own axes.',
	build(svg) {
		const a = 35 * DEG;
		const panel = (ox: number, title: string, local: boolean) => {
			const o: Vec2 = [ox, 130];
			svg.text([ox, 22], title, C.fg, { anchor: 'middle', bold: true });
			svg.line([o[0] - 140, o[1]], [o[0] + 150, o[1]], C.x, { opacity: .3 });
			svg.line([o[0], o[1] + 60], [o[0], o[1] - 95], C.y, { opacity: .3 });
			svg.open(`transform="translate(${o[0]},${o[1]}) rotate(-35)"`);
			svg.rect(-28, -18, 56, 36, { fill: 'var(--dg-surface)', stroke: 'var(--dg-fg)', 'stroke-width': 1.5 }, 4);
			svg.path('M14,-9 L24,0 L14,9', { fill: 'none', stroke: 'var(--dg-fg)', 'stroke-width': 1.5 });
			svg.close();
			const d: Vec2 = local ? [Math.cos(a), -Math.sin(a)] : [1, 0];
			const end: Vec2 = [o[0] + d[0] * 110, o[1] + d[1] * 110];
			svg.arrow([o[0] + d[0] * 40, o[1] + d[1] * 40], end, C.accent, { width: 4, head: 14 });
			svg.text(local ? [end[0] - 6, end[1] - 10] : [end[0] + 8, end[1] + 16], local ? 'along object +X' : 'due east', C.accent, { anchor: local ? 'end' : 'start' });
			svg.text([ox, 212], `llApplyImpulse(<1,0,0>, ${local ? 'TRUE' : 'FALSE'})`, C.fg, { anchor: 'middle' });
		};
		panel(160, 'FALSE: region axes', false);
		panel(500, 'TRUE: object axes', true);
	},
};

const hud: DiagramDef = {
	width: 700, height: 330,
	title: 'HUD attachment frame',
	desc: 'The viewer window as a rectangle with the eight HUD attach points: TOP_LEFT, TOP_CENTER, TOP_RIGHT, CENTER_1 and CENTER_2 in the middle, BOTTOM_LEFT, BOTTOM and BOTTOM_RIGHT. At the centre, +Y points left, +Z points up and +X points into the screen. The window is about 1 unit tall, from Z −0.5 to +0.5.',
	caption: 'Each HUD attach point is its own origin in the same frame. The camera looks along +X, so +X points into the screen; the window is about 1 unit tall and its width depends on the aspect ratio.',
	build(svg) {
		svg.rect(70, 20, 560, 290, { fill: 'none', stroke: 'var(--dg-fg)', 'stroke-width': 2 }, 10);
		svg.text([350, 14], 'viewer window', C.muted, { anchor: 'middle' });
		const pts: [string, number, number, 'start' | 'middle' | 'end'][] = [
			['TOP_LEFT', 90, 40, 'start'], ['TOP_CENTER', 350, 40, 'middle'], ['TOP_RIGHT', 610, 40, 'end'],
			['CENTER_1 / CENTER_2', 350, 165, 'middle'],
			['BOTTOM_LEFT', 90, 290, 'start'], ['BOTTOM', 350, 290, 'middle'], ['BOTTOM_RIGHT', 610, 290, 'end']];
		pts.forEach(([name, x, y, anchor], i) => {
			if (i !== 3) svg.dot([x, y], C.accent);
			svg.text([x + (anchor === 'start' ? 12 : anchor === 'end' ? -12 : 0), i < 3 ? y + 16 : i === 3 ? y + 80 : y - 10], name, C.accent, { anchor });
		});
		svg.gizmo([350, 165], [-1, 0], 62, C.y);
		svg.gizmo([350, 165], [0, -1], 62, C.z);
		svg.circle([350, 165], 6, 'none', C.x, 2);
		svg.path('M346,161 L354,169 M354,161 L346,169', { stroke: 'var(--dg-x)', 'stroke-width': 1.8 });
		svg.text([282, 184], '+Y left', C.y, { anchor: 'end' });
		svg.text([358, 104], '+Z up', C.z);
		svg.text([362, 160], '+X into the screen', C.x);
		svg.text([660, 24], 'Z +0.5', C.muted);
		svg.text([660, 168], 'Z 0', C.muted);
		svg.text([660, 312], 'Z −0.5', C.muted);
	},
};

const stUv: DiagramDef = {
	width: 680, height: 270,
	title: 'Touch ST and UV coordinates',
	desc: 'Two copies of one face. Left, llDetectedTouchST: S runs right and T up from 0,0 at the bottom-left corner to 1,1 at the top-right, unaffected by texture settings; the touch is at <0.68, 0.65>. Right, llDetectedTouchUV: the texture\'s tiles, repeated twice and rotated 20 degrees, are drawn over the face and labelled by whole UV, so the same touch reads in texture space.',
	caption: 'ST is fixed to the face, 0–1 from the bottom-left corner. UV is in the texture\'s space, so repeats and rotation change it.',
	build(svg) {
		const face = (ox: number, title: string, uv: boolean) => {
			const X = ox - 95, Y = 40, W = 190;
			svg.text([ox, 22], title, C.fg, { anchor: 'middle', bold: true });
			const clip = svg.uid('clip');
			svg.raw(`<clipPath id="${clip}"><rect x="${X}" y="${Y}" width="${W}" height="${W}"/></clipPath>`);
			svg.open(`clip-path="url(#${clip})"`);
			if (uv) {
				svg.open(`transform="translate(${X},${Y + W}) rotate(-20)"`);
				for (let i = -2; i < 4; i++) for (let j = -2; j < 4; j++) {
					svg.rect(i * W / 2, -(j + 1) * W / 2, W / 2, W / 2, { fill: (i + j + 20) % 2 ? 'var(--dg-surface)' : 'none', stroke: 'var(--dg-accent)', 'stroke-width': 1, opacity: .8 });
					svg.text([i * W / 2 + 5, -j * W / 2 - 5], `${i},${j}`, C.accent);
				}
				svg.close();
			} else {
				for (let k = 1; k < 4; k++) {
					svg.line([X + W * k / 4, Y], [X + W * k / 4, Y + W], C.grid);
					svg.line([X, Y + W * k / 4], [X + W, Y + W * k / 4], C.grid);
				}
			}
			svg.close();
			svg.rect(X, Y, W, W, { fill: 'none', stroke: 'var(--dg-fg)', 'stroke-width': 2 });
			if (!uv) {
				svg.gizmo([X, Y + W], [1, 0], 100, C.x, { both: false, gap: 0, width: 2.6 });
				svg.gizmo([X, Y + W], [0, -1], 100, C.y, { both: false, gap: 0, width: 2.6 });
				svg.text([X + 100, Y + W + 16], '+S', C.x, { anchor: 'middle' });
				svg.text([X - 8, Y + W - 96], '+T', C.y, { anchor: 'end' });
				svg.text([X - 6, Y + W + 14], '0,0', C.fg, { anchor: 'end' });
				svg.text([X + W + 6, Y - 4], '1,1', C.fg);
			}
			const tp: Vec2 = [X + W * .68, Y + W * .35];
			svg.dot(tp, C.fg, 6);
			svg.text([tp[0] - 10, tp[1] - 10], uv ? 'UV in texture tiles' : 'ST = <0.68, 0.65>', C.fg, { anchor: 'middle' });
			svg.text([ox, Y + W + 34], uv ? 'tiles labelled by whole UV · repeats 2, rotation 20°' : 'unaffected by texture settings', C.muted, { anchor: 'middle' });
		};
		face(170, 'llDetectedTouchST', false);
		face(510, 'llDetectedTouchUV', true);
	},
};

const textureTransforms: DiagramDef = {
	width: 680, height: 330,
	title: 'Blinn-Phong and PBR texture transforms',
	desc: 'Two texture squares seen from above. Blinn-Phong: the origin 0,0 is at the bottom-left, +U right and +V up; the pivot is the centre, positive rotation is counter-clockwise, offsets are from the centre, and the order is rotate, then scale, then offset. PBR (glTF): the origin is at the top-left, +U right and +V down; the pivot is the top-left corner, positive rotation is clockwise, the V offset has the opposite sign, and the order is scale, then rotate, then offset.',
	caption: 'Rotation and V offset have opposite signs, the pivot moves from the centre to the top-left corner, and scale and rotation swap order, so a rotated, non-uniform repeat only converts exactly at multiples of 90°.',
	build(svg) {
		const square = (ox: number, pbr: boolean) => {
			const X = ox - 95, Y = 36, W = 190;
			for (let i = 1; i < 4; i++) {
				svg.line([X + W * i / 4, Y], [X + W * i / 4, Y + W], C.grid);
				svg.line([X, Y + W * i / 4], [X + W, Y + W * i / 4], C.grid);
			}
			svg.rect(X, Y, W, W, { fill: 'none', stroke: 'var(--dg-fg)', 'stroke-width': 2 });
			svg.text([ox, Y - 16], pbr ? 'PBR (glTF): PRIM_GLTF_*' : 'Blinn-Phong: PRIM_TEXTURE', C.fg, { anchor: 'middle', bold: true });
			const o: Vec2 = [X, pbr ? Y : Y + W];
			svg.gizmo(o, [1, 0], 100, C.x, { both: false, gap: 0, width: 2.6 });
			svg.gizmo(o, [0, pbr ? 1 : -1], 100, C.y, { both: false, gap: 0, width: 2.6 });
			svg.text(pbr ? [o[0] + 100, o[1] - 8] : [o[0] + 106, o[1] - 6], '+U', C.x, { anchor: pbr ? 'middle' : 'start' });
			svg.text([o[0] - 8, o[1] + (pbr ? 100 : -96)], pbr ? '+V down' : '+V up', C.y, { anchor: 'end' });
			svg.circle(o, 4.5, C.fg);
			svg.text([o[0] - 8, o[1] + (pbr ? -6 : 16)], '0,0', C.fg, { anchor: 'end' });
			const pivot: Vec2 = pbr ? [X, Y] : [X + W / 2, Y + W / 2];
			svg.circle(pivot, 7, 'none', C.accent, 2.5);
			svg.circle(pivot, 2.5, C.accent);
			if (pbr) svg.arcArrow(pivot, 70, 12, 72, C.accent, 2.5);
			else svg.arcArrow(pivot, 52, -20, -110, C.accent, 2.5);
			svg.text(pbr ? [pivot[0] + 56, pivot[1] + 66] : [pivot[0] + 8, pivot[1] - 60], pbr ? '+rot clockwise' : '+rot counter-clockwise', C.accent, { anchor: pbr ? 'start' : 'middle' });
			svg.text([pivot[0] + 12, pivot[1] + 20], pbr ? 'pivot: corner' : 'pivot: centre', C.accent);
			svg.text([ox, Y + W + 22], pbr ? 'offset V: −Blinn-Phong value' : 'offset from the centre', C.muted, { anchor: 'middle' });
			const steps = pbr ? ['scale', 'rotate', 'offset'] : ['rotate', 'scale', 'offset'];
			svg.text([X, Y + W + 52], 'order', C.muted);
			steps.forEach((step, i) => {
				const x = X + 48 + i * 52;
				svg.rect(x - 4, Y + W + 38, 46, 20, { fill: 'none', stroke: 'var(--dg-grid)' }, 4);
				svg.text([x + 19, Y + W + 52], step, C.fg, { anchor: 'middle' });
				if (i) svg.text([x - 7, Y + W + 52], '→', C.muted, { anchor: 'middle' });
			});
		};
		square(170, false);
		square(510, true);
	},
};

// The tank: hull (the root) on a slope, a turret that yaws around the hull's up axis, and a
// barrel that pitches around the turret's left axis. Every transform below is the LSL one.
type TankOpts = { hull: boolean; hullRot: Mat3; yaw: Mat3; pitch: Mat3; turret: boolean };
const TURRET_BASE: Vec3 = [-.5, 0, .6];
function drawTank(s: Scene3D, o: TankOpts) {
	const hullPos: Vec3 = [0, 0, .5];
	const W = (local: Vec3) => add(hullPos, mv(o.hullRot, local));
	// LSL: PRIM_POS_LOCAL turretBase + (offset * pitch) * yaw, PRIM_ROT_LOCAL pitch * yaw.
	const barrelPos = add(TURRET_BASE, mv(o.yaw, mv(o.pitch, [.95, 0, 0])));
	const barrelRot = mm(o.yaw, o.pitch);
	const faces = [];
	if (o.hull) faces.push(...s.box(W([0, 0, 0]), o.hullRot, [3, 1.9, .7], C.surface, C.fg));
	if (o.turret) faces.push(...s.box(W(add(TURRET_BASE, [0, 0, -.05])), mm(o.hullRot, o.yaw), [1.3, 1.1, .4], C.tealFill, C.teal));
	faces.push(...s.box(W(barrelPos), mm(o.hullRot, barrelRot), [1.7, .17, .17], C.accentFill, C.accent));
	s.draw(faces);
	const pivot = W(TURRET_BASE);
	const muzzle = W(add(TURRET_BASE, mv(o.yaw, mv(o.pitch, [1.8, 0, 0]))));
	if (o.turret) {
		s.line(pivot, W(add(TURRET_BASE, [2.1, 0, 0])), C.fg, { width: 1.2, dash: '4 4', opacity: .7 });
		s.line(pivot, W(add(TURRET_BASE, mv(o.yaw, [2.1, 0, 0]))), C.teal, { width: 1.4, dash: '4 4' });
	}
	s.dot(pivot, C.purple, 4.5);
	s.dot(muzzle, C.fg, 5);
	return { W, pivot, muzzle };
}
const TANK_HULL = mm(rotZ(15 * DEG), rotY(-8 * DEG));
const TANK_YAW = rotZ(22 * DEG);
const TANK_PITCH = rotY(-20 * DEG);

const tank: DiagramDef = {
	width: 680, height: 350,
	title: 'Tank: hull, turret and barrel frames',
	desc: 'A tank on a slope. The hull is the root prim, its rotation llGetRootRotation(). The turret sits on the hull at turretBase and is turned (yaw) around the hull\'s up axis; dashed lines show hull forward and turret forward. The barrel pivots at turretBase and is tilted (pitch) and then turned with the turret. The muzzle at the barrel\'s end is where a projectile is rezzed.',
	caption: 'The hull is the root, on a slope. The turret yaws around the hull\'s up axis; the barrel pitches around the turret\'s left axis, then turns with it.',
	build(svg) {
		const s = new Scene3D(svg, { scale: 80, centre: [300, 200], target: [.3, 0, 1] });
		s.grid(-2, -2, 3, 2);
		const t = drawTank(s, { hull: true, hullRot: TANK_HULL, yaw: TANK_YAW, pitch: TANK_PITCH, turret: true });
		s.text(t.W(add(TURRET_BASE, [2.1, 0, 0])), [6, 10], 'hull forward', C.muted);
		s.text(t.W(add(TURRET_BASE, mv(TANK_YAW, [2.1, 0, 0]))), [6, 4], 'turret forward', C.teal);
		const front = t.W([1.5, -.95, -.35]);
		s.text(front, [8, 16], 'hull = root', C.fg, { bold: true });
		s.text(front, [8, 30], 'llGetRootRotation()', C.muted);
		s.gizmo(t.W([.9, .55, .36]), TANK_HULL, [26, 20, 0]);
		const turretTop = t.W(add(TURRET_BASE, [0, 0, .16]));
		s.gizmo(turretTop, mm(TANK_HULL, TANK_YAW), [0, 22, 28]);
		s.text(turretTop, [-30, -34], 'turret', C.teal, { anchor: 'end', bold: true });
		s.text(turretTop, [-30, -20], 'yaw around the hull\'s up', C.muted, { anchor: 'end' });
		s.text(t.pivot, [-16, 8], 'turretBase', C.purple, { anchor: 'end' });
		s.text(t.muzzle, [10, -18], 'barrel', C.accent, { bold: true });
		s.text(t.muzzle, [10, -4], 'pitch, then yaw', C.muted);
		s.text(t.muzzle, [10, 10], 'muzzle: rez point', C.fg);
		const O: Vec3 = [-1.8, -1.8, 0];
		s.gizmo(O, IDENTITY, [28, 28, 28], { both: false, gap: 0 });
		s.text(O, [0, 18], 'region', C.muted, { anchor: 'middle' });
	},
};

const tankSteps: DiagramDef = {
	width: 680, height: 230,
	title: 'Building the barrel\'s transform step by step',
	desc: 'Four small views of the same tank. 1: the barrel offset <0.95,0,0> times pitch tilts it around the pivot. 2: times yaw turns it with the turret. 3: plus turretBase places it on the hull; this is PRIM_POS_LOCAL. 4: times llGetRootRotation() plus llGetRootPosition() puts it in the region, with the hull on its slope.',
	caption: 'Read LSL rotations left to right, innermost first: offset * pitch, then * yaw, then + turretBase gives PRIM_POS_LOCAL; * llGetRootRotation() + llGetRootPosition() gives the region position.',
	build(svg) {
		const steps: { label: string; formula: string; o: TankOpts }[] = [
			{ label: '1. tilt', formula: 'offset * pitch', o: { hull: false, hullRot: IDENTITY, yaw: IDENTITY, pitch: TANK_PITCH, turret: false } },
			{ label: '2. turn', formula: '… * yaw', o: { hull: false, hullRot: IDENTITY, yaw: TANK_YAW, pitch: TANK_PITCH, turret: true } },
			{ label: '3. on the hull', formula: 'turretBase + …', o: { hull: true, hullRot: IDENTITY, yaw: TANK_YAW, pitch: TANK_PITCH, turret: true } },
			{ label: '4. in the region', formula: '… * rootRot + rootPos', o: { hull: true, hullRot: TANK_HULL, yaw: TANK_YAW, pitch: TANK_PITCH, turret: true } },
		];
		steps.forEach((step, i) => {
			const cx = 85 + i * 170;
			// A different camera yaw from the main tank diagram, so that the turret's 22° yaw does
			// not line up with the view and flatten it while the hull is unrotated.
			const s = new Scene3D(svg, { scale: 34, centre: [cx, 120], target: [.3, 0, 1], yaw: -45 * DEG });
			s.grid(-1.5, -1, 1.5, 1, .5, { opacity: .6 });
			drawTank(s, step.o);
			svg.text([cx, 22], step.label, C.fg, { anchor: 'middle', bold: true });
			svg.text([cx, 205], step.formula, C.accent, { anchor: 'middle' });
			if (i) svg.text([cx - 85, 120], '→', C.muted, { anchor: 'middle', size: 16 });
		});
	},
};

export const frames: Record<string, DiagramDef> = {
	'frames/region-global': regionGlobal,
	'frames/root-child': rootChild,
	'frames/rotate-vector': rotateVector,
	'frames/attachment': attachment,
	'frames/local-flag': localFlag,
	'frames/hud': hud,
	'frames/st-uv': stUv,
	'frames/texture-transforms': textureTransforms,
	'frames/tank': tank,
	'frames/tank-steps': tankSteps,
};

