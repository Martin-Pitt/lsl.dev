/**
 * The primary feature of each API page (breadcrumb and sidebar), computed from the feature MDX
 * sources. Rules: src/lib/primary-feature-rules.mjs. Overrides: src/data/primary-feature-overrides.json.
 */
import { featurePageMap, featurePages, type FeaturePage } from './features';
import { featureScore, choosePrimary, type Choice } from './primary-feature-rules.mjs';
import overrideData from '../data/primary-feature-overrides.json';

const sources = import.meta.glob('../content/docs/features/*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const subSources = import.meta.glob('../content/docs/features/*/*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (id: string) => Object.entries(sources).find(([p]) => p.endsWith(`/${id}.mdx`))?.[1] ?? '';
const subs = (id: string) =>
	Object.entries(subSources)
		.filter(([p]) => p.split('/').slice(-2, -1)[0] === id)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, s]) => s);

export const overrides: Record<string, string> = (overrideData as { overrides?: Record<string, string> }).overrides ?? {};
const scores = featurePages.map(f => featureScore(f, src(f.id), subs(f.id)));
const cache = new Map<string, Choice>();
type Entry = { name: string; categories?: string[] | null; groups?: string[] | null };

export function primaryChoice(entry: Entry): Choice {
	let c = cache.get(entry.name);
	if (!c) cache.set(entry.name, (c = choosePrimary(entry, scores, overrides)));
	return c;
}
/** The API's primary feature page, or undefined (the breadcrumb then falls back to category or group). */
export function primaryFeature(entry: Entry): FeaturePage | undefined {
	const id = primaryChoice(entry).feature;
	return id ? featurePageMap.get(id) : undefined;
}
