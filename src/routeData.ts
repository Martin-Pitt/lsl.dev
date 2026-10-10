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
	const current = all.filter(l => l.isCurrent);
	// The same page can be linked twice (e.g. a feature page under Features and as the overview of its
	// category group under Reference › Categories). Prefer the match inside the top-level section the
	// URL belongs to; among those, the most deeply nested one.
	if (current.length > 1) {
		const depth = new Map<Entry, number>();
		const top = new Map<Entry, string>();
		const walk = (es: Entry[], d: number, section: string) => es.forEach(e => {
			if (e.type === 'link') { depth.set(e, d); top.set(e, section); }
			else walk(e.entries, d + 1, d === 0 ? (e as any).label : section);
		});
		walk(route.sidebar as Entry[], 0, '');
		const seg = context.url.pathname.split('/')[1];
		const home = seg === 'features' ? 'Features' : seg === 'fundamentals' ? 'Fundamentals' : 'Reference';
		const score = (l: Entry) => (top.get(l) === home ? 1000 : 0) + depth.get(l)!;
		const keep = current.reduce((a, b) => (score(b) > score(a) ? b : a));
		for (const l of current) if (l !== keep) l.isCurrent = false;
	}
	if (current.length) return;
	const path = context.url.pathname;
	const { sidebar } = pageNav(path, route.entry.data.title);
	const candidates = [...sidebar, ...(path.startsWith('/wiki/') ? ['/wiki/'] : [])];
	for (const href of candidates) {
		const hit = all.find(l => l.href === href);
		if (hit) { hit.isCurrent = true; return; }
	}
});
