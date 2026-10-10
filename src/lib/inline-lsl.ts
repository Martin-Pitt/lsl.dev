/**
 * Build-time syntax highlighting for inline LSL.
 *
 * Uses Shiki with the same LSL grammar and the same github-dark / github-light themes as the
 * expressive-code blocks (ec.config.mjs). Output is a single plain `<code class="lsl-inline">`
 * whose token spans carry `--shiki-dark` / `--shiki-light` colours; custom.css picks one per
 * site theme. API names (functions, events, constants) become links to their reference pages.
 *
 * Used by the InlineSyntax component (MDX and Astro) and by `enhanceHtml` for rendered wiki HTML.
 */
import { createHighlighter, type Highlighter } from 'shiki';
import grammar from '../content/data/lsl_grammar.json';
import { apiMap, apiHref } from './catalog';

const THEMES = { dark: 'github-dark', light: 'github-light' } as const;
let instance: Promise<Highlighter> | undefined;
const highlighter = () => (instance ??= createHighlighter({ themes: [THEMES.dark, THEMES.light], langs: [grammar as any] }));

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
export const unescapeHtml = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
	e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : NAMED[e.toLowerCase()] ?? m);

/** Href of an API entry by exact name, if it is in the public reference. */
export function apiLink(name: string): string | undefined {
	const entry = apiMap.get(name);
	return entry ? apiHref(entry.kind, entry.name) : undefined;
}

export interface InlineOptions {
	/** Link API names to their pages (default true). */
	link?: boolean;
	/** Name of the current page; never linked to itself. */
	self?: string;
}

function linkNames(text: string, opts: InlineOptions) {
	if (opts.link === false) return escape(text);
	let out = '', last = 0;
	for (const m of text.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
		const href = m[0] !== opts.self ? apiLink(m[0]) : undefined;
		if (!href) continue;
		out += escape(text.slice(last, m.index)) + `<a class="lsl-link" href="${escape(href)}">${m[0]}</a>`;
		last = m.index! + m[0].length;
	}
	return out + escape(text.slice(last));
}

/** Highlight a fragment of LSL as inline code. */
export async function inlineLsl(code: string, opts: InlineOptions = {}): Promise<string> {
	const h = await highlighter();
	const fg = { dark: h.getTheme(THEMES.dark).fg.toLowerCase(), light: h.getTheme(THEMES.light).fg.toLowerCase() };
	const { tokens } = h.codeToTokens(code, { lang: 'lsl' as any, themes: THEMES, defaultColor: false });
	const body = tokens.map(line => line.map(t => {
		const style = (t.htmlStyle ?? {}) as Record<string, string>;
		const dark = style['--shiki-dark'], light = style['--shiki-light'];
		const inner = linkNames(t.content, opts);
		// Default-foreground tokens inherit the surrounding inline-code colour.
		if ((!dark || dark.toLowerCase() === fg.dark) && (!light || light.toLowerCase() === fg.light)) return inner;
		return `<span style="--shiki-dark:${escape(dark ?? 'inherit')};--shiki-light:${escape(light ?? 'inherit')}">${inner}</span>`;
	}).join('')).join('\n');
	// Expressions and other multi-word snippets may wrap at spaces; single identifiers never break.
	const cls = /\s/.test(code.trim()) ? 'lsl-inline lsl-phrase' : 'lsl-inline';
	return `<code class="${cls}">${body}</code>`;
}

async function replaceAsync(text: string, re: RegExp, fn: (...m: string[]) => Promise<string>) {
	const jobs: Promise<string>[] = [];
	text.replace(re, (...m) => { jobs.push(fn(...(m as string[]))); return ''; });
	const done = await Promise.all(jobs);
	let i = 0;
	return text.replace(re, () => done[i++]);
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Highlight inline code in rendered HTML (wiki prose, tables, descriptions):
 * `<code>` outside `<pre>`, links to API pages whose label is the API name, and table cells
 * that hold nothing but an API name. Block code (`<pre>`) is left for expressive-code.
 */
export async function enhanceHtml(html: string, opts: InlineOptions = {}): Promise<string> {
	const parts = html.split(/(<pre\b[\s\S]*?<\/pre>)/);
	for (let i = 0; i < parts.length; i += 2) {
		let seg = parts[i];
		seg = await replaceAsync(seg, /<code>([\s\S]*?)<\/code>/g, async (whole, inner) => {
			const link = inner.match(/^<a href="([^"]+)">([^<]*)<\/a>$/);
			if (link) return `<a class="lsl-ref" href="${link[1]}">${await inlineLsl(unescapeHtml(link[2]), { link: false })}</a>`;
			if (inner.includes('<')) return whole; // mixed markup stays as authored
			return inlineLsl(unescapeHtml(inner), opts);
		});
		seg = await replaceAsync(seg, /<a href="(\/(?:functions|events|constants)\/[^"/]+\/)">([A-Za-z_][A-Za-z0-9_]*)<\/a>/g, async (_, href, name) =>
			`<a class="lsl-ref" href="${href}">${await inlineLsl(name, { link: false })}</a>`);
		seg = await replaceAsync(seg, /<td>(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*)<\/td>/g, async (whole, a, name, b) =>
			IDENT.test(name) && apiMap.has(name) ? `<td>${a}${await inlineLsl(name, opts)}${b}</td>` : whole);
		parts[i] = seg;
	}
	return parts.join('');
}

/** Escape plain text (e.g. a definition tooltip) and highlight the API names in it. */
async function enhanceWords(text: string, opts: InlineOptions & { params?: string[] }): Promise<string> {
	let out = '', last = 0;
	for (const m of text.matchAll(/\b[A-Za-z_][A-Za-z0-9_]*\b/g)) {
		const word = m[0];
		let html: string | undefined;
		if (word !== opts.self && apiMap.has(word) && /[A-Z_]|^ll/.test(word)) html = await inlineLsl(word, opts);
		// Parameter names are bold, but only identifier-looking ones (experience_id, linkNumber): plain
		// words like "channel" or "text" are too often ordinary English to mark automatically.
		else if (opts.params?.includes(word) && /_|[a-z][A-Z]/.test(word)) html = `<strong>${escape(word)}</strong>`;
		if (!html) continue;
		out += escape(text.slice(last, m.index)) + html;
		last = m.index! + word.length;
	}
	return out + escape(text.slice(last));
}

/**
 * Escape plain text (e.g. a definition description) and enrich it: API names highlighted (and linked
 * unless `link: false`), list shapes such as `[string name, key id]` highlighted as LSL, and the
 * entry's own parameter names in bold when given as `params`.
 */
export async function enhanceText(text: string, opts: InlineOptions & { params?: string[] } = {}): Promise<string> {
	const shape = /\[[^\[\]]*\b(?:integer|float|string|key|vector|rotation|list)\b[^\[\]]*\]/g;
	let out = '', last = 0;
	for (const m of text.matchAll(shape)) {
		out += await enhanceWords(text.slice(last, m.index), opts) + await inlineLsl(m[0], opts);
		last = m.index! + m[0].length;
	}
	return out + await enhanceWords(text.slice(last), opts);
}

/**
 * Expressive-code `collapse` ranges for a long example: keep the statements that mention `focus`
 * (with a little context) and fold the scaffolding around them, as the hand-written pages did.
 */
export function collapseMeta(code: string, focus?: string): string | undefined {
	const lines = code.split('\n');
	if (!focus || lines.length < 16) return undefined;
	const keep = new Set<number>();
	const re = new RegExp(`\\b${focus.replace(/[^A-Za-z0-9_]/g, '')}\\b`);
	lines.forEach((line, i) => {
		if (!re.test(line)) return;
		let end = i, depth = 0;
		for (let j = i; j < lines.length; j++) {
			for (const ch of lines[j].replace(/"(?:\\.|[^"\\])*"|\/\/.*$/g, '')) depth += '([{'.includes(ch) ? 1 : ')]}'.includes(ch) ? -1 : 0;
			end = j;
			const next = lines[j + 1]?.trim() ?? '';
			if (depth <= 0 && !(depth === 0 && next.startsWith('{'))) break;
		}
		for (let k = i - 2; k <= end + 2; k++) keep.add(k);
	});
	if (!keep.size) return undefined;
	const ranges: string[] = [];
	for (let i = 0; i < lines.length;) {
		if (keep.has(i)) { i++; continue; }
		let j = i;
		while (j + 1 < lines.length && !keep.has(j + 1)) j++;
		if (j - i + 1 >= 5) ranges.push(`${i + 1}-${j + 1}`);
		i = j + 1;
	}
	return ranges.length ? `collapse={${ranges.join(', ')}}` : undefined;
}
