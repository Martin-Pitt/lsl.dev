/**
 * PARCEL_MEDIA_COMMAND_* for llParcelMediaCommandList (ParcelMediaCommand) and llParcelMediaQuery
 * (ParcelMediaQuery, getter notation). Every public member of each group must appear exactly
 * once. Shapes: the Parameter / Return column of the wiki's Template:LSL_Constants/Parcel_Media.
 */
import type { RuleSection, RuleLine } from './types';

const settings: RuleLine[] = [
	{ rule: 'PARCEL_MEDIA_COMMAND_URL', args: 'string url' },
	{ rule: 'PARCEL_MEDIA_COMMAND_TEXTURE', args: 'key uuid', note: 'the texture the media replaces' },
	{ rule: 'PARCEL_MEDIA_COMMAND_TYPE', args: 'string mime_type', note: 'e.g. "text/html"' },
	{ rule: 'PARCEL_MEDIA_COMMAND_SIZE', args: 'integer x, integer y', note: 'pixels' },
	{ rule: 'PARCEL_MEDIA_COMMAND_DESC', args: 'string desc' },
	{ rule: 'PARCEL_MEDIA_COMMAND_LOOP_SET', args: 'float loop', note: 'loop duration' },
];

export const parcelMediaCommands: RuleSection[] = [
	{ title: 'Playback', id: 'playback', rules: [
		{ rule: 'PARCEL_MEDIA_COMMAND_PLAY', note: 'from the current frame; stops at the end' },
		{ rule: 'PARCEL_MEDIA_COMMAND_LOOP', note: 'from the current frame; loops at the end' },
		{ rule: 'PARCEL_MEDIA_COMMAND_PAUSE' },
		{ rule: 'PARCEL_MEDIA_COMMAND_STOP', note: 'back to the first frame' },
		{ rule: 'PARCEL_MEDIA_COMMAND_TIME', args: 'float time', note: 'seconds' },
		{ rule: 'PARCEL_MEDIA_COMMAND_UNLOAD', note: 'restores the original texture' },
	] },
	{ title: 'Media settings', id: 'media-settings', rules: [
		...settings,
		{ rule: 'PARCEL_MEDIA_COMMAND_AUTO_ALIGN', args: 'integer boolean', note: 'parcel option "Auto scale content"' },
	] },
	{ title: 'One agent only', id: 'one-agent-only', rules: [
		{ rule: 'PARCEL_MEDIA_COMMAND_AGENT', args: 'key uuid', note: 'the commands apply to this agent only' },
	] },
];

export const parcelMediaQuery: RuleSection[] = [
	{ title: 'Media settings', id: 'media-settings', rules: settings },
];
