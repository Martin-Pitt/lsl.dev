/**
 * PSYS_* rules for llParticleSystem, llLinkParticleSystem and /constants/groups/ParticleParam/,
 * sorted and grouped by everyday usage. Every public ParticleParam member must appear exactly
 * once. Shapes: the Rule Parameter column of the wiki's Template:LSL_Function/ParticleSystem.
 */
import type { RuleSection } from './types';

export const particleParams: RuleSection[] = [
	{ title: 'Emitter pattern and burst', id: 'emitter-pattern-and-burst', rules: [
		{ rule: 'PSYS_SRC_PATTERN', args: 'integer pattern', note: 'PSYS_SRC_PATTERN_*' },
		{ rule: 'PSYS_SRC_BURST_RATE', args: 'float burst_sleep', note: 'seconds between bursts; 0.0 is as fast as the viewer can' },
		{ rule: 'PSYS_SRC_BURST_PART_COUNT', args: 'integer burst_particle_count' },
		{ rule: 'PSYS_SRC_BURST_RADIUS', args: 'float radius', note: 'metres from the emitter; ignored with PSYS_PART_FOLLOW_SRC_MASK' },
	] },
	{ title: 'Particle appearance', id: 'particle-appearance', rules: [
		{ rule: 'PSYS_PART_START_COLOR', args: 'vector color_start' },
		{ rule: 'PSYS_PART_END_COLOR', args: 'vector color_end', note: 'needs PSYS_PART_INTERP_COLOR_MASK' },
		{ rule: 'PSYS_PART_START_ALPHA', args: 'float alpha_start', note: '0.0 to 1.0' },
		{ rule: 'PSYS_PART_END_ALPHA', args: 'float alpha_end', note: 'needs PSYS_PART_INTERP_COLOR_MASK' },
		{ rule: 'PSYS_PART_START_SCALE', args: 'vector scale_start', note: '0.03125 to 4.0 m per axis; z ignored' },
		{ rule: 'PSYS_PART_END_SCALE', args: 'vector scale_end', note: 'needs PSYS_PART_INTERP_SCALE_MASK' },
		{ rule: 'PSYS_PART_START_GLOW', args: 'float glow_start', note: '0.0 to 1.0' },
		{ rule: 'PSYS_PART_END_GLOW', args: 'float glow_end' },
		{ rule: 'PSYS_SRC_TEXTURE', args: 'string texture', note: 'inventory name or UUID' },
		{ rule: 'PSYS_PART_BLEND_FUNC_SOURCE', args: 'integer bf_source', note: 'PSYS_PART_BF_*; default _SOURCE_ALPHA' },
		{ rule: 'PSYS_PART_BLEND_FUNC_DEST', args: 'integer bf_dest', note: 'PSYS_PART_BF_*; default _ONE_MINUS_SOURCE_ALPHA' },
	] },
	{ title: 'Motion', id: 'motion', rules: [
		{ rule: 'PSYS_SRC_BURST_SPEED_MIN', args: 'float speed_min', note: 'm/s' },
		{ rule: 'PSYS_SRC_BURST_SPEED_MAX', args: 'float speed_max', note: 'm/s' },
		{ rule: 'PSYS_SRC_ACCEL', args: 'vector acceleration', note: 'm/s², region axes; -100.0 to 100.0 per axis' },
		{ rule: 'PSYS_SRC_OMEGA', args: 'vector omega', note: 'pattern rotation per burst, region axes' },
		{ rule: 'PSYS_SRC_ANGLE_BEGIN', args: 'float angle_begin', note: 'half angle in radians; ANGLE patterns' },
		{ rule: 'PSYS_SRC_ANGLE_END', args: 'float angle_end', note: 'half angle in radians; ANGLE patterns' },
		{ rule: 'PSYS_SRC_TARGET_KEY', args: 'key target', note: 'needs PSYS_PART_TARGET_POS_MASK or _LINEAR_MASK' },
		{ rule: 'PSYS_SRC_INNERANGLE', args: 'float angle_inner', note: 'deprecated: use PSYS_SRC_ANGLE_BEGIN' },
		{ rule: 'PSYS_SRC_OUTERANGLE', args: 'float angle_outer', note: 'deprecated: use PSYS_SRC_ANGLE_END' },
	] },
	{ title: 'Lifetime', id: 'lifetime', rules: [
		{ rule: 'PSYS_PART_MAX_AGE', args: 'float duration_particle', note: 'seconds per particle; at most 30.0' },
		{ rule: 'PSYS_SRC_MAX_AGE', args: 'float duration_system', note: 'seconds the emitter runs; 0.0 is forever' },
	] },
	{ title: 'Flags', id: 'flags', rules: [
		{ rule: 'PSYS_PART_FLAGS', args: 'integer flags', note: 'PSYS_PART_*_MASK, combined with |' },
	] },
];
