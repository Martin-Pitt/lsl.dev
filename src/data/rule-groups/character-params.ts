/**
 * CHARACTER_* options for llCreateCharacter, llUpdateCharacter and
 * /constants/groups/CharacterParam/. Every public CharacterParam member must appear exactly once.
 * Types come from the LSL definitions; names, ranges and defaults from the wiki's
 * Template:LSL_Constants/llCreateCharacter, which names only the numeric options (the
 * centre of its interval), so the others carry the type only.
 */
import type { RuleSection } from './types';

export const characterParams: RuleSection[] = [
	{ title: 'Speed and turning', id: 'speed-and-turning', rules: [
		{ rule: 'CHARACTER_DESIRED_SPEED', args: 'float speed', note: 'm/s, 0.2 to 40.0; default 6' },
		{ rule: 'CHARACTER_MAX_SPEED', args: 'float max_speed', note: '1 to 40.0; default 20' },
		{ rule: 'CHARACTER_MAX_ACCEL', args: 'float acceleration', note: '0.5 to 40.0; default 20' },
		{ rule: 'CHARACTER_MAX_DECEL', args: 'float deceleration', note: '0.5 to 60.0; default 30' },
		{ rule: 'CHARACTER_DESIRED_TURN_SPEED', args: 'float speed', note: '0.02 to 40.0; default 6; loosely enforced' },
		{ rule: 'CHARACTER_MAX_TURN_RADIUS', args: 'float radius', note: '0.1 to 10.0; default 1.25' },
	] },
	{ title: 'Size and shape', id: 'size-and-shape', rules: [
		{ rule: 'CHARACTER_RADIUS', args: 'float radius', note: 'capsule, 0.125 to 5.0' },
		{ rule: 'CHARACTER_LENGTH', args: 'float length', note: 'capsule, up to 10.0; at least 2 × radius + 0.1' },
		{ rule: 'CHARACTER_ORIENTATION', args: 'integer', note: 'VERTICAL (default) or HORIZONTAL' },
	] },
	{ title: 'Terrain and avoidance', id: 'terrain-and-avoidance', rules: [
		{ rule: 'CHARACTER_TYPE', args: 'integer', note: 'CHARACTER_TYPE_*; default _NONE' },
		{ rule: 'TRAVERSAL_TYPE', args: 'integer', note: 'TRAVERSAL_TYPE_*; default _SLOW; needs CHARACTER_TYPE' },
		{ rule: 'CHARACTER_AVOIDANCE_MODE', args: 'integer', note: 'AVOID_* flags; default AVOID_CHARACTERS | AVOID_DYNAMIC_OBSTACLES' },
		{ rule: 'CHARACTER_STAY_WITHIN_PARCEL', args: 'integer', note: 'boolean; TRUE keeps it on its parcel' },
		{ rule: 'CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES', args: 'integer', note: 'boolean; default TRUE' },
	] },
];
