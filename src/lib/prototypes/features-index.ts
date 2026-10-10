/**
 * PROTOTYPE data for variant D under /prototypes/features/ (temporary; see
 * docs/prototypes/features-index.md). Purpose lines, tasks and key APIs are shared with the real
 * Features Overview through src/lib/features-overview.ts; only D's goal groups live here.
 */
import { featurePages } from '../features';
import { featurePageMap, type FeaturePage } from '../features-overview';

export * from '../features-overview';

function need(id: string): FeaturePage {
	const f = featurePageMap.get(id);
	if (!f) throw new Error(`prototypes/features-index: unknown feature "${id}"`);
	return f;
}

/** Variant D: 5 goal groups (Miller/chunking; Common Region). */
export const goalGroups: { id: string; title: string; features: string[] }[] = [
	{ id: 'logic', title: 'Script logic', features: ['events', 'math', 'data-transmission', 'data-storage'] },
	{ id: 'world', title: 'Build the world', features: ['prims', 'linkset', 'movement', 'physics', 'pathfinding', 'land'] },
	{ id: 'people', title: 'Interact with avatars', features: ['avatar', 'input', 'camera', 'experience', 'combat', 'money'] },
	{ id: 'talk', title: 'Talk to scripts & people', features: ['communications', 'dialog'] },
	{ id: 'media', title: 'Look & sound', features: ['textures', 'effects', 'sound', 'animesh', 'environments'] },
];
const listed = goalGroups.flatMap(g => g.features);
/** Features no goal group lists yet go into a trailing "Other" group, so D never hides a page. */
const other = featurePages.filter(f => !listed.includes(f.id)).map(f => f.id);
export const byGoal = [...goalGroups, ...(other.length ? [{ id: 'other', title: 'Other', features: other }] : [])]
	.map(g => ({ ...g, pages: g.features.map(need) }));
