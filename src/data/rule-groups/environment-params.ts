/**
 * SKY_* / WATER_* rules for llSetEnvironment and llSetAgentEnvironment (EnvironmentParam) and
 * llGetEnvironment (EnvironmentParamReadOnly, getter notation). Every public member of each group
 * must appear exactly once. Multi-value shapes come from the LSL definitions (setter lines leave
 * out the read-only values); single values are named from the wiki's
 * LSL_Constants/llSetEnvironment and LSL_Constants/llGetEnvironment tables. The getter table has
 * no rows for the four *_TEXTURE rules, so their getter lines have no shape.
 */
import type { RuleSection, RuleLine } from './types';

const texture = (rule: string): RuleLine => ({ rule, args: 'string texture_ident', note: 'inventory name or UUID' });
const getTexture = (rule: string): RuleLine => ({ rule });

function sections(get: boolean): RuleSection[] {
	const tex = get ? getTexture : texture;
	return [
		{ title: 'Sun, moon and stars', id: 'sun-moon-and-stars', rules: [
			'SKY_SUN',
			'SKY_MOON',
			tex('SKY_SUN_TEXTURE'),
			tex('SKY_MOON_TEXTURE'),
			'SKY_GLOW',
			{ rule: 'SKY_STAR_BRIGHTNESS', args: 'float brightness', note: '0 to 500' },
			...(get ? ['SKY_LIGHT'] : []),
		] },
		{ title: 'Sky colour and atmosphere', id: 'sky-colour-and-atmosphere', rules: [
			{ rule: 'SKY_AMBIENT', args: get ? 'vector ambient_color' : 'vector color' },
			'SKY_BLUE',
			'SKY_HAZE',
			{ rule: 'SKY_GAMMA', args: 'float gamma', note: '0 to 20' },
			'SKY_DOME',
			'SKY_PLANET',
			'SKY_REFRACTION',
			{ rule: 'SKY_REFLECTION_PROBE_AMBIANCE', args: 'float ambiance', note: '0.0 to 10.0' },
		] },
		{ title: 'Clouds', id: 'clouds', rules: [
			'SKY_CLOUDS',
			tex('SKY_CLOUD_TEXTURE'),
		] },
		{ title: 'Water', id: 'water', rules: [
			'WATER_FOG',
			tex('WATER_NORMAL_TEXTURE'),
			{ rule: 'WATER_NORMAL_SCALE', args: 'vector scale', note: '<0,0,0> to <10,10,10>' },
			'WATER_WAVE_DIRECTION',
			'WATER_FRESNEL',
			'WATER_REFRACTION',
			{ rule: 'WATER_BLUR_MULTIPLIER', args: 'float multiplier', note: '-0.5 to 0.5' },
		] },
		...(get ? [{ title: 'Day cycle and defaults', id: 'day-cycle-and-defaults', rules: [
			'ENVIRONMENT_DAYINFO',
			'SKY_TRACKS',
			'SKY_TEXTURE_DEFAULTS',
			'WATER_TEXTURE_DEFAULTS',
		] }] : []),
	];
}

export const environmentParams = sections(false);
export const environmentParamsGet = sections(true);
