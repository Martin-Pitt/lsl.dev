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
export function wikiHref(slug: string) { return `/wiki/${slug}/`; }

// Feature clusters: curated task groupings that drive /features/ and the Reference sidebar.
import clusterData from '../data/feature-clusters.json';
export type Cluster = typeof clusterData.clusters[number];
export const clusterGroups = clusterData.groups;
export const clusters = clusterData.clusters;
export const clusterMap = new Map(clusters.map(c => [c.id, c]));
export const clusterByCategory = new Map(clusters.flatMap(c => c.categories.map(cat => [cat, c] as const)));
export function featureHref(id: string) { return `/features/${encodeURIComponent(id)}/`; }
export function constantGroupHref(group: string) { return `/constants/groups/${encodeURIComponent(group)}/`; }
export const wikiByTitle = new Map(data.wiki.map(w => [w.title, w]));
/** Public constants that belong to an enum/flag group, in definition order. */
export function constantsInGroup(group: string) {
  return data.constants.filter(c => ((c as any).groups as string[] | undefined)?.includes(group));
}
/** Pagefind aliases: names people search for that are not LSL functions. */
export const searchAliases: Record<string, { alias: string; note: string }[]> = {
  llSetLinkPrimitiveParamsFast: [{ alias: 'llSetPrimitiveParamsFast', note: 'There is no llSetPrimitiveParamsFast function. Use llSetLinkPrimitiveParamsFast with LINK_THIS to change the prim that contains the script.' }],
};
