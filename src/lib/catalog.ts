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
