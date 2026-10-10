/**
 * PROTOTYPE data for the alternative Features Overview layouts under /prototypes/features/.
 * Temporary: see docs/prototypes/features-index.md. Titles, descriptions and API names come from
 * the feature MDX (src/lib/features.ts); only the grouping, tasks, ranking and icons are editorial.
 * Every feature id referenced here is checked against the real pages at build time.
 */
import { featurePages, featurePageMap, featureHref, type FeaturePage } from '../features';

export { featureHref, featurePageMap };
export type { FeaturePage };

/** Site path of an API page, from its name (ll* functions, UPPER_CASE constants, events otherwise). */
export function apiHref(name: string) {
	const kind = /^ll/.test(name) ? 'functions' : /^[A-Z][A-Z0-9_]*$/.test(name) ? 'constants' : 'events';
	return `/${kind}/${encodeURIComponent(name)}/`;
}
export function keyApis(f: FeaturePage, n = 4) { return f.items.slice(0, n); }

function need(id: string): FeaturePage {
	const f = featurePageMap.get(id);
	if (!f) throw new Error(`prototypes/features-index: unknown feature "${id}"`);
	return f;
}

/** One-line purpose per feature, phrased as what you do with it (variant A, C). */
export const purpose: Record<string, string> = {
	animesh: 'Animate rigged mesh without an avatar',
	avatar: 'Find, attach to, seat and animate avatars',
	camera: 'Move and read the viewer camera',
	combat: 'Deal damage, track health, fire projectiles',
	communications: 'Chat, listen and message other scripts',
	'data-storage': 'Keep data across resets and restarts',
	'data-transmission': 'Turn lists into strings, CSV or JSON and back',
	dialog: 'Show menus and text boxes, read answers',
	effects: 'Particles, hover text, glow and texture animation',
	environments: 'Sky, water, sun, moon and day cycles',
	events: 'States, handlers, timers and detection',
	experience: 'One-time permissions and key-value storage',
	input: 'Touch, keyboard, mouse and gamepad',
	land: 'Parcels, regions, estates and moderation',
	linkset: 'Link numbers, linking and rezzing',
	math: 'Vectors, rotations, random numbers',
	money: 'Take payments and pay out L$',
	movement: 'Position, rotate and glide objects',
	pathfinding: 'Navmesh characters and path queries',
	physics: 'Forces, collisions, materials and raycasts',
	prims: 'Shape, size, params and inventory of prims',
	sound: 'Play, loop and trigger sounds',
	textures: 'Textures, colors, alpha and PBR materials',
};

/** Variant A: 5 goal groups (Miller/chunking; Common Region). */
export const goalGroups: { id: string; title: string; blurb: string; features: string[] }[] = [
	{ id: 'logic', title: 'Script logic', blurb: 'How a script runs and computes.', features: ['events', 'math', 'data-transmission', 'data-storage'] },
	{ id: 'world', title: 'Build the world', blurb: 'Shape, link, move and simulate objects.', features: ['prims', 'linkset', 'movement', 'physics', 'pathfinding', 'land'] },
	{ id: 'people', title: 'Interact with avatars', blurb: 'Agents, their input, camera and permissions.', features: ['avatar', 'input', 'camera', 'experience', 'combat', 'money'] },
	{ id: 'talk', title: 'Talk to scripts & people', blurb: 'Chat, menus and messages.', features: ['communications', 'dialog'] },
	{ id: 'media', title: 'Look & sound', blurb: 'Everything you see and hear.', features: ['textures', 'effects', 'sound', 'animesh', 'environments'] },
];

/** Variant B: task-first entry points (Jakob's Law: "How do I…" portals; Tesler: we carry the mapping). */
export const tasks: { task: string; feature: string; apis: string[] }[] = [
	{ task: 'react when someone touches my object', feature: 'input', apis: ['touch_start', 'llDetectedKey'] },
	{ task: 'say something in chat or listen to it', feature: 'communications', apis: ['llSay', 'llListen', 'listen'] },
	{ task: 'show a menu with buttons', feature: 'dialog', apis: ['llDialog', 'listen'] },
	{ task: 'run code every few seconds', feature: 'events', apis: ['llSetTimerEvent', 'timer'] },
	{ task: 'store data that survives a reset', feature: 'data-storage', apis: ['llLinksetDataWrite', 'llLinksetDataRead'] },
	{ task: 'send data to a web server', feature: 'communications', apis: ['llHTTPRequest', 'http_response'] },
	{ task: 'parse or build JSON', feature: 'data-transmission', apis: ['llList2Json', 'llJsonGetValue'] },
	{ task: 'move or rotate an object', feature: 'movement', apis: ['llSetPos', 'llSetRot', 'llSetKeyframedMotion'] },
	{ task: 'change color, texture or transparency', feature: 'textures', apis: ['llSetColor', 'llSetTexture', 'llSetAlpha'] },
	{ task: 'play a sound', feature: 'sound', apis: ['llPlaySound', 'llTriggerSound'] },
	{ task: 'make particles or hover text', feature: 'effects', apis: ['llParticleSystem', 'llSetText'] },
	{ task: 'animate an avatar', feature: 'avatar', apis: ['llRequestPermissions', 'llStartAnimation'] },
	{ task: 'make a HUD or attachment', feature: 'avatar', apis: ['llAttachToAvatar', 'attach'] },
	{ task: 'take keyboard controls (vehicles, weapons)', feature: 'input', apis: ['llTakeControls', 'control'] },
	{ task: 'deal damage or track health', feature: 'combat', apis: ['llDamage', 'llGetHealth'] },
	{ task: 'accept payment for a vendor', feature: 'money', apis: ['llSetPayPrice', 'money'] },
	{ task: 'rez an object from inventory', feature: 'linkset', apis: ['llRezObjectWithParams', 'object_rez'] },
	{ task: 'set prim size, shape or params in one call', feature: 'prims', apis: ['llSetLinkPrimitiveParamsFast'] },
	{ task: 'push, launch or make an object fall', feature: 'physics', apis: ['llSetStatus', 'llApplyImpulse'] },
	{ task: 'control the camera', feature: 'camera', apis: ['llSetCameraParams'] },
	{ task: 'find out who owns this parcel', feature: 'land', apis: ['llGetParcelDetails', 'llGetLandOwnerAt'] },
	{ task: 'make an NPC walk around', feature: 'pathfinding', apis: ['llCreateCharacter', 'llNavigateTo'] },
];

/**
 * Variant C/D: editorial "most used" order, highest first (Serial Position). Approximates how often
 * scripters need each area; replace with analytics when available.
 */
export const usageOrder = ['communications', 'events', 'input', 'prims', 'avatar', 'textures', 'data-storage', 'dialog',
	'movement', 'effects', 'sound', 'data-transmission', 'linkset', 'physics', 'math', 'money', 'land', 'experience',
	'camera', 'combat', 'environments', 'animesh', 'pathfinding'];

/** Starlight icon per feature (variant C). Names from @astrojs/starlight's built-in icon set. */
export const icons: Record<string, string> = {
	animesh: 'puzzle', avatar: 'star', camera: 'magnifier', combat: 'warning', communications: 'comment',
	'data-storage': 'document', 'data-transmission': 'random', dialog: 'list-format', effects: 'sun',
	environments: 'moon', events: 'setting', experience: 'approve-check', input: 'pencil', land: 'translate',
	linkset: 'external', math: 'seti:clock', money: 'seti:shell', movement: 'rocket', pathfinding: 'right-arrow',
	physics: 'information', prims: 'seti:default', sound: 'seti:audio', textures: 'seti:image',
};

export const byGoal = goalGroups.map(g => ({ ...g, pages: g.features.map(need) }));
export const byTask = tasks.map(t => ({ ...t, page: need(t.feature) }));
export const byUsage = usageOrder.map(need);
export const alphabetical = [...featurePages].sort((a, b) => a.title.localeCompare(b.title));
export const goalOf = new Map(goalGroups.flatMap(g => g.features.map(id => [id, g] as const)));

// Every real feature must appear exactly once in each grouping, so prototypes never hide a page.
for (const [label, ids] of [['goalGroups', goalGroups.flatMap(g => g.features)], ['usageOrder', usageOrder]] as const) {
	const missing = featurePages.filter(f => !ids.includes(f.id)).map(f => f.id);
	if (missing.length || ids.length !== featurePages.length) throw new Error(`prototypes/features-index: ${label} must list every feature once (missing: ${missing.join(', ') || 'none'})`);
}
