/** Constant groups with a hand-edited order; /constants/groups/<name>/ uses it for its block and table. */
import type { RuleSection } from './types';
import { primParams } from './prim-params';
import { particleParams } from './particle-params';
import { gltfOverrides } from './gltf-overrides';
import { primMediaParams } from './prim-media-params';
import { objectDetails } from './object-details';
import { parcelDetails } from './parcel-details';
import { cameraParams } from './camera-params';
import { rezParams } from './rez-params';
import { characterParams } from './character-params';
import { httpRequestParams } from './http-request-params';
import { groundTextureParams } from './ground-texture-params';
import { environmentParams, environmentParamsGet } from './environment-params';
import { parcelMediaCommands, parcelMediaQuery } from './parcel-media';
export type { RuleSection, RuleLine, RuleForm } from './types';
export const ruleGroupOrders: Record<string, RuleSection[]> = {
	PrimParam: primParams,
	ParticleParam: particleParams,
	GLTFOverride: gltfOverrides,
	PrimMediaParam: primMediaParams,
	ObjectDetailsParam: objectDetails,
	ParcelDetailsParam: parcelDetails,
	CameraParam: cameraParams,
	RezParam: rezParams,
	CharacterParam: characterParams,
	HTTPRequestParam: httpRequestParams,
	GroundTextureParam: groundTextureParams,
	EnvironmentParam: environmentParams,
	EnvironmentParamReadOnly: environmentParamsGet,
	ParcelMediaCommand: parcelMediaCommands,
	ParcelMediaQuery: parcelMediaQuery,
};
/** Groups read with getter notation (`RULE → returned values`) on their group page. */
export const getterGroups = new Set(['ObjectDetailsParam', 'ParcelDetailsParam', 'EnvironmentParamReadOnly', 'ParcelMediaQuery']);
