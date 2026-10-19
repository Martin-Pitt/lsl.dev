/**
 * Page navigation shared by the PageTitle override (breadcrumbs and chips under the title) and
 * the sidebar route data (which sidebar entry is "current" on deep pages).
 *
 * Everything is derived from the URL and the catalog, so it works for content pages (MDX) and
 * for the Astro routes alike.
 */
import { catalog, categoryMap, constantGroupHref, featureByCategory, featureHref } from './catalog';
import { featuresForApi, featurePageByCategory } from './features';
import { categoryLinkHref as categoryHref } from './categories';
import { primaryFeature } from './primary-feature';

export type Crumb = { label: string; href?: string };
/** Chip kinds keep their own visual style; `kind` is also read out to screen readers. */
export type Chip = { label: string; href: string; kind: 'Category' | 'Feature' | 'Group' | 'Page' };
export type PageNav = { crumbs: Crumb[]; chips: Chip[]; sidebar: string[] };

const SECTIONS: Record<string, Crumb> = {
	functions: { label: 'Functions', href: '/functions/' },
	events: { label: 'Events', href: '/events/' },
	constants: { label: 'Constants', href: '/constants/' },
	categories: { label: 'Categories', href: '/categories/' },
	features: { label: 'Features', href: '/features/' },
	wiki: { label: 'Wiki archive', href: '/wiki/' },
	fundamentals: { label: 'Fundamentals', href: '/fundamentals/' },
	guides: { label: 'Guides', href: '/guides/' },
	recipes: { label: 'Recipes', href: '/recipes/' },
	reference: { label: 'Reference', href: '/reference/' },
};
/** Nested sections under a top-level section, for their breadcrumb label (keyed by the first two URL parts). */
const SUBSECTIONS: Record<string, Crumb> = {
	'fundamentals/types': { label: 'Types', href: '/fundamentals/types/' },
	'fundamentals/flow-control': { label: 'Flow control', href: '/fundamentals/flow-control/' },
};
const KINDS: Record<string, any[]> = { functions: catalog.functions, events: catalog.events, constants: catalog.constants };
const api = new Map<string, any>();
for (const [plural, list] of Object.entries(KINDS)) for (const e of list) api.set(`${plural}/${e.name}`, e);

const featureChips = (fs: { id: string; title: string }[]): Chip[] => fs.map(f => ({ label: f.title, href: featureHref(f.id), kind: 'Feature' }));

/** Entry for an API page id such as "functions/llDialog", if it is one. */
export function apiEntry(path: string) { return api.get(path); }

/**
 * @param pathname  the page URL path, e.g. /functions/llDialog/
 * @param title     the page title (last crumb)
 * @param siblings  for feature sub-pages: the other pages of the same feature
 */
export function pageNav(pathname: string, title: string, siblings: { label: string; href: string }[] = []): PageNav {
	const parts = decodeURIComponent(pathname).replace(/^\/|\/$/g, '').split('/').filter(Boolean);
	const crumbs: Crumb[] = []; const chips: Chip[] = []; const sidebar: string[] = [];
	if (parts.length < 2) return { crumbs, chips, sidebar };
	const [section] = parts;
	const entry = parts.length === 2 ? api.get(parts.join('/')) : undefined;
	if (SECTIONS[section]) crumbs.push(SECTIONS[section]);
	if (entry) {
		const groups: string[] = entry.groups ?? [];
		const category: string | undefined = entry.categories[0];
		// Middle crumb: the API's primary feature (src/lib/primary-feature-rules.mjs); without one, the
		// constant group or the category. Constants: Constants › feature › group › name.
		const primary = primaryFeature(entry);
		if (primary) crumbs.push({ label: primary.title, href: featureHref(primary.id) });
		if (entry.kind === 'constant' && groups[0]) crumbs.push({ label: groups[0], href: constantGroupHref(groups[0]) });
		else if (!primary && category) crumbs.push({ label: categoryMap.get(category)?.label || category, href: categoryHref(category) });
		for (const g of groups) chips.push({ label: g, href: constantGroupHref(g), kind: 'Group' });
		for (const id of entry.categories) chips.push({ label: categoryMap.get(id)?.label || id, href: categoryHref(id), kind: 'Category' });
		const fs = featuresForApi(entry);
		// The primary feature is already the breadcrumb; its chip would repeat it.
		chips.push(...featureChips(fs.filter(f => f.id !== primary?.id)));
		// Closest sidebar entry: the primary feature, else a category, else another feature area, else the index.
		if (primary) sidebar.push(featureHref(primary.id));
		for (const id of entry.categories) sidebar.push(categoryHref(id));
		for (const f of fs) sidebar.push(featureHref(f.id));
		for (const g of groups) sidebar.push(constantGroupHref(g));
		sidebar.push(SECTIONS[section].href!);
	} else if (section === 'constants' && parts[1] === 'groups' && parts[2]) {
		crumbs.push({ label: 'Constant groups', href: '/constants/groups/' });
		chips.push(...featureChips(featuresForApi({ name: '', groups: [parts[2]] })));
		sidebar.push(constantGroupHref(parts[2]), '/constants/groups/', '/constants/');
	} else if (section === 'categories') {
		const f = featureByCategory.get(parts[1]);
		// Sub-pages of the home feature that name the category in their footer (e.g. Input › Game Control).
		const subs = featurePageByCategory.get(parts[1])?.subpages.filter(s => s.categories.includes(parts[1])) ?? [];
		if (f) chips.push(...featureChips([f]));
		chips.push(...subs.map(s => ({ label: s.title, href: s.href, kind: 'Page' as const })));
		// Highlight a sub-page in the sidebar only when it is the category's one page.
		sidebar.push(categoryHref(parts[1]), ...(subs.length === 1 ? [subs[0].href] : []), ...(f ? [featureHref(f.id)] : []), '/categories/');
	} else if (section === 'features' && parts.length >= 3) {
		const parent = siblings.find(s => s.href === `/features/${parts[1]}/`);
		if (parent) crumbs.push({ label: parent.label, href: parent.href });
		chips.push(...siblings.filter(s => s.href !== pathname && s.href !== parent?.href).map(s => ({ ...s, kind: 'Page' as const })));
		sidebar.push(`/features/${parts[1]}/`, '/features/');
	} else {
		// Generic: every ancestor path that is a section index.
		for (let i = 2; i < parts.length; i++) crumbs.push(SUBSECTIONS[parts.slice(0, i).join('/')] ?? { label: parts[i - 1] });
		sidebar.push(...parts.map((_, i) => '/' + parts.slice(0, parts.length - i).join('/') + '/'));
	}
	crumbs.push({ label: title });
	return { crumbs, chips, sidebar: [...new Set(sidebar)] };
}
