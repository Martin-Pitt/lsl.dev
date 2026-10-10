/**
 * PROTOTYPE data for E (/prototypes/features/e/) and F (/prototypes/landing/): the LSL Portal's
 * "LSL Features by category" column (public/wiki-source/lsl-portal-079327e8.txt) mapped onto
 * lsl.dev pages. Temporary; see docs/prototypes/features-index.md.
 *
 * Refs: `f:<feature>`, `c:<category>`, `g:<constant group>`, or a `/path/`. A topic with no `to`
 * is a gap: lsl.dev has no page for it. Unknown features, categories or groups fail the build.
 */
import { catalog, constantGroupHref, constantsInGroup } from '../catalog';
import { categoryLink } from '../categories';
import { featurePageMap, featurePages, featureHref } from '../features';

export type Topic = { label: string; to?: string; also?: string[]; children?: Topic[] };
export type Link = { href: string; label: string; kind: 'feature' | 'category' | 'group' | 'page' };

const categoryIds = new Set(catalog.categories.map(c => c.id));
/** `a|b`: the first ref whose feature exists (lets a topic point at a feature page that may not exist yet). */
export function resolve(ref: string): Link {
	if (ref.includes('|')) { const opts = ref.split('|'); return resolve(opts.find(r => !r.startsWith('f:') || featurePageMap.has(r.slice(2))) ?? opts[opts.length - 1]); }
	if (ref.startsWith('/')) return { href: ref, label: ref, kind: 'page' };
	const [kind, id] = [ref.slice(0, 1), ref.slice(2)];
	if (kind === 'f') {
		const f = featurePageMap.get(id);
		if (!f) throw new Error(`portal-topics: unknown feature "${id}"`);
		return { href: featureHref(id), label: f.title, kind: 'feature' };
	}
	if (kind === 'c') {
		if (!categoryIds.has(id)) throw new Error(`portal-topics: unknown category "${id}"`);
		const l = categoryLink(id);
		return { href: l.href, label: l.label, kind: 'category' };
	}
	if (kind === 'g') {
		if (!constantsInGroup(id).length) throw new Error(`portal-topics: unknown or empty constant group "${id}"`);
		return { href: constantGroupHref(id), label: id, kind: 'group' };
	}
	throw new Error(`portal-topics: bad ref "${ref}"`);
}

/** The portal's flat A-Z (left sub-column). "Needs Example" (a wiki maintenance list) is left out. */
const rawAZ: Topic[] = [
	{ label: 'Alpha', to: 'f:textures', also: ['g:AlphaMode'] },
	{ label: 'Animation', to: 'c:avatar_animation', also: ['c:object_animation'] },
	{ label: 'Animesh', to: 'f:animesh', also: ['c:object_animation'] },
	{ label: 'Attachments', to: 'c:attachments', also: ['g:AttachPoint'] },
	{ label: 'Avatars', to: 'f:avatar', also: ['c:avatar'] },
	{ label: 'Camera', to: 'f:camera', also: ['g:CameraParam'] },
	{ label: 'Collision', to: 'f:physics', also: ['c:detected'] },
	{ label: 'Color', to: 'f:textures' },
	{ label: 'Combat', to: 'f:combat', also: ['g:DamageType'] },
	{ label: 'Communications', to: 'f:communications', also: ['c:chat'] },
	{ label: 'Controls', to: 'f:input', also: ['g:ControlButton'] },
	{ label: 'Dataserver', to: 'c:dataserver' },
	{ label: 'Dialog', to: 'f:dialog' },
	{ label: 'Events', to: 'f:events' },
	{ label: 'Experience', to: 'f:experience', also: ['c:experience_data'] },
	{ label: 'Face', to: 'f:textures', also: ['g:Faces'] },
	{ label: 'Group' },
	{ label: 'Inventory', to: 'f:inventory|c:prim_inventory', also: ['c:prim_inventory', 'g:InventoryType'] },
	{ label: 'JSON', to: 'c:json', also: ['f:data-transmission'] },
	{ label: 'Light', to: 'f:effects' },
	{ label: 'Linksets', to: 'f:linkset', also: ['g:Link'] },
	{ label: 'Linkset Data', to: 'c:linkset_data', also: ['f:data-storage'] },
	{ label: 'Lists', to: 'c:list', also: ['f:data-transmission'] },
	{ label: 'Math', to: 'f:math', also: ['c:math'] },
	{ label: 'Money', to: 'f:money' },
	{ label: 'Parcels & Regions', to: 'f:land', also: ['c:parcel', 'c:region'] },
	{ label: 'Pathfinding', to: 'f:pathfinding' },
	{ label: 'Permissions', to: 'c:permissions', also: ['g:ScriptPermission'] },
	{ label: 'Physics', to: 'f:physics' },
	{ label: 'Prims', to: 'f:prims', also: ['g:PrimParam'] },
	{ label: 'Rotation', to: 'c:quaternion', also: ['f:math'] },
	{ label: 'Scripts', to: 'c:script' },
	{ label: 'Sensor', to: 'c:sensor' },
	{ label: 'Sound', to: 'f:sound' },
	{ label: 'Text', to: 'c:string', children: [
		{ label: 'Chat', to: 'c:chat' },
		{ label: 'Notecard', to: 'c:notecard' },
		{ label: 'String', to: 'c:string' },
	] },
	{ label: 'Teleport', to: 'c:teleport' },
	{ label: 'Textures & Materials', to: 'f:textures' },
	{ label: 'Time', to: 'c:time' },
	{ label: 'Vehicle', to: 'c:vehicles', also: ['g:VehicleType'] },
	{ label: 'Video', to: 'c:parcel_media', also: ['c:prim_media'] },
	{ label: 'World', to: 'c:region', also: ['f:environments'] },
];

/** The portal's nested topic tree (right sub-column). */
const rawTree: Topic[] = [
	{ label: 'Avatars', to: 'f:avatar', children: [
		{ label: 'Animation', to: 'c:avatar_animation' },
		{ label: 'Attachment', to: 'c:attachments' },
		{ label: 'Camera', to: 'f:camera' },
		{ label: 'Controls', to: 'f:input' },
		{ label: 'Sit', to: 'c:sit' },
	] },
	{ label: 'Communications', to: 'f:communications', children: [
		{ label: 'Chat', to: 'c:chat' },
		{ label: 'Dialog', to: 'f:dialog' },
		{ label: 'HTTP', to: 'c:web' },
		{ label: 'XML-RPC' },
	] },
	{ label: 'Detection', to: 'c:detected', children: [
		{ label: 'Collision', to: 'f:physics' },
		{ label: 'Sensor', to: 'c:sensor' },
		{ label: 'Touch', to: 'c:touch' },
	] },
	{ label: 'Functions', to: '/functions/', children: [{ label: 'God Mode' }] },
	{ label: 'Inventory', to: 'f:inventory|c:prim_inventory', children: [
		{ label: 'Creator' },
		{ label: 'Notecard', to: 'c:notecard' },
		{ label: 'Owner' },
	] },
	{ label: 'Media', to: 'c:media', children: [
		{ label: 'Prim Media', to: 'c:prim_media' },
		{ label: 'Sound', to: 'f:sound' },
		{ label: 'Video', to: 'c:parcel_media' },
	] },
	{ label: 'Money', to: 'f:money' },
	{ label: 'Movement', to: 'f:movement', children: [
		{ label: 'Physics', to: 'f:physics', children: [{ label: 'Damping' }, { label: 'Hover' }] },
		{ label: 'Pathfinding', to: 'f:pathfinding' },
		{ label: 'Rotation', to: 'c:quaternion' },
	] },
	{ label: 'Object', to: 'c:object', children: [
		{ label: 'Animesh', to: 'f:animesh' },
		{ label: 'Dataserver', to: 'c:dataserver' },
		{ label: 'Linkset Data', to: 'c:linkset_data' },
		{ label: 'Linksets', to: 'f:linkset' },
		{ label: 'Vehicle', to: 'c:vehicles' },
	] },
	{ label: 'Permissions', to: 'c:permissions', children: [
		{ label: 'Asset', to: 'c:asset_permissions' },
		{ label: 'Script', to: 'g:ScriptPermission' },
	] },
	{ label: 'Prims', to: 'f:prims', children: [
		{ label: 'Effects', to: 'f:effects', children: [{ label: 'Light' }, { label: 'Particles', to: 'c:particles' }] },
		{ label: 'Face', to: 'g:Faces', children: [
			{ label: 'Alpha', to: 'g:AlphaMode' },
			{ label: 'Color', to: 'f:textures' },
			{ label: 'Textures & Materials', to: 'f:textures' },
		] },
	] },
	{ label: 'Parcels & Regions', to: 'f:land', children: [
		{ label: 'Region', to: 'c:region' },
		{ label: 'Ground', to: 'g:GroundTextureParam' },
		{ label: 'Parcel', to: 'c:parcel' },
		{ label: 'Security', to: 'c:land_moderation' },
		{ label: 'Time', to: 'c:time' },
	] },
	{ label: 'Script', to: 'c:script', children: [
		{ label: 'Error', children: [{ label: 'Math Errors' }] },
		{ label: 'Events', to: 'f:events' },
		{ label: 'Keywords', to: '/controls/' },
		{ label: 'Math', to: 'f:math' },
		{ label: 'Types', to: '/types/' },
	] },
];

function walk(ts: Topic[], path: string[] = []): { topic: Topic; path: string[] }[] {
	return ts.flatMap(t => [{ topic: t, path: [...path, t.label] }, ...walk(t.children ?? [], [...path, t.label])]);
}
const all = [...walk(rawAZ), ...walk(rawTree)];
// Resolve every ref once at build time so a typo fails the build.
for (const { topic } of all) for (const r of [topic.to, ...(topic.also ?? [])]) if (r) resolve(r);

/** Topics with no lsl.dev page, as "Parent › Child" paths, de-duplicated. */
export const gaps = [...new Set(all.filter(x => !x.topic.to).map(x => x.path.join(' › ')))];
/** lsl.dev features that no portal topic points at; the build fails until each is placed. */
const referenced = new Set(all.flatMap(x => [x.topic.to, ...(x.topic.also ?? [])]).flatMap(r => r ? [resolve(r)] : []).filter(l => l.kind === 'feature').map(l => l.href.split('/')[2]));
export const unmappedFeatures = featurePages.filter(f => !referenced.has(f.id));

/** Drop topics with no lsl.dev page (keeping a pageless parent only if a child survives). */
function prune(ts: Topic[]): Topic[] {
	return ts.flatMap(t => {
		const children = t.children ? prune(t.children) : undefined;
		if (!t.to && !children?.length) return [];
		return [{ ...t, children: children?.length ? children : undefined }];
	});
}
const byLabel = (a: Topic, b: Topic) => a.label.localeCompare(b.label);
if (unmappedFeatures.length) throw new Error(`portal-topics: place these features in a topic: ${unmappedFeatures.map(f => f.id).join(', ')}`);
export const topicsAZ: Topic[] = prune(rawAZ).sort(byLabel);
export const topicTree: Topic[] = prune(rawTree).sort(byLabel);

/** Styling kind for a topic: feature styling only when the topic is the feature itself. */
export function topicKind(t: Topic): Link['kind'] | 'topic' {
	const l = resolve(t.to!);
	return l.kind === 'feature' && l.label !== t.label ? 'topic' : l.kind;
}
