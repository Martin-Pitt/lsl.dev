/**
 * OVERRIDE_GLTF_* parameters for llSetLinkGLTFOverrides and /constants/groups/GLTFOverride/.
 * Every public GLTFOverride member must appear exactly once. The wiki's
 * Template:LSL_Constants/GLTF_Overrides gives each parameter's type but no name, so the lines
 * carry the type only.
 */
import type { RuleSection } from './types';

export const gltfOverrides: RuleSection[] = [
	{ title: 'Colour and alpha', id: 'colour-and-alpha', rules: [
		{ rule: 'OVERRIDE_GLTF_BASE_COLOR_FACTOR', args: 'vector', note: 'base colour tint, linear RGB (llsRGB2Linear)' },
		{ rule: 'OVERRIDE_GLTF_BASE_ALPHA', args: 'float', note: 'used only with PRIM_GLTF_ALPHA_MODE_BLEND' },
		{ rule: 'OVERRIDE_GLTF_BASE_ALPHA_MODE', args: 'integer', note: 'PRIM_GLTF_ALPHA_MODE_*' },
		{ rule: 'OVERRIDE_GLTF_BASE_ALPHA_MASK', args: 'float', note: 'alpha cutoff for _MASK' },
	] },
	{ title: 'Surface', id: 'surface', rules: [
		{ rule: 'OVERRIDE_GLTF_METALLIC_FACTOR', args: 'float', note: '0 to 1' },
		{ rule: 'OVERRIDE_GLTF_ROUGHNESS_FACTOR', args: 'float', note: '0 to 1' },
		{ rule: 'OVERRIDE_GLTF_EMISSIVE_FACTOR', args: 'vector', note: 'emissive tint, linear RGB' },
		{ rule: 'OVERRIDE_GLTF_BASE_DOUBLE_SIDED', args: 'integer', note: 'TRUE renders both sides' },
	] },
];
