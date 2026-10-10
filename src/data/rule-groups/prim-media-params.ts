/**
 * PRIM_MEDIA_* parameters for llSetPrimMediaParams, llSetLinkMedia, llGetPrimMediaParams,
 * llGetLinkMedia and /constants/groups/PrimMediaParam/. Every public PrimMediaParam member must
 * appear exactly once. Shapes: the wiki's Template:LSL_Constants/PrimMedia.
 */
import type { RuleSection } from './types';

const pixels = { note: '0 to 2048; rounded up to a power of two', getNote: '0 to 2048' };

export const primMediaParams: RuleSection[] = [
	{ title: 'Address', id: 'address', rules: [
		{ rule: 'PRIM_MEDIA_CURRENT_URL', args: 'string current_url', note: 'at most 1024 characters; setting it navigates' },
		{ rule: 'PRIM_MEDIA_HOME_URL', args: 'string home_url', note: 'at most 1024 characters' },
	] },
	{ title: 'Playback', id: 'playback', rules: [
		{ rule: 'PRIM_MEDIA_AUTO_PLAY', args: 'integer boolean', note: 'plays when a resident can see it' },
		{ rule: 'PRIM_MEDIA_AUTO_LOOP', args: 'integer boolean' },
		{ rule: 'PRIM_MEDIA_AUTO_SCALE', args: 'integer boolean', note: 'media fills the face' },
		{ rule: 'PRIM_MEDIA_AUTO_ZOOM', args: 'integer boolean', note: 'a click zooms and focuses' },
		{ rule: 'PRIM_MEDIA_FIRST_CLICK_INTERACT', args: 'integer boolean', note: 'TRUE passes the first click to the page' },
	] },
	{ title: 'Size', id: 'size', rules: [
		{ rule: 'PRIM_MEDIA_WIDTH_PIXELS', args: 'integer width', ...pixels },
		{ rule: 'PRIM_MEDIA_HEIGHT_PIXELS', args: 'integer height', ...pixels },
	] },
	{ title: 'Controls and access', id: 'controls-and-access', rules: [
		{ rule: 'PRIM_MEDIA_CONTROLS', args: 'integer control', note: 'PRIM_MEDIA_CONTROLS_STANDARD or _MINI' },
		{ rule: 'PRIM_MEDIA_PERMS_INTERACT', args: 'integer perms', note: 'PRIM_MEDIA_PERM_*: who can interact' },
		{ rule: 'PRIM_MEDIA_PERMS_CONTROL', args: 'integer perms', note: 'PRIM_MEDIA_PERM_*: who sees the control bar' },
		{ rule: 'PRIM_MEDIA_WHITELIST_ENABLE', args: 'integer boolean', note: 'navigation limited to the whitelist' },
		{ rule: 'PRIM_MEDIA_WHITELIST', args: 'string CSV', note: 'escaped URLs; up to 64 or 1024 characters' },
		{ rule: 'PRIM_MEDIA_ALT_IMAGE_ENABLE', args: 'integer boolean', note: 'not implemented' },
	] },
];
