/**
 * Editorial data for the Features Overview (/features/): card order, purpose lines, icons and the
 * "I want to" task list. Titles, descriptions and key APIs come from the feature MDX
 * (src/lib/features.ts). Cards are derived from every feature page, so a new feature always gets a
 * card: features missing from `usageOrder` are appended A-Z, a missing purpose falls back to the
 * frontmatter description and a missing icon to a generic one. Unknown ids fail the build.
 */
import { featurePages, featurePageMap, featureHref, type FeaturePage } from './features';

export { featureHref, featurePageMap };
export type { FeaturePage };

/** Site path of an API page, from its name (ll* functions, UPPER_CASE constants, events otherwise). */
export function apiHref(name: string) {
	const kind = /^ll/.test(name) ? 'functions' : /^[A-Z][A-Z0-9_]*$/.test(name) ? 'constants' : 'events';
	return `/${kind}/${encodeURIComponent(name)}/`;
}
/** Hand-picked key APIs, where the first names a page links are not the most useful shortcuts. */
const keyApiNames: Record<string, string[]> = {
	'viewer-uris': ['llSay', 'llDialog', 'llDetectedKey', 'llGetRegionName'],
	script: ['llResetScript', 'llGetStartParameter', 'llSetScriptState', 'llGetUsedMemory'],
	time: ['llSetTimerEvent', 'timer', 'llGetUnixTime', 'llGetTimestamp'],
	inventory: ['llGetInventoryName', 'llGiveInventory', 'llRezObjectWithParams', 'llDerezObject', 'llGetNotecardLineSync'],
};
/** Key APIs: `keyApiNames`, else the first names a feature page links (its <ApiLinks> come first). */
export function keyApis(f: FeaturePage, n = 4) { return (keyApiNames[f.id] ?? f.items).slice(0, n); }

function need(id: string, where: string): FeaturePage {
	const f = featurePageMap.get(id);
	if (!f) throw new Error(`features-overview: unknown feature "${id}" in ${where}`);
	return f;
}

/** One-line purpose per feature, phrased as what you do with it. */
const purposes: Record<string, string> = {
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
	events: 'States, handlers, changes and detection',
	experience: 'One-time permissions and key-value storage',
	inventory: 'Read, give, rez and derez the contents of a prim',
	input: 'Touch, keyboard, mouse and gamepad',
	land: 'Parcels, regions, estates and moderation',
	linkset: 'Link numbers, linking and rezzing',
	math: 'Vectors, rotations, random numbers',
	money: 'Take payments and pay out L$',
	movement: 'Position, rotate and glide objects',
	pathfinding: 'Navmesh characters and path queries',
	physics: 'Forces, collisions, materials and raycasts',
	prims: 'Shape, size and params of prims',
	script: 'Reset scripts, read start parameters, check memory',
	sound: 'Play, loop and trigger sounds',
	textures: 'Textures, colors, alpha and PBR materials',
	time: 'Timers, sleeping, clocks and time dilation',
	'viewer-uris': 'Clickable names, profiles and places in chat',
};
export function purpose(f: FeaturePage) { return purposes[f.id] ?? f.description; }

/**
 * Starlight built-in icon per feature. Only a rough fit for LSL concepts; a custom LSL icon set
 * would improve them.
 */
const icons: Record<string, string> = {
	animesh: 'puzzle', avatar: 'star', camera: 'magnifier', combat: 'warning', communications: 'comment',
	'data-storage': 'document', 'data-transmission': 'random', dialog: 'list-format', effects: 'sun',
	environments: 'moon', events: 'setting', experience: 'approve-check', input: 'pencil', inventory: 'seti:folder', land: 'translate',
	linkset: 'external', math: 'seti:clock', money: 'seti:shell', movement: 'rocket', pathfinding: 'right-arrow',
	physics: 'information', prims: 'seti:default', script: 'seti:config', sound: 'seti:audio', textures: 'seti:image', time: 'seti:clock', 'viewer-uris': 'link',
};
export function icon(f: FeaturePage) { return icons[f.id] ?? 'document'; }

/** Editorial "most used" order, highest first (Serial Position). Replace with analytics when available. */
const usageOrder = ['communications', 'events', 'time', 'input', 'prims', 'inventory', 'avatar', 'textures', 'data-storage', 'dialog',
	'movement', 'effects', 'script', 'sound', 'data-transmission', 'linkset', 'physics', 'math', 'money', 'viewer-uris', 'land', 'experience',
	'camera', 'combat', 'environments', 'animesh', 'pathfinding'];
/** How many cards the "Most used" section shows. */
export const mostUsedCount = 6;

/** Task-first entry points (Tesler: the site carries the task-to-feature mapping). */
const tasks: { task: string; feature: string; apis: string[] }[] = [
	{ task: 'React when someone touches my object', feature: 'input', apis: ['touch_start', 'llDetectedKey'] },
	{ task: 'Say something in chat or listen to it', feature: 'communications', apis: ['llSay', 'llListen', 'listen'] },
	{ task: 'Link to an avatar or place in chat', feature: 'viewer-uris', apis: ['llSay', 'llDetectedKey', 'llGetRegionName'] },
	{ task: 'Show a menu with buttons', feature: 'dialog', apis: ['llDialog', 'listen'] },
	{ task: 'Run code on a timer', feature: 'time', apis: ['llSetTimerEvent', 'timer'] },
	{ task: 'Reset a script', feature: 'script', apis: ['llResetScript', 'llResetOtherScript'] },
	{ task: 'Store data that survives a reset', feature: 'data-storage', apis: ['llLinksetDataWrite', 'llLinksetDataRead'] },
	{ task: 'Send data to a web server', feature: 'communications', apis: ['llHTTPRequest', 'http_response'] },
	{ task: 'Parse or build JSON', feature: 'data-transmission', apis: ['llList2Json', 'llJsonGetValue'] },
	{ task: 'Move or rotate an object', feature: 'movement', apis: ['llSetPos', 'llSetRot', 'llSetKeyframedMotion'] },
	{ task: 'Change color, texture or transparency', feature: 'textures', apis: ['llSetColor', 'llSetTexture', 'llSetAlpha'] },
	{ task: 'Play a sound', feature: 'sound', apis: ['llPlaySound', 'llTriggerSound'] },
	{ task: 'Make particles or hover text', feature: 'effects', apis: ['llParticleSystem', 'llSetText'] },
	{ task: 'Animate an avatar', feature: 'avatar', apis: ['llRequestPermissions', 'llStartAnimation'] },
	{ task: 'Make a HUD or attachment', feature: 'avatar', apis: ['llAttachToAvatar', 'attach'] },
	{ task: 'Take keyboard controls (vehicles, weapons)', feature: 'input', apis: ['llTakeControls', 'control'] },
	{ task: 'Deal damage or track health', feature: 'combat', apis: ['llDamage', 'llGetHealth'] },
	{ task: 'Accept payment for a vendor', feature: 'money', apis: ['llSetPayPrice', 'money'] },
	{ task: 'Rez an object from inventory', feature: 'inventory', apis: ['llRezObjectWithParams', 'object_rez'] },
	{ task: 'Give an item to an avatar', feature: 'inventory', apis: ['llGiveInventory', 'llGiveInventoryList'] },
	{ task: 'Read settings from a notecard', feature: 'inventory', apis: ['llGetNotecardLine', 'dataserver'] },
	{ task: 'Set prim size, shape or params in one call', feature: 'prims', apis: ['llSetLinkPrimitiveParamsFast'] },
	{ task: 'Push, launch or make an object fall', feature: 'physics', apis: ['llSetStatus', 'llApplyImpulse'] },
	{ task: 'Control the camera', feature: 'camera', apis: ['llSetCameraParams'] },
	{ task: 'Find out who owns this parcel', feature: 'land', apis: ['llGetParcelDetails', 'llGetLandOwnerAt'] },
	{ task: 'Make an NPC walk around', feature: 'pathfinding', apis: ['llCreateCharacter', 'llNavigateTo'] },
];

const ranked = usageOrder.map(id => need(id, 'usageOrder'));
/** Every feature page: ranked ones first, then any not yet ranked, A-Z. */
export const byUsage: FeaturePage[] = [
	...ranked,
	...featurePages.filter(f => !usageOrder.includes(f.id)).sort((a, b) => a.title.localeCompare(b.title)),
];
export const byTask = tasks.map(t => ({ ...t, page: need(t.feature, `task "${t.task}"`) }));
export const alphabetical = [...featurePages].sort((a, b) => a.title.localeCompare(b.title));

for (const id of [...Object.keys(purposes), ...Object.keys(icons), ...Object.keys(keyApiNames)]) need(id, 'purposes/icons/keyApiNames');
if (byUsage.length !== featurePages.length || new Set(byUsage).size !== byUsage.length) {
	throw new Error('features-overview: every feature must appear exactly once on /features/');
}
