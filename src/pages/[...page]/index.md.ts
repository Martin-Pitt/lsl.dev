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

/** Same glob and src rules as the media batch (src/components/authoring/media/image.ts). */
const images = import.meta.glob<{ default: ImageMetadata }>('/src/**/*.{png,jpg,jpeg,webp,avif,gif,svg}');
const showcases = import.meta.glob('/src/components/authoring/*/Showcase.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Built URLs of the images of the media components (<Figure src>, <Compare before/after>,
 * <Hotspots src>) in a body, from getImage() with the options <Image> gets, so the URL is the one
 * the HTML page uses (and the file is emitted). Each is keyed with its width and, for a zoomed
 * <Figure>, also without it (the full-size URL). */
async function figureImages(body: string) {
	const out = new Map<string, string>();
	if (body.includes('Showcase.mdx')) body += Object.values(showcases).join('\n');
	for (const m of body.matchAll(/<(?:Figure|Compare|Hotspots)\b([^>]*)>/g)) {
		const width = /\bwidth=\{(\d+)\}/.exec(m[1])?.[1];
		for (const [, src] of m[1].matchAll(/\b(?:src|before|after)="([^"]+)"/g)) {
			const load = images[src.replace(/^~\//, '/src/')];
			if (!load) continue;
			const meta = (await load()).default;
			for (const w of width ? [Number(width), undefined] : [undefined]) {
				const img = await getImage({ src: meta, ...(w ? { width: w } : {}) });
				out.set(imageKey(src, w), img.src);
			}
		}
	}
	return out;
}

export const GET: APIRoute = async ({ props }) => {
	const entry = props.entry as any;
	const page = { ...entry, images: await figureImages(entry.body ?? '') };
	return new Response(pageMarkdown(page), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
