/**
 * CAMERA_* rules for llSetCameraParams and /constants/groups/CameraParam/, grouped by everyday
 * usage. Every public CameraParam member must appear exactly once. Shapes come from the LSL
 * definitions; ranges and defaults from the wiki's llSetCameraParams table.
 */
import type { RuleSection } from './types';

export const cameraParams: RuleSection[] = [
	{ title: 'Scripted control', id: 'scripted-control', rules: [
		{ rule: 'CAMERA_ACTIVE', note: 'default FALSE' },
	] },
	{ title: 'Fixed position and focus', id: 'fixed-position-and-focus', rules: [
		{ rule: 'CAMERA_POSITION', note: 'region coordinates' },
		{ rule: 'CAMERA_POSITION_LOCKED', note: 'default FALSE' },
		{ rule: 'CAMERA_FOCUS', note: 'region coordinates' },
		{ rule: 'CAMERA_FOCUS_LOCKED', note: 'default FALSE' },
	] },
	{ title: 'Following the avatar', id: 'following-the-avatar', rules: [
		{ rule: 'CAMERA_DISTANCE', note: '0.5 to 50; default 3.0' },
		{ rule: 'CAMERA_PITCH', note: '-45 to 80; default 0.0' },
		{ rule: 'CAMERA_FOCUS_OFFSET', note: '<-10,-10,-10> to <10,10,10>; default ZERO_VECTOR' },
		{ rule: 'CAMERA_BEHINDNESS_ANGLE', note: '0 to 180; default 10.0' },
		{ rule: 'CAMERA_BEHINDNESS_LAG', note: '0 to 3; default 0.0' },
	] },
	{ title: 'Lag and thresholds', id: 'lag-and-thresholds', rules: [
		{ rule: 'CAMERA_POSITION_LAG', note: '0 to 3; default 0.1' },
		{ rule: 'CAMERA_FOCUS_LAG', note: '0 to 3; default 0.1' },
		{ rule: 'CAMERA_POSITION_THRESHOLD', note: '0 to 4; default 1.0' },
		{ rule: 'CAMERA_FOCUS_THRESHOLD', note: '0 to 4; default 1.0' },
	] },
];
