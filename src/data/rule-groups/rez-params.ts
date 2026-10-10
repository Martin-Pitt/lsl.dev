/**
 * REZ_* parameters for llRezObjectWithParams and /constants/groups/RezParam/, grouped by
 * everyday usage. Every public RezParam member must appear exactly once. Shapes without `args`
 * come from the LSL definitions; the explicit ones are the "values to set" column of the wiki's
 * LSL_Constants/llRezObjectWithParams.
 */
import type { RuleSection } from './types';

export const rezParams: RuleSection[] = [
	{ title: 'Placement', id: 'placement', rules: [
		{ rule: 'REZ_POS', note: 'region coordinates unless relative is TRUE' },
		{ rule: 'REZ_ROT', note: 'absolute unless relative is TRUE' },
	] },
	{ title: 'Start data', id: 'start-data', rules: [
		{ rule: 'REZ_PARAM', args: 'integer param', note: 'passed to on_rez' },
		{ rule: 'REZ_PARAM_STRING', args: 'string start_param', note: 'at most 1024 bytes; read with llGetStartString' },
		{ rule: 'REZ_FLAGS', args: 'integer flags', note: 'REZ_FLAG_*' },
	] },
	{ title: 'Motion', id: 'motion', rules: [
		{ rule: 'REZ_VEL', note: 'inherit adds the rezzer\'s velocity' },
		{ rule: 'REZ_ACCEL', note: 'constant force' },
		{ rule: 'REZ_OMEGA' },
		{ rule: 'REZ_LOCK_AXES', args: 'vector locks', note: 'non-zero components stop spin on that axis' },
	] },
	{ title: 'Sound', id: 'sound', rules: [
		{ rule: 'REZ_SOUND', note: 'inventory name or UUID' },
		{ rule: 'REZ_SOUND_COLLIDE', note: 'played on collision' },
	] },
	{ title: 'Combat', id: 'combat', rules: [
		{ rule: 'REZ_DAMAGE', args: 'float damage', note: 'dealt to an agent on collision' },
		{ rule: 'REZ_DAMAGE_TYPE', args: 'integer damage_type', note: 'DAMAGE_TYPE_* or a custom type' },
	] },
];
