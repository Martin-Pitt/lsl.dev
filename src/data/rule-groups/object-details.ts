/**
 * OBJECT_* flags for llGetObjectDetails and /constants/groups/ObjectDetailsParam/, in getter
 * notation (flag → returned values), sorted and grouped by everyday usage. Every public
 * ObjectDetailsParam member must appear exactly once. Shapes: the Return column of the wiki's
 * Template:LSL_Constants/Object_Details (OBJECT_PERMS* from the LSL definitions).
 */
import type { RuleSection } from './types';

export const objectDetails: RuleSection[] = [
	{ title: 'Identity and ownership', id: 'identity-and-ownership', rules: [
		{ rule: 'OBJECT_NAME', args: 'string name', note: 'avatars: legacy name' },
		{ rule: 'OBJECT_DESC', args: 'string desc', note: 'avatars: empty' },
		{ rule: 'OBJECT_OWNER', args: 'key owner' },
		{ rule: 'OBJECT_GROUP', args: 'key group' },
		{ rule: 'OBJECT_CREATOR', args: 'key creator' },
		{ rule: 'OBJECT_LAST_OWNER_ID', args: 'key last_owner', note: 'if known' },
		{ rule: 'OBJECT_REZZER_KEY', args: 'key rezzer' },
		{ rule: 'OBJECT_ROOT', args: 'key root' },
		{ rule: 'OBJECT_LINK_NUMBER', args: 'integer link_number' },
		{ rule: 'OBJECT_CREATION_TIME', args: 'string timestamp' },
		{ rule: 'OBJECT_REZ_TIME', args: 'string time' },
		{ rule: 'OBJECT_PERMS', note: 'PERM_* masks' },
		{ rule: 'OBJECT_PERMS_COMBINED', note: 'PERM_* masks, including the contents' },
	] },
	{ title: 'Position and movement', id: 'position-and-movement', rules: [
		{ rule: 'OBJECT_POS', args: 'vector pos', note: 'region coordinates' },
		{ rule: 'OBJECT_ROT', args: 'rotation rot' },
		{ rule: 'OBJECT_SCALE', args: 'vector scale' },
		{ rule: 'OBJECT_VELOCITY', args: 'vector vel' },
		{ rule: 'OBJECT_OMEGA', args: 'vector omega' },
		{ rule: 'OBJECT_MASS', args: 'float mass', note: 'whole linkset' },
		{ rule: 'OBJECT_ATTACHED_POINT', args: 'integer attach_point', note: 'ATTACH_*' },
	] },
	{ title: 'Object properties', id: 'object-properties', rules: [
		{ rule: 'OBJECT_PHYSICS', args: 'integer boolean' },
		{ rule: 'OBJECT_PHANTOM', args: 'integer boolean' },
		{ rule: 'OBJECT_TEMP_ON_REZ', args: 'integer boolean' },
		{ rule: 'OBJECT_TEMP_ATTACHED', args: 'integer boolean' },
		{ rule: 'OBJECT_VOLUME_DETECT', args: 'integer isVolumeDetect' },
		{ rule: 'OBJECT_LOCKED', args: 'integer isLocked' },
		{ rule: 'OBJECT_CLICK_ACTION', args: 'integer action', note: 'CLICK_ACTION_*' },
		{ rule: 'OBJECT_MATERIAL', args: 'integer material', note: 'PRIM_MATERIAL_*' },
		{ rule: 'OBJECT_PATHFINDING_TYPE', args: 'integer pathfinding_type', note: 'OPT_*' },
		{ rule: 'OBJECT_TEXT', args: 'string text', note: 'floating text' },
		{ rule: 'OBJECT_TEXT_COLOR', args: 'vector color' },
		{ rule: 'OBJECT_TEXT_ALPHA', args: 'float alpha' },
		{ rule: 'OBJECT_SIT_COUNT', args: 'integer count', note: 'agents sitting on any link' },
		{ rule: 'OBJECT_SELECT_COUNT', args: 'integer count', note: 'agents selecting any link' },
	] },
	{ title: 'Avatars', id: 'avatars', rules: [
		{ rule: 'OBJECT_GROUP_TAG', args: 'string text' },
		{ rule: 'OBJECT_ACCOUNT_LEVEL', args: 'integer level' },
		{ rule: 'OBJECT_RENDER_WEIGHT', args: 'integer weight' },
		{ rule: 'OBJECT_HOVER_HEIGHT', args: 'float height' },
		{ rule: 'OBJECT_BODY_SHAPE_TYPE', args: 'float body_shape', note: 'sex of the shape, 0.0 to 1.0' },
		{ rule: 'OBJECT_ATTACHED_SLOTS_AVAILABLE', args: 'integer count' },
		{ rule: 'OBJECT_ANIMATED_COUNT', args: 'integer count', note: 'animated mesh attachments worn; objects: boolean' },
		{ rule: 'OBJECT_ANIMATED_SLOTS_AVAILABLE', args: 'integer count' },
	] },
	{ title: 'Scripts, prims and costs', id: 'scripts-prims-and-costs', rules: [
		{ rule: 'OBJECT_RUNNING_SCRIPT_COUNT', args: 'integer script_count', note: 'object or avatar' },
		{ rule: 'OBJECT_TOTAL_SCRIPT_COUNT', args: 'integer script_count', note: 'running and stopped' },
		{ rule: 'OBJECT_SCRIPT_MEMORY', args: 'integer bytes' },
		{ rule: 'OBJECT_SCRIPT_TIME', args: 'float seconds', note: 'average CPU time' },
		{ rule: 'OBJECT_CHARACTER_TIME', args: 'float seconds', note: 'pathfinding CPU time' },
		{ rule: 'OBJECT_PRIM_COUNT', args: 'integer count' },
		{ rule: 'OBJECT_PRIM_EQUIVALENCE', args: 'integer prim_count' },
		{ rule: 'OBJECT_TOTAL_INVENTORY_COUNT', args: 'integer count' },
		{ rule: 'OBJECT_SERVER_COST', args: 'float cost' },
		{ rule: 'OBJECT_STREAMING_COST', args: 'float cost' },
		{ rule: 'OBJECT_PHYSICS_COST', args: 'float cost' },
	] },
	{ title: 'Combat', id: 'combat', rules: [
		{ rule: 'OBJECT_HEALTH', args: 'float health' },
		{ rule: 'OBJECT_DAMAGE', args: 'float damage', note: 'dealt on collision' },
		{ rule: 'OBJECT_DAMAGE_TYPE', args: 'integer damage_type', note: 'DAMAGE_TYPE_*' },
	] },
];
