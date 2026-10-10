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
		{ rule: 'PRIM_POSITION', args: 'vector position', note: 'region coordinates' },
		{ rule: 'PRIM_ROTATION', args: 'rotation rot', note: 'global rotation, like llSetRot; broken for child prims' },
		{ rule: 'PRIM_SIZE', args: 'vector size', note: 'like llSetScale; fails silently on physical prims' },
		{ rule: 'PRIM_POS_LOCAL', args: 'vector position', note: 'relative to the root, like llSetPos in a child' },
		{ rule: 'PRIM_ROT_LOCAL', args: 'rotation rot', note: 'relative to the root, like llSetLocalRot' },
		{ rule: 'PRIM_OMEGA', args: 'vector axis, float spinrate, float gain', note: 'client-side spin, like llTargetOmega; spinrate in radians per second' },
	] },
	{ title: 'Appearance', id: 'appearance', rules: [
		{ rule: 'PRIM_COLOR', args: 'integer face, vector color, float alpha', note: 'Blinn-Phong colour and opacity; face may be ALL_SIDES' },
		{ rule: 'PRIM_ALPHA_MODE', args: 'integer face, integer alpha_mode, integer alpha_cutoff', note: 'PRIM_ALPHA_MODE_*; alpha_cutoff used only for _MASK' },
		{ rule: 'PRIM_TEXTURE', args: texture, note: 'Blinn-Phong diffuse texture' },
		{ rule: 'PRIM_FULLBRIGHT', args: 'integer face, integer boolean', note: 'full-bright rendering on the face' },
		{ rule: 'PRIM_GLOW', args: 'integer face, float intensity', note: 'glow intensity on the face' },
		{ rule: 'PRIM_POINT_LIGHT', args: 'integer boolean, vector linear_color, float intensity, float radius, float falloff', note: 'local light; linear_color in linear space (llsRGB2Linear)' },
		{ rule: 'PRIM_BUMP_SHINY', args: 'integer face, integer shiny, integer bump', note: 'PRIM_SHINY_*, PRIM_BUMP_*' },
		{ rule: 'PRIM_TEXGEN', args: 'integer face, integer mode', note: 'PRIM_TEXGEN_* texture mapping mode' },
		{ rule: 'PRIM_RENDER_MATERIAL', args: 'integer face, string render_material', note: 'clears most PRIM_GLTF_* overrides' },
		{ rule: 'PRIM_GLTF_BASE_COLOR', args: `${texture}, vector linear_color, float alpha, integer gltf_alpha_mode, float alpha_mask_cutoff, integer double_sided`, note: 'linear_color: linear space' },
		{ rule: 'PRIM_GLTF_NORMAL', args: texture, note: 'glTF normal map override' },
		{ rule: 'PRIM_GLTF_METALLIC_ROUGHNESS', args: `${texture}, float metallic_factor, float roughness_factor` },
		{ rule: 'PRIM_GLTF_EMISSIVE', args: `${texture}, vector linear_emissive_tint`, note: 'linear space' },
		{ rule: 'PRIM_NORMAL', args: texture, note: 'Blinn-Phong normal map' },
		{ rule: 'PRIM_SPECULAR', args: `${texture}, vector color, integer glossiness, integer environment`, note: 'Blinn-Phong' },
		{ rule: 'PRIM_PROJECTOR', args: 'string texture, float fov, float focus, float ambiance', setOnly: true, note: 'light projection; set only', getNote: 'set only: not returned' },
		{ rule: 'PRIM_REFLECTION_PROBE', args: 'integer boolean, float ambiance, float clip_distance, integer flags', note: 'custom reflection probe; PRIM_REFLECTION_PROBE_* flags' },
	] },
	{ title: 'Text and naming', id: 'text-and-naming', rules: [
		{ rule: 'PRIM_TEXT', args: 'string text, vector color, float alpha', note: 'floating text, like llSetText' },
		{ rule: 'PRIM_NAME', args: 'string name', note: 'like llSetObjectName' },
		{ rule: 'PRIM_DESC', args: 'string description', note: 'like llSetObjectDesc' },
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
		{ rule: 'PRIM_SLICE', args: 'vector slice', note: 'shape slice, equivalent to cut / advanced_cut' },
	] },
	{ title: 'Physics and behaviour', id: 'physics-and-behaviour', rules: [
		{ rule: 'PRIM_PHYSICS', args: 'integer boolean', note: 'whole object responds to physics' },
		{ rule: 'PRIM_PHANTOM', args: 'integer boolean', note: 'whole object phantom' },
		{ rule: 'PRIM_TEMP_ON_REZ', args: 'integer boolean', note: 'whole object temporary; cleaned up in about a minute' },
		{ rule: 'PRIM_PHYSICS_SHAPE_TYPE', args: 'integer type', note: 'PRIM_PHYSICS_SHAPE_NONE, _PRIM or _CONVEX' },
		{ rule: 'PRIM_MATERIAL', args: 'integer material', note: 'PRIM_MATERIAL_*: default collision sound, friction, restitution' },
		{ rule: 'PRIM_FLEXIBLE', args: 'integer boolean, integer softness, float gravity, float friction, float wind, float tension, vector force', note: 'softness 0 to 3; gravity -10.0 to 10.0' },
		{ rule: 'PRIM_COLLISION_SOUND', args: 'string sound, float volume', note: 'collision sound UUID and volume' },
		{ rule: 'PRIM_DAMAGE', args: 'float damage, integer damage_type', note: 'damage delivered on collision' },
		{ rule: 'PRIM_HEALTH', args: 'float health', note: 'objects default to 0 health' },
	] },
	{ title: 'Clicking and sitting', id: 'clicking-and-sitting', rules: [
		{ rule: 'PRIM_CLICK_ACTION', args: 'integer action', note: 'CLICK_ACTION_* default click/touch action' },
		{ rule: 'PRIM_SIT_TARGET', args: 'integer boolean, vector offset, rotation rot', note: 'FALSE removes it; offset may be ZERO_VECTOR' },
		{ rule: 'PRIM_SIT_FLAGS', args: 'integer flags', note: 'SIT_FLAG_*' },
		{ rule: 'PRIM_SCRIPTED_SIT_ONLY', args: 'integer boolean', note: 'only llSitOnLink can seat avatars' },
		{ rule: 'PRIM_ALLOW_UNSIT', args: 'integer boolean', note: 'manual standing; experience seats (llSitOnLink) only' },
	] },
];
