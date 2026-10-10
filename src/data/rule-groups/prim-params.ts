/**
 * PRIM_* rules for llSetLinkPrimitiveParamsFast, llGetLinkPrimitiveParams, llGetPrimitiveParams
 * and /constants/groups/PrimParam/, sorted and grouped by everyday usage and related
 * functionality. Every public PrimParam member must appear exactly once (the build fails
 * otherwise). Shapes without `args` come from the LSL definitions; the explicit ones are the
 * usage column of the wiki's Template:LSL_Constants/PrimitiveParams.
 */
import type { RuleSection } from './types';

const texture = 'integer face, string texture, vector repeats, vector offsets, float rotation_in_radians';
const shape = 'integer hole_shape, vector cut, float hollow, vector twist';

export const primParams: RuleSection[] = [
	{ title: 'Link targeting', id: 'link-targeting', rules: [
		{ rule: 'PRIM_LINK_TARGET', args: 'integer link_target', note: 'the rules after it apply to this link', getNote: 'the rules after it read this link' },
	] },
	{ title: 'Position and orientation', id: 'position-and-orientation', rules: [
		{ rule: 'PRIM_POSITION', args: 'vector position' },
		{ rule: 'PRIM_ROTATION', args: 'rotation rot', note: 'global; broken for child prims' },
		{ rule: 'PRIM_SIZE', args: 'vector size', note: 'fails silently on physical prims' },
		{ rule: 'PRIM_POS_LOCAL', args: 'vector position', note: 'relative to the root' },
		{ rule: 'PRIM_ROT_LOCAL', args: 'rotation rot', note: 'relative to the root' },
		{ rule: 'PRIM_OMEGA', note: 'like llTargetOmega' },
	] },
	{ title: 'Appearance', id: 'appearance', rules: [
		{ rule: 'PRIM_COLOR', args: 'integer face, vector color, float alpha' },
		{ rule: 'PRIM_ALPHA_MODE', note: 'PRIM_ALPHA_MODE_*' },
		{ rule: 'PRIM_TEXTURE', args: texture },
		{ rule: 'PRIM_FULLBRIGHT', args: 'integer face, integer boolean' },
		'PRIM_GLOW',
		{ rule: 'PRIM_POINT_LIGHT', args: 'integer boolean, vector linear_color, float intensity, float radius, float falloff', note: 'linear_color: linear space' },
		{ rule: 'PRIM_BUMP_SHINY', note: 'PRIM_SHINY_*, PRIM_BUMP_*' },
		{ rule: 'PRIM_TEXGEN', note: 'PRIM_TEXGEN_*' },
		{ rule: 'PRIM_RENDER_MATERIAL', args: 'integer face, string render_material', note: 'clears most PRIM_GLTF_* overrides' },
		{ rule: 'PRIM_GLTF_BASE_COLOR', args: `${texture}, vector linear_color, float alpha, integer gltf_alpha_mode, float alpha_mask_cutoff, integer double_sided`, note: 'linear_color: linear space' },
		{ rule: 'PRIM_GLTF_NORMAL', args: texture },
		{ rule: 'PRIM_GLTF_METALLIC_ROUGHNESS', args: `${texture}, float metallic_factor, float roughness_factor` },
		{ rule: 'PRIM_GLTF_EMISSIVE', args: `${texture}, vector linear_emissive_tint`, note: 'linear space' },
		{ rule: 'PRIM_NORMAL', args: texture, note: 'Blinn-Phong' },
		{ rule: 'PRIM_SPECULAR', args: `${texture}, vector color, integer glossiness, integer environment`, note: 'Blinn-Phong' },
		{ rule: 'PRIM_PROJECTOR', args: 'string texture, float fov, float focus, float ambiance', setOnly: true, note: 'set only', getNote: 'set only: not returned' },
		{ rule: 'PRIM_REFLECTION_PROBE', args: 'integer boolean, float ambiance, float clip_distance, integer flags', note: 'PRIM_REFLECTION_PROBE_* flags' },
	] },
	{ title: 'Text and naming', id: 'text-and-naming', rules: [
		{ rule: 'PRIM_TEXT', args: 'string text, vector color, float alpha', note: 'floating text' },
		{ rule: 'PRIM_NAME', args: 'string name' },
		{ rule: 'PRIM_DESC', args: 'string description' },
	] },
	{ title: 'Shape', id: 'shape', details: true, rules: [
		{ rule: 'PRIM_TYPE', note: 'no effect on mesh', forms: [
			{ name: 'PRIM_TYPE_BOX', args: `${shape}, vector top_size, vector top_shear` },
			{ name: 'PRIM_TYPE_CYLINDER', args: `${shape}, vector top_size, vector top_shear` },
			{ name: 'PRIM_TYPE_PRISM', args: `${shape}, vector top_size, vector top_shear` },
			{ name: 'PRIM_TYPE_SPHERE', args: `${shape}, vector dimple` },
			{ name: 'PRIM_TYPE_TORUS' },
			{ name: 'PRIM_TYPE_TUBE' },
			{ name: 'PRIM_TYPE_RING' },
			{ name: 'PRIM_TYPE_SCULPT', args: 'string map, integer type' },
		] },
		{ rule: 'PRIM_SLICE', args: 'vector slice' },
	] },
	{ title: 'Physics and behaviour', id: 'physics-and-behaviour', rules: [
		{ rule: 'PRIM_PHYSICS', args: 'integer boolean', note: 'whole object' },
		{ rule: 'PRIM_PHANTOM', args: 'integer boolean', note: 'whole object' },
		{ rule: 'PRIM_TEMP_ON_REZ', args: 'integer boolean', note: 'whole object' },
		{ rule: 'PRIM_PHYSICS_SHAPE_TYPE', args: 'integer type', note: 'PRIM_PHYSICS_SHAPE_*' },
		{ rule: 'PRIM_MATERIAL', args: 'integer material', note: 'PRIM_MATERIAL_*' },
		{ rule: 'PRIM_FLEXIBLE', args: 'integer boolean, integer softness, float gravity, float friction, float wind, float tension, vector force' },
		{ rule: 'PRIM_COLLISION_SOUND', args: 'string sound, float volume' },
		{ rule: 'PRIM_DAMAGE', args: 'float damage, integer damage_type' },
		{ rule: 'PRIM_HEALTH', args: 'float health' },
	] },
	{ title: 'Clicking and sitting', id: 'clicking-and-sitting', rules: [
		{ rule: 'PRIM_CLICK_ACTION', args: 'integer action', note: 'CLICK_ACTION_*' },
		{ rule: 'PRIM_SIT_TARGET', args: 'integer boolean, vector offset, rotation rot', note: 'offset may be ZERO_VECTOR' },
		{ rule: 'PRIM_SIT_FLAGS', args: 'integer flags', note: 'SIT_FLAG_*' },
		{ rule: 'PRIM_SCRIPTED_SIT_ONLY', args: 'integer boolean' },
		{ rule: 'PRIM_ALLOW_UNSIT', args: 'integer boolean', note: 'experience seats only' },
	] },
];
