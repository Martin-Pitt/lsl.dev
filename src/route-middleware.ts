/**
 * Starlight route middleware for the MDX API pages (src/content/docs/{functions,events,constants}):
 * uses the definition's description as the page's meta description. (Breadcrumbs and chips are
 * rendered under the title by the PageTitle override.)
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { catalog } from './lib/catalog';

const KINDS: Record<string, any[]> = { functions: catalog.functions, events: catalog.events, constants: catalog.constants };
const index = new Map<string, any>();
for (const [plural, list] of Object.entries(KINDS)) for (const e of list) index.set(`${plural}/${e.name}`, e);

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const entry = index.get(route.entry.id);
	if (!entry) return;
	const description = entry.description.split('\n')[0].slice(0, 160);
	if (!route.entry.data.description) {
		route.entry.data.description = description;
		route.head.push({ tag: 'meta', attrs: { name: 'description', content: description } });
	}
});
