/**
 * Starlight route data: marks the sidebar entry closest to the current page as current, so the
 * sidebar opens at it on deep pages that have no sidebar link of their own (API pages, constant
 * groups, categories, feature sub-pages, the wiki archive). The order of preference comes from
 * src/lib/page-nav.ts. Starlight renders aria-current="page" for it (overriding that attribute would
 * duplicate it without a Sidebar override).
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { pageNav } from './lib/page-nav';

type Entry = { type: 'link'; href: string; isCurrent: boolean; attrs: Record<string, any> } | { type: 'group'; entries: Entry[] };
const links = (entries: Entry[]): Extract<Entry, { type: 'link' }>[] => entries.flatMap(e => e.type === 'link' ? [e] : links(e.entries));

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const all = links(route.sidebar as Entry[]);
	if (all.some(l => l.isCurrent)) return;
	const path = context.url.pathname;
	const { sidebar } = pageNav(path, route.entry.data.title);
	const candidates = [...sidebar, ...(path.startsWith('/wiki/') ? ['/wiki/'] : [])];
	for (const href of candidates) {
		const hit = all.find(l => l.href === href);
		if (hit) { hit.isCurrent = true; return; }
	}
});
