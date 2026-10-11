/**
 * Starlight route middleware for the MDX API pages (src/content/docs/{functions,events,constants}):
 * uses the definition's description as the page's meta description. (Breadcrumbs and chips are
 * rendered under the title by the PageTitle override.) Also adds the text/markdown alternate link
 * of every MDX page, schema.org JSON-LD on API pages (TechArticle) and the home page (WebSite);
 * see docs/llms.md.
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getCollection } from 'astro:content';
import { catalog } from './lib/catalog';
import { SITE } from './lib/page-markdown/util';

const KINDS: Record<string, any[]> = { functions: catalog.functions, events: catalog.events, constants: catalog.constants };
const index = new Map<string, any>();
for (const [plural, list] of Object.entries(KINDS)) for (const e of list) index.set(`${plural}/${e.name}`, e);

/** A JSON-LD script tag; `<` is escaped so the JSON cannot close the script element. */
const jsonLd = (data: object) => ({ tag: 'script' as const, attrs: { type: 'application/ld+json' }, content: JSON.stringify(data).replace(/</g, '\\u003c') });
const KIND_LABEL: Record<string, string> = { function: 'LSL function', event: 'LSL event', constant: 'LSL constant' };
/** TechArticle for an API page: the definitions one-liner, the signature as a code sample, and the
 * newest wiki source date (frontmatter `source.date`) as dateModified. */
function apiJsonLd(entry: any, id: string, source?: { date: string }) {
	return jsonLd({
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: entry.name,
		name: entry.name,
		description: entry.description.split('\n')[0],
		url: `${SITE}/${id}/`,
		about: KIND_LABEL[entry.kind],
		...(source?.date ? { dateModified: source.date } : {}),
		inLanguage: 'en',
		isPartOf: { '@type': 'WebSite', name: 'lsl.dev', url: `${SITE}/` },
		...(source ? { license: 'https://creativecommons.org/licenses/by-sa/3.0/' } : {}),
		hasPart: { '@type': 'SoftwareSourceCode', programmingLanguage: 'LSL', text: entry.signature },
	});
}

/** Docs entries with an MDX file, i.e. the pages that have a /<page>/index.md export (src/pages/[...page]/index.md.ts). */
let docIds: Promise<Map<string, string>> | undefined;

export const onRequest = defineRouteMiddleware(async (context) => {
	const route = context.locals.starlightRoute;
	// Every page with a Markdown version points at it (Astro-route pages have a synthetic entry and no file).
	// Matched by file path: the home page's route entry id is not the collection id 'index'.
	docIds ??= getCollection('docs').then(docs => new Map(docs.filter(d => d.filePath).map(d => [d.filePath!, d.id])));
	const docId = route.entry.filePath ? (await docIds).get(route.entry.filePath) : undefined;
	if (docId) route.head.push({ tag: 'link', attrs: { rel: 'alternate', type: 'text/markdown', href: docId === 'index' ? '/index.md' : `/${docId}/index.md` } });
	if (docId === 'index') route.head.push(jsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'lsl.dev', url: `${SITE}/`, description: 'Unofficial developer documentation for the Linden Scripting Language (LSL) of Second Life.', inLanguage: 'en' }));
	const entry = index.get(route.entry.id);
	if (!entry) return;
	route.head.push(apiJsonLd(entry, route.entry.id, (route.entry.data as any).source));
	const description = entry.description.split('\n')[0].slice(0, 160);
	if (!route.entry.data.description) {
		route.entry.data.description = description;
		route.head.push({ tag: 'meta', attrs: { name: 'description', content: description } });
	}
});
