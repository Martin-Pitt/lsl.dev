/**
 * Feature pages are hand-written MDX in src/content/docs/features/<id>.mdx. This module reads
 * their component props (API names, constant groups, footer categories) straight from the MDX
 * source at build time, so feature chips, category links and the features index always match
 * the pages. See src/lib/feature-mdx.mjs for the format.
 */
import { parseFeatureMdx, withSubpages } from './feature-mdx.mjs';

const sources = import.meta.glob('../content/docs/features/*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const subSources = import.meta.glob('../content/docs/features/*/*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const name = (path: string) => path.replace(/^.*\/|\.mdx$/g, '');
const parent = (path: string) => path.split('/').slice(-2, -1)[0];

export type FeaturePage = ReturnType<typeof withSubpages>;
/** All feature pages, in slug order (the slua.dev sidebar order), with sub-pages merged in. */
export const featurePages: FeaturePage[] = Object.entries(sources)
	.map(([path, src]) => {
		const id = name(path);
		const subs = Object.entries(subSources).filter(([p]) => parent(p) === id).map(([p, s]) => parseFeatureMdx(name(p), s));
		return withSubpages(parseFeatureMdx(id, src), subs);
	})
	.sort((a, b) => a.id.localeCompare(b.id));
export const featurePageMap = new Map(featurePages.map(f => [f.id, f]));
/** Home feature of each definition category (set by `<FeatureFooter categories={...}>`). */
export const featurePageByCategory = new Map(featurePages.flatMap(f => f.categories.map(c => [c, f] as const)));
export function featureHref(id: string) { return `/features/${encodeURIComponent(id)}/`; }

const byName = new Map<string, Set<string>>();
const byGroup = new Map<string, Set<string>>();
const add = (m: Map<string, Set<string>>, k: string, id: string) => { if (!m.has(k)) m.set(k, new Set()); m.get(k)!.add(id); };
for (const f of featurePages) {
	for (const n of f.items) add(byName, n, f.id);
	for (const g of f.groups) add(byGroup, g, f.id);
}

/**
 * Feature chips for an API page: features that link the API (in a component or in the prose), or
 * that link a constant group the constant belongs to. In feature (slug) order.
 */
export function featuresForApi(entry: { name: string; groups?: string[] | null }): FeaturePage[] {
	const ids = new Set(byName.get(entry.name) ?? []);
	for (const g of entry.groups ?? []) for (const id of byGroup.get(g) ?? []) ids.add(id);
	return featurePages.filter(f => ids.has(f.id));
}
