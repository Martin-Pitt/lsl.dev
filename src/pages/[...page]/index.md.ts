/**
 * Markdown version of every docs page (MDX content collection), at /<page>/index.md and /index.md.
 * Linked from the page actions menu next to the title (src/components/starlight/PageActions.astro).
 * The Astro-route pages (catalog lists, categories, constant groups, prototypes) have no Markdown source and no menu.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { pageMarkdown } from '../../lib/page-markdown';

export const getStaticPaths = (async () => {
	const docs = await getCollection('docs');
	return docs.map(entry => ({ params: { page: entry.id === 'index' ? undefined : entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(pageMarkdown(props.entry as any), {
	headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
