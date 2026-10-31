/**
 * Wiki article -> local page map. A page lists the SL wiki articles it covers in its frontmatter
 * (`wikiArticles: [Combat_Log, Category:LSL_Combat2]`); links to those articles anywhere on the site
 * then point at the local page instead (src/lib/rehype-wiki-local.ts for HTML, page-markdown for
 * the Markdown copies). Provenance links (`source.url`, attributions) are not touched.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const DOCS = join(process.cwd(), 'src/content/docs');
const WIKI = /^https?:\/\/wiki\.secondlife\.com\/wiki\/([^?#]+)(?:#.*)?$/;

/** Wiki titles compare like MediaWiki: spaces and underscores alike, first letter case-insensitive. */
export const wikiTitleKey = (title: string) => {
	const t = decodeURIComponent(title).replace(/ /g, '_').trim();
	return t.charAt(0).toUpperCase() + t.slice(1);
};

function files(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
		e.isDirectory() ? files(join(dir, e.name)) : /\.mdx?$/.test(e.name) ? [join(dir, e.name)] : []);
}

const map = new Map<string, { href: string; file: string }>();
for (const file of files(DOCS)) {
	const text = readFileSync(file, 'utf-8');
	if (!text.includes('wikiArticles')) continue;
	const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
	const titles: string[] = (fm && parse(fm[1])?.wikiArticles) || [];
	const id = relative(DOCS, file).replace(/\\/g, '/').replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
	for (const t of titles) {
		const key = wikiTitleKey(t);
		const other = map.get(key);
		if (other) throw new Error(`wikiArticles: ${t} is claimed by both ${other.file} and ${id}`);
		map.set(key, { href: id ? `/${id}/` : '/', file: id });
	}
}

/** Local href for a wiki article URL, or undefined. `selfId` (a docs id) is never linked to itself. */
export function localForWiki(url: string, selfId?: string): string | undefined {
	const m = WIKI.exec(url);
	if (!m) return;
	const hit = map.get(wikiTitleKey(m[1]));
	if (!hit || hit.file === selfId) return;
	return hit.href;
}

/** Rewrites Markdown links `](wiki url)` to local pages. */
export const rewriteWikiLinks = (md: string, selfId?: string) =>
	md.replace(/\]\((https?:\/\/wiki\.secondlife\.com\/wiki\/[^)\s]+)\)/g, (all, url) => {
		const local = localForWiki(url, selfId);
		return local ? `](${local})` : all;
	});
