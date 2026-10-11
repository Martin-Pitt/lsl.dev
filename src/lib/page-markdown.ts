/**
 * Readable Markdown for a docs page, served at /<page>/index.md and used by the page actions menu
 * ("Copy page", "View as Markdown", "Open in ChatGPT/Claude"). The MDX body is converted at the
 * source level: imports and JSX expressions are dropped, the data-driven API components
 * (<LSLFunction>, <ConstantGroup>, <Signatures>, ...) are expanded from catalog.json the same way
 * they render, and layout components (<Columns>, <Box>, ...) become plain headings or nothing.
 * Fenced code and inline code are copied verbatim. Unknown components keep their children, except
 * authoring components (imported from src/components/authoring): one without a case fails the build.
 */
import { catalog } from './catalog';
import { selfClosingCases, pairedCases, transformCases, handledBy } from './page-markdown/index';
import { SITE, pageHref } from './page-markdown/util';
import type { Attrs, Context, MarkdownPage } from './page-markdown/types';
import { MARKDOWN_HEADER } from './llms';

export type { MarkdownPage } from './page-markdown/types';
export const markdownHref = (id: string) => (id === 'index' ? '/index.md' : `/${id}/index.md`);

/** Component cases live in src/lib/page-markdown/<file>.ts, one file per batch (see ./page-markdown/index.ts). */
const selfClosing = (tag: string, a: Attrs, page: MarkdownPage, ctx: Context) => selfClosingCases.get(tag)?.(a, page, ctx);
const paired = (tag: string, a: Attrs, page: MarkdownPage, ctx: Context): [string, string] => pairedCases.get(tag)?.(a, page, ctx) ?? ['', ''];

/** Parses JSX attributes starting at s[i] (just after the tag name); returns attrs and the index after `>`. */
function parseTag(s: string, i: number): { attrs: Attrs; end: number; selfClose: boolean } | null {
	const attrs: Attrs = {};
	while (i < s.length) {
		while (/\s/.test(s[i])) i++;
		if (s.startsWith('/>', i)) return { attrs, end: i + 2, selfClose: true };
		if (s[i] === '>') return { attrs, end: i + 1, selfClose: false };
		const m = /^[A-Za-z_:][\w:.-]*/.exec(s.slice(i, i + 64));
		if (!m) return null;
		const name = m[0]; i += name.length;
		if (s[i] !== '=') { attrs[name] = true; continue; }
		i++;
		if (s[i] === '"' || s[i] === "'") { const q = s[i]; const j = s.indexOf(q, i + 1); if (j < 0) return null; attrs[name] = s.slice(i + 1, j); i = j + 1; continue; }
		if (s[i] !== '{') return null;
		let depth = 0, j = i, quote = '';
		for (; j < s.length; j++) {
			const c = s[j];
			if (quote) { if (c === '\\') j++; else if (c === quote) quote = ''; continue; }
			if (c === '"' || c === "'" || c === '`') quote = c;
			else if (c === '{') depth++;
			else if (c === '}' && --depth === 0) break;
		}
		const expr = s.slice(i + 1, j).trim();
		try { attrs[name] = JSON.parse(expr.replace(/,(\s*[\]}])/g, '$1')); } catch { attrs[name] = expr; }
		i = j + 1;
	}
	return null;
}

/** A JSX expression in the page flow: comments vanish, the one known list is expanded, anything else points to the HTML page. */
function flowExpression(expr: string, page: MarkdownPage): string {
	const e = expr.trim();
	if (!e || /^\/\*[\s\S]*\*\/$/.test(e)) return '';
	if (e.startsWith('catalog.controls.map')) return (catalog.controls as any[]).map(c => `- [${c.name}](/fundamentals/flow-control/${c.name}/): ${c.description.split('\n')[0]}`).join('\n');
	return `*(Generated list; see ${SITE}${pageHref(page.id)})*`;
}

/** Names imported from the authoring barrel (src/components/authoring) in an MDX body. */
function authoringImports(body: string): Set<string> {
	const names = new Set<string>();
	for (const m of body.matchAll(/^import\s*\{([^}]*)\}\s*from\s*['"][^'"]*components\/authoring[^'"]*['"]/gm)) {
		for (const n of m[1].split(',')) { const local = n.trim().split(/\s+as\s+/).pop(); if (local) names.add(local); }
	}
	return names;
}

/** An open component: its case output so far starts at `start` in the output. */
type Frame = { name: string; attrs: Attrs; close: string; start: number; ctx: Context };

/** Placeholder for a fenced code block, so that components can span code (see mdxToMarkdown). */
const FENCE = (n: number) => `\u0000${n}\u0000`;

/** Converts MDX prose with a stack of open components. Fenced code arrives as FENCE placeholders
 * and is restored in place, so a `transform` case sees its full children. */
function convertText(s: string, page: MarkdownPage, authoring: Set<string>, fences: string[]): string {
	let out = '';
	const stack: Frame[] = [];
	const ctx = (): Context => ({ parents: stack.map(f => f.name) });
	for (let i = 0; i < s.length;) {
		const c = s[i];
		if (c === '\u0000') { const j = s.indexOf('\u0000', i + 1); out += fences[Number(s.slice(i + 1, j))]; i = j + 1; continue; }
		if (c === '`') { const run = /^`+/.exec(s.slice(i))![0]; const j = s.indexOf(run, i + run.length); const end = j < 0 ? i + run.length : j + run.length; out += s.slice(i, end); i = end; continue; }
		if (c === '<' && /^<\/?[A-Z]/.test(s.slice(i, i + 3))) {
			const closing = s[i + 1] === '/';
			const name = /^[A-Za-z][\w.]*/.exec(s.slice(i + (closing ? 2 : 1)))![0];
			const t = parseTag(s, i + (closing ? 2 : 1) + name.length);
			if (t) {
				// Guard: an authoring component without a case would silently degrade the export.
				if (!closing && authoring.has(name) && !handledBy.has(name)) throw new Error(`page-markdown: <${name}> (on ${page.id}) has no case in src/lib/page-markdown/<batch>.ts`);
				if (closing) {
					const f = stack.pop();
					if (f) {
						const transform = transformCases.get(f.name);
						if (transform) out = out.slice(0, f.start) + transform(out.slice(f.start), f.attrs, page, f.ctx);
						else out += f.close;
					}
				} else if (t.selfClose) {
					const here = ctx();
					const r = selfClosing(name, t.attrs, page, here);
					if (r !== undefined) out += `\n\n${r}\n\n`;
					else if (transformCases.has(name)) out += transformCases.get(name)!('', t.attrs, page, here);
					else out += paired(name, t.attrs, page, here).join('');
				} else {
					const here = ctx();
					const [open, close] = transformCases.has(name) ? ['', ''] : paired(name, t.attrs, page, here);
					out += open;
					stack.push({ name, attrs: t.attrs, close, start: out.length, ctx: here });
				}
				i = t.end;
				continue;
			}
		}
		// JSX flow expressions ({items.map(...)}) and MDX comments ({/* */}) at the start of a line.
		if (c === '{' && (i === 0 || s[i - 1] === '\n')) {
			let depth = 0, j = i;
			for (; j < s.length; j++) { if (s[j] === '{') depth++; else if (s[j] === '}' && --depth === 0) break; }
			out += flowExpression(s.slice(i + 1, j), page);
			i = j + 1;
			continue;
		}
		out += c; i++;
	}
	return out;
}

/** The showcase partials (src/components/authoring/<batch>/Showcase.mdx), raw. */
const showcaseSources = import.meta.glob('../components/authoring/*/Showcase.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Replaces `<X />` with the source of a Showcase.mdx imported as X, so the showcase page's export
 * (and the authoring guard) covers each batch's section. */
function inlineShowcases(body: string): string {
	for (const m of body.matchAll(/^import\s+(\w+)\s+from\s+['"][^'"]*components\/authoring\/(\w+)\/Showcase\.mdx['"]/gm)) {
		const src = showcaseSources[`../components/authoring/${m[2]}/Showcase.mdx`];
		if (src !== undefined) body = body.replace(new RegExp(`^<${m[1]}\\s*/>`, 'm'), () => src);
	}
	return body;
}

/** MDX body to Markdown: fenced code is kept verbatim, imports/exports are dropped, the rest is converted. */
export function mdxToMarkdown(body: string, page: MarkdownPage): string {
	body = inlineShowcases(body);
	const authoring = authoringImports(body);
	const lines = body.replace(/\r\n/g, '\n').split('\n');
	const text: string[] = [];
	const fences: string[] = [];
	let fence: { marker: string; lines: string[] } | null = null;
	const endFence = () => { text.push(FENCE(fences.length)); fences.push(fence!.lines.join('\n')); fence = null; };
	for (const line of lines) {
		const f = /^\s*(`{3,}|~{3,})/.exec(line);
		if (fence) {
			fence.lines.push(line);
			if (f && f[1][0] === fence.marker[0] && f[1].length >= fence.marker.length && line.trim() === f[1]) endFence();
			continue;
		}
		if (f) { fence = { marker: f[1], lines: [line] }; continue; }
		if (/^(import|export)\s/.test(line)) continue;
		text.push(line);
	}
	if (fence) endFence();
	// Tidy trailing spaces and blank lines outside code; top-level fences stay verbatim.
	const out = convertText(text.join('\n'), page, authoring, fences);
	return out.split(/(^[ \t]*(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*(?:`{3,}|~{3,})[ \t]*$)/m)
		.map((part, k) => (k % 2 ? part : part.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'))).join('').trim();
}

/** `header: false` leaves out the lsl.dev pointer line (used by /llms-full.txt, which concatenates pages). */
export function pageMarkdown(page: MarkdownPage, { header = true } = {}): string {
	const head = [`# ${page.data.title}`];
	if (header) head.push(MARKDOWN_HEADER);
	if (page.data.description) head.push(`> ${page.data.description}`);
	const body = mdxToMarkdown(page.body ?? '', page);
	return `${head.join('\n\n')}\n\n${body}\n\n---\n\nFrom lsl.dev: ${SITE}${pageHref(page.id)}\n`;
}
