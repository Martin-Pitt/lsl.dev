/** /llms-full.txt: the Markdown export of every function, event and constant page, concatenated
 * (same conversion as /<page>/index.md). Listed in /llms.txt when LLMS_FULL is true. See docs/llms.md. */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pageMarkdown } from '../lib/page-markdown';

export const LLMS_FULL = true;

export const GET: APIRoute = async () => {
	const order = ['functions', 'events', 'constants'];
	const docs = (await getCollection('docs'))
		.filter(e => order.includes(e.id.split('/')[0]) && e.id.split('/').length === 2)
		.sort((a, b) => order.indexOf(a.id.split('/')[0]) - order.indexOf(b.id.split('/')[0]) || a.id.localeCompare(b.id));
	// API pages carry no <Figure> images; an empty map keeps any stray one as plain text.
	const parts = docs.map(e => pageMarkdown({ ...(e as any), images: new Map() }, { header: false }));
	return new Response(parts.join('\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
