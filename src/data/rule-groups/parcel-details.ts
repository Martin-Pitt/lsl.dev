/**
 * PARCEL_DETAILS_* flags for llGetParcelDetails and /constants/groups/ParcelDetailsParam/, in
 * getter notation. Every public ParcelDetailsParam member must appear exactly once. The wiki's
 * Template:LSL_Constants/Parcel_Details gives each return type but no name, so the lines carry
 * the type only.
 */
import type { RuleSection } from './types';

export const parcelDetails: RuleSection[] = [
	{ title: 'Identity and ownership', id: 'identity-and-ownership', rules: [
		{ rule: 'PARCEL_DETAILS_NAME', args: 'string', note: 'at most 63 characters' },
		{ rule: 'PARCEL_DETAILS_DESC', args: 'string', note: 'at most 127 characters' },
		{ rule: 'PARCEL_DETAILS_OWNER', args: 'key' },
		{ rule: 'PARCEL_DETAILS_GROUP', args: 'key' },
		{ rule: 'PARCEL_DETAILS_ID', args: 'key', note: 'the parcel' },
		{ rule: 'PARCEL_DETAILS_AREA', args: 'integer', note: 'square metres' },
	] },
	{ title: 'Settings', id: 'settings', rules: [
		{ rule: 'PARCEL_DETAILS_FLAGS', args: 'integer', note: 'PARCEL_FLAG_*, as llGetParcelFlags' },
		{ rule: 'PARCEL_DETAILS_SEE_AVATARS', args: 'integer', note: 'boolean' },
		{ rule: 'PARCEL_DETAILS_SCRIPT_DANGER', args: 'integer', note: 'boolean; see llScriptDanger' },
	] },
	{ title: 'Landing and teleport routing', id: 'landing-and-teleport-routing', rules: [
		{ rule: 'PARCEL_DETAILS_LANDING_POINT', args: 'vector' },
		{ rule: 'PARCEL_DETAILS_LANDING_LOOKAT', args: 'vector' },
		{ rule: 'PARCEL_DETAILS_TP_ROUTING', args: 'integer', note: 'TP_ROUTING_*' },
	] },
	{ title: 'Prim usage', id: 'prim-usage', rules: [
		{ rule: 'PARCEL_DETAILS_PRIM_CAPACITY', args: 'integer', note: 'this and same-owner parcels, region-wide' },
		{ rule: 'PARCEL_DETAILS_PRIM_USED', args: 'integer', note: 'this and same-owner parcels, region-wide' },
	] },
];
