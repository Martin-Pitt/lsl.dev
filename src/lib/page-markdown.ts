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
import { selfClosingCases, pairedCases, handledBy } from './page-markdown/index';
import { SITE, pageHref } from './page-markdown/util';
import type { Attrs, MarkdownPage } from './page-markdown/types';

export type { MarkdownPage } from './page-markdown/types';
export const markdownHref = (id: string) => (id === 'index' ? '/index.md' : `/${id}/index.md`);

/** Component cases live in src/lib/page-markdown/<file>.ts, one file per batch (see ./page-markdown/index.ts). */
const selfClosing = (tag: string, a: Attrs, page: MarkdownPage) => selfClosingCases.get(tag)?.(a, page);
const paired = (tag: string, a: Attrs, page: MarkdownPage): [string, string] => pairedCases.get(tag)?.(a, page) ?? ['', ''];

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
	if (e.startsWith('catalog.controls.map')) return (catalog.controls as any[]).map(c => `- [${c.name}](/controls/${c.name}/): ${c.description.split('\n')[0]}`).join('\n');
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

/** Converts MDX prose (no fenced code) with a stack of open components. */
function convertText(s: string, page: MarkdownPage, authoring: Set<string>): string {
	let out = '';
	const stack: string[] = [];
	for (let i = 0; i < s.length;) {
		const c = s[i];
		if (c === '`') { const run = /^`+/.exec(s.slice(i))![0]; const j = s.indexOf(run, i + run.length); const end = j < 0 ? i + run.length : j + run.length; out += s.slice(i, end); i = end; continue; }
		if (c === '<' && /^<\/?[A-Z]/.test(s.slice(i, i + 3))) {
			const closing = s[i + 1] === '/';
			const name = /^[A-Za-z][\w.]*/.exec(s.slice(i + (closing ? 2 : 1)))![0];
			const t = parseTag(s, i + (closing ? 2 : 1) + name.length);
			if (t) {
				// Guard: an authoring component without a case would silently degrade the export.
				if (!closing && authoring.has(name) && !handledBy.has(name)) throw new Error(`page-markdown: <${name}> (on ${page.id}) has no case in src/lib/page-markdown/<batch>.ts`);
				if (closing) { const top = stack.pop(); out += top ?? ''; }
				else if (t.selfClose) { const r = selfClosing(name, t.attrs, page); out += r !== undefined ? `\n\n${r}\n\n` : paired(name, t.attrs, page).join(''); }
				else { const [open, close] = paired(name, t.attrs, page); out += open; stack.push(close); }
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
	const parts: string[] = [];
	let text: string[] = [];
	let fence: string | null = null;
	const flush = () => { if (text.length) parts.push(convertText(text.join('\n'), page, authoring)); text = []; };
	for (const line of lines) {
		const f = /^\s*(`{3,}|~{3,})/.exec(line);
		if (fence) { parts.push(line); if (f && f[1][0] === fence[0] && f[1].length >= fence.length && line.trim() === f[1]) fence = null; continue; }
		if (f) { flush(); fence = f[1]; parts.push(line); continue; }
		if (/^(import|export)\s/.test(line)) continue;
		text.push(line);
	}
	flush();
	// Code fences were pushed line by line; join everything back and tidy blank lines.
	return parts.join('\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

export function pageMarkdown(page: MarkdownPage): string {
	const head = [`# ${page.data.title}`];
	if (page.data.description) head.push(`> ${page.data.description}`);
	const body = mdxToMarkdown(page.body ?? '', page);
	return `${head.join('\n\n')}\n\n${body}\n\n---\n\nFrom lsl.dev: ${SITE}${pageHref(page.id)}\n`;
}
