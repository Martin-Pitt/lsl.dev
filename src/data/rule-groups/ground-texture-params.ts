/**
 * TERRAIN_* parameters for llSetGroundTexture and /constants/groups/GroundTextureParam/. Every
 * public GroundTextureParam member must appear exactly once. Shapes: the Format column of the
 * wiki's Template:LSL_Constants/GroundTexture (types from the LSL definitions where it has none).
 */
import type { RuleSection } from './types';

export const groundTextureParams: RuleSection[] = [
	{ title: 'Textures', id: 'textures', rules: [
		{ rule: 'TERRAIN_DETAIL_1', args: 'string texture_id', note: 'texture or material, name or UUID; NULL_KEY or "" restores the default' },
		{ rule: 'TERRAIN_DETAIL_2', args: 'string texture_id' },
		{ rule: 'TERRAIN_DETAIL_3', args: 'string texture_id' },
		{ rule: 'TERRAIN_DETAIL_4', args: 'string texture_id' },
	] },
	{ title: 'Height blending', id: 'height-blending', rules: [
		{ rule: 'TERRAIN_HEIGHT_RANGE_SW', note: 'low: max height of texture 1; high: min height of texture 4' },
		'TERRAIN_HEIGHT_RANGE_SE',
		'TERRAIN_HEIGHT_RANGE_NW',
		'TERRAIN_HEIGHT_RANGE_NE',
	] },
	{ title: 'PBR scale, rotation and offset', id: 'pbr-scale-rotation-and-offset', rules: [
		{ rule: 'TERRAIN_PBR_SCALE_1', args: 'vector uv_scale', note: 'PBR only; repeats per metre, z ignored' },
		{ rule: 'TERRAIN_PBR_SCALE_2', args: 'vector uv_scale' },
		{ rule: 'TERRAIN_PBR_SCALE_3', args: 'vector uv_scale' },
		{ rule: 'TERRAIN_PBR_SCALE_4', args: 'vector uv_scale' },
		{ rule: 'TERRAIN_PBR_ROTATION_1', args: 'float rotation', note: 'PBR only; radians' },
		{ rule: 'TERRAIN_PBR_ROTATION_2', args: 'float rotation' },
		{ rule: 'TERRAIN_PBR_ROTATION_3', args: 'float rotation' },
		{ rule: 'TERRAIN_PBR_ROTATION_4', args: 'float rotation' },
		{ rule: 'TERRAIN_PBR_OFFSET_1', args: 'vector uv_offset', note: 'PBR only; z ignored' },
		{ rule: 'TERRAIN_PBR_OFFSET_2', args: 'vector uv_offset' },
		{ rule: 'TERRAIN_PBR_OFFSET_3', args: 'vector uv_offset' },
		{ rule: 'TERRAIN_PBR_OFFSET_4', args: 'vector uv_offset' },
	] },
];
