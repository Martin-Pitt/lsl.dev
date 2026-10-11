/**
 * Markdown version of every docs page (MDX content collection), at /<page>/index.md and /index.md.
 * Linked from the page actions menu next to the title (src/components/starlight/PageActions.astro).
 * The Astro-route pages (catalog lists, categories, constant groups) have no Markdown source and no menu.
 */
import type { APIRoute, GetStaticPaths, ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { pageMarkdown } from '../../lib/page-markdown';
import { imageKey } from '../../lib/page-markdown/util';

export const getStaticPaths = (async () => {
	const docs = await getCollection('docs');
	return docs.map(entry => ({ params: { page: entry.id === 'index' ? undefined : entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

/** Same glob and src rules as <Figure> (src/components/authoring/asides/Figure.astro). */
const images = import.meta.glob<{ default: ImageMetadata }>('/src/**/*.{png,jpg,jpeg,webp,avif,gif,svg}');
const showcases = import.meta.glob('/src/components/authoring/*/Showcase.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Built URLs of the <Figure src="..."> images in a body, from getImage() with the options <Image>
 * gets, so the URL is the one the HTML page uses (and the file is emitted). */
async function figureImages(body: string) {
	const out = new Map<string, string>();
	if (body.includes('Showcase.mdx')) body += Object.values(showcases).join('\n');
	for (const m of body.matchAll(/<Figure\b([^>]*)>/g)) {
		const src = /\bsrc="([^"]+)"/.exec(m[1])?.[1];
		const width = /\bwidth=\{(\d+)\}/.exec(m[1])?.[1];
		const load = src && images[src.replace(/^~\//, '/src/')];
		if (!load) continue;
		const img = await getImage({ src: (await load()).default, ...(width ? { width: Number(width) } : {}) });
		out.set(imageKey(src, width ? Number(width) : undefined), img.src);
	}
	return out;
}

export const GET: APIRoute = async ({ props }) => {
	const entry = props.entry as any;
	const page = { ...entry, images: await figureImages(entry.body ?? '') };
	return new Response(pageMarkdown(page), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
