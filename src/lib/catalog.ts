import data from '../data/catalog.json';
export const catalog = data;
export type ApiEntry = typeof data.functions[number];
export type WikiEntry = typeof data.wiki[number];
export const groups = ['functions', 'events', 'constants'] as const;
export type Group = typeof groups[number];
export const categoryMap = new Map(data.categories.map(c => [c.id, c]));
export function apiHref(kind: string, name: string) { return `/${kind.endsWith('s') ? kind : kind + 's'}/${encodeURIComponent(name)}/`; }
export function categoryHref(id: string) { return `/categories/${encodeURIComponent(id)}/`; }
export const allApi = [...data.functions, ...data.events, ...data.constants];
export const apiMap = new Map(allApi.map(a => [a.name, a]));
/** Href of an LSL type's page (src/content/docs/types/<name>.mdx; one per catalog type), or undefined. */
const typeNames = new Set(data.types.map(t => t.name));
export function typeHref(name: string) { return typeNames.has(name) ? `/types/${name}/` : undefined; }
export function wikiHref(slug: string) { return `/wiki/${slug}/`; }

// Feature pages: curated dashboards that drive /features/ and the sidebar (slugs match slua.dev).
import featureData from '../data/feature-clusters.json';
// planned: a guide, recipe or sub-page that does not exist yet; rendered as a labelled entry with no link.
export type FeatureLink = { feature?: string; category?: string; wiki?: string; href?: string; planned?: string; label?: string };
export type FeatureSection = { title: string; text?: string[]; items?: string[]; groups?: string[]; links?: FeatureLink[] };
export type Feature = { id: string; title: string; description: string; intro: string[]; sections: FeatureSection[]; categories: string[]; related?: string[]; wiki?: string[] };
export const features = featureData.features as Feature[];
export const featureRedirects = featureData.redirects as Record<string, string>;
export const featureMap = new Map(features.map(f => [f.id, f]));
/** Home feature of each definition category (every category has exactly one). */
export const featureByCategory = new Map(features.flatMap(f => f.categories.map(cat => [cat, f] as const)));
/** Features whose sections list an API by name, or list a constant group the API belongs to. */
const featuresByName = new Map<string, Feature[]>();
const featuresByGroup = new Map<string, Feature[]>();
function addTo(map: Map<string, Feature[]>, key: string, f: Feature) { const list = map.get(key) ?? []; if (!list.includes(f)) list.push(f); map.set(key, list); }
for (const f of features) for (const s of f.sections) { for (const n of s.items ?? []) addTo(featuresByName, n, f); for (const g of s.groups ?? []) addTo(featuresByGroup, g, f); }
export function featuresForApi(entry: { name: string; groups?: string[] }): Feature[] {
  const out = [...(featuresByName.get(entry.name) ?? [])];
  for (const g of entry.groups ?? []) for (const f of featuresByGroup.get(g) ?? []) if (!out.includes(f)) out.push(f);
  return features.filter(f => out.includes(f));
}
export function featureHref(id: string) { return `/features/${encodeURIComponent(id)}/`; }
export function constantGroupHref(group: string) { return `/constants/groups/${encodeURIComponent(group)}/`; }
export const wikiByTitle = new Map(data.wiki.map(w => [w.title, w]));
/** Public constants that belong to an enum/flag group, in definition order. */
export function constantsInGroup(group: string) {
  return data.constants.filter(c => ((c as any).groups as string[] | undefined)?.includes(group));
}
