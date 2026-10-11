/**
 * The Limits dataset (src/data/limits.yaml): loading, validation and Markdown rendering, shared by
 * <LimitsTable>, <Limit> and the Markdown export (src/lib/page-markdown/asides.ts).
 *
 * Every text field is Markdown copied verbatim from the wiki-derived tables. It is rendered with
 * the site's Markdown pipeline (GFM, smartypants, rehype-inline-lsl), so the cells look exactly as
 * they did when they were written as Markdown tables in limits.mdx. The hover-card plugin runs in
 * fragment mode: it only marks API links, and the component binds them to the page's cards with
 * bindFragmentCards() (see rehype-api-hovercards.ts), so the page keeps one card per API.
 */
import { parse } from 'yaml';
import { createMarkdownProcessor, type MarkdownRenderer } from '@astrojs/markdown-remark';
import raw from '../../../data/limits.yaml?raw';
import rehypeInlineLsl from '../../../lib/rehype-inline-lsl';
import rehypeApiHovercards from '../hovercards/rehype-api-hovercards';

export type LimitField = 'label' | 'value' | 'lower' | 'upper' | 'notes' | 'related';
export type LimitSection = { id: string; heading: string; columns: Partial<Record<LimitField, string>> };
export type LimitEntry = {
	id: string; section: string; label: string;
	value?: string; lower?: string; upper?: string; notes?: string; related?: string;
	apis?: string[]; features?: string[];
};

const FIELDS: LimitField[] = ['label', 'value', 'lower', 'upper', 'notes', 'related'];
const data = parse(raw) as { sections: LimitSection[]; limits: LimitEntry[] };

export const limitSections = new Map<string, LimitSection>();
export const limitById = new Map<string, LimitEntry>();
export const LIMITS_PAGE = '/reference/limits/';

/** Validation runs when the module loads, so a broken dataset fails the build. */
for (const s of data.sections) {
	if (limitSections.has(s.id)) throw new Error(`limits.yaml: duplicate section "${s.id}"`);
	for (const f of Object.keys(s.columns)) if (!FIELDS.includes(f as LimitField)) throw new Error(`limits.yaml: section "${s.id}" has unknown column "${f}"`);
	limitSections.set(s.id, s);
}
for (const l of data.limits) {
	if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.id ?? '')) throw new Error(`limits.yaml: bad id "${l.id}"`);
	if (limitById.has(l.id)) throw new Error(`limits.yaml: duplicate id "${l.id}"`);
	if (!limitSections.has(l.section)) throw new Error(`limits.yaml: "${l.id}" is in unknown section "${l.section}"`);
	if (!l.label) throw new Error(`limits.yaml: "${l.id}" has no label`);
	limitById.set(l.id, l);
}

export const limitsIn = (section: string) => {
	if (!limitSections.has(section)) throw new Error(`<LimitsTable>: unknown section "${section}" (sections are listed in src/data/limits.yaml)`);
	return data.limits.filter(l => l.section === section);
};

/** The row for an id; an unknown id fails the build. */
export function getLimit(id: string, who = '<Limit>'): LimitEntry {
	const l = limitById.get(id);
	if (!l) throw new Error(`${who}: unknown limit id "${id}" (ids are in src/data/limits.yaml)`);
	return l;
}

export const limitHref = (id: string) => `${LIMITS_PAGE}#${id}`;

/** A row's headline value as Markdown: `value`, or the upper limit, or "lower to upper" when both
 * ends are given (an "n/a" end is left out). */
export function limitValue(l: LimitEntry): string {
	if (l.value) return l.value;
	const given = (s?: string) => (s && s.trim().toLowerCase() !== 'n/a' ? s : undefined);
	const lo = given(l.lower), hi = given(l.upper);
	return lo && hi ? `${lo} to ${hi}` : hi ?? lo ?? '';
}

let renderer: Promise<MarkdownRenderer> | undefined;
const cache = new Map<string, Promise<string>>();

/** Markdown to HTML with the site's pipeline. `inline` unwraps a single paragraph, as in a table cell. */
export function renderMarkdown(md: string, inline = true): Promise<string> {
	const key = `${inline ? 'i' : 'b'}:${md}`;
	let html = cache.get(key);
	if (!html) {
		renderer ??= createMarkdownProcessor({ rehypePlugins: [rehypeInlineLsl as any, [rehypeApiHovercards as any, { fragment: true }]] });
		html = renderer.then(r => r.render(md, { frontmatter: { title: 'Limits' } as any })).then(({ code }) => {
			// Starlight's MDX pipeline marks inline code dir="auto" (RTL support); match it.
			code = code.replace(/<code([^>]*)>/g, (tag, attrs) => (/\sdir=/.test(attrs) ? tag : `<code${attrs} dir="auto">`));
			const m = /^<p>([\s\S]*)<\/p>$/.exec(code.trim());
			return inline && m && !m[1].includes('<p>') ? m[1] : code;
		});
		cache.set(key, html);
	}
	return html;
}
