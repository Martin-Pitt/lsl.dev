/**
 * Readable Markdown for a docs page, served at /<page>/index.md and used by the page actions menu
 * ("Copy page", "View as Markdown", "Open in ChatGPT/Claude"). The MDX body is converted at the
 * source level: imports and JSX expressions are dropped, the data-driven API components
 * (<LSLFunction>, <ConstantGroup>, <Signatures>, ...) are expanded from catalog.json the same way
 * they render, and layout components (<Columns>, <Box>, ...) become plain headings or nothing.
 * Fenced code and inline code are copied verbatim. Unknown components keep their children.
 */
import { catalog, apiMap, apiHref, constantGroupHref, constantsInGroup, categoryMap, wikiByTitle } from './catalog';
import { categoryLink } from './categories';
import { featurePageMap, featureHref } from './features';
import { parseSeeAlsoItem } from './feature-mdx.mjs';

type Attrs = Record<string, any>;
type Source = { url?: string; wiki?: string; license?: string } | undefined;
export type MarkdownPage = { id: string; body?: string; data: { title: string; description?: string; source?: Source } };

const SITE = 'https://lsl.dev';
export const markdownHref = (id: string) => (id === 'index' ? '/index.md' : `/${id}/index.md`);
const pageHref = (id: string) => (id === 'index' ? '/' : `/${id}/`);

const code = (s: string) => (s.includes('`') ? `\`\` ${s} \`\`` : `\`${s}\``);
const lslType = (t: string) => ({ boolean: 'integer', asset: 'string', uuid: 'key' } as Record<string, string>)[t] ?? t;
const literal = (c: any) => (c.type === 'string' || c.type === 'key' ? JSON.stringify(String(c.value)) : String(c.value));
const params = (e: any) => `(${(e.parameters ?? []).map((p: any) => `${p.type} ${p.name}`).join(', ')})`;
const typeOf = (e: any) => (e.kind === 'event' ? 'event' : e.kind === 'constant' ? e.type : e.returnType);
/** One-line linked signature, as in a <Signatures> row. */
const sigLine = (e: any) => `\`${typeOf(e)}\` [\`${e.name}\`](${apiHref(e.kind, e.name)})${e.kind === 'constant' ? ` \`= ${literal(e)}\`` : ` \`${params(e)}\``}`;
const need = (v: any, what: string) => { if (!v) throw new Error(`page-markdown: unknown ${what}`); return v; };

function apiHeader(kind: 'function' | 'event' | 'constant', name: string, showDescription: boolean) {
	const list = { function: catalog.functions, event: catalog.events, constant: catalog.constants }[kind] as any[];
	const e = need(list.find(x => x.name === name), `${kind} "${name}"`);
	const d = e.definition ?? {};
	const out: string[] = [];
	const flags = [['experience', 'requires an experience'], ['linden-experience', 'Linden experience only'], ['god-mode', 'privileged function']].filter(([k]) => d[k]).map(([, l]) => l);
	out.push(`*LSL ${kind}${flags.length ? ` (${flags.join(', ')})` : ''}*`);
	if (e.replaces?.length) out.push(`Replaces deprecated ${e.replaces.map(code).join(', ')}.`);
	const sig = kind === 'constant' ? `${e.type} ${e.name} = ${literal(e)};` : kind === 'function' ? `${e.returnType} ${e.signature};` : `${e.signature}`;
	out.push('```lsl\n' + sig + '\n```');
	if (kind !== 'constant' && e.parameters?.length) out.push(e.parameters.map((p: any) => `- ${code(`${p.type} ${p.name}`)}${p.description ? `: ${p.description}` : ''}`).join('\n'));
	const sleep = d['mono-sleep'] ?? d.sleep;
	const facts = [
		kind === 'function' && e.returnType !== 'void' && `Returns: ${code(e.returnType)}`,
		kind === 'function' && sleep && `Delay: ${sleep} s`,
		kind === 'function' && d.energy != null && `Energy: ${d.energy}`,
		d['requires-permission'] && `Permission: ${code(String(d['requires-permission']))}`,
	].filter(Boolean);
	if (facts.length) out.push(facts.map(f => `- ${f}`).join('\n'));
	if (showDescription && e.description) out.push(e.description);
	const groups: string[] = d['member-of'] ?? [];
	if (groups.length) out.push(`Constant groups: ${groups.map(g => `[${g}](${constantGroupHref(g)})`).join(', ')}`);
	return out.join('\n\n');
}

function constantGroup(name: string) {
	const members = constantsInGroup(name) as any[];
	need(members.length, `constant group "${name}"`);
	const lines = members.map(c => {
		const vals = c.definition?.values as any[] | undefined;
		return vals?.length ? `${c.name}, ${vals.map(a => `${lslType(a['value-type'] ?? a.type ?? '')} ${a.name}`.trim()).join(', ')}` : `${c.name} = ${literal(c)}`;
	});
	return `Constant group [${name}](${constantGroupHref(name)}):\n\n\`\`\`lsl\n${lines.join('\n')}\n\`\`\``;
}

function seeAlso(items: string[]) {
	return items.map(item => {
		const { kind, target, label } = parseSeeAlsoItem(item);
		if (kind === 'feature') { const f = need(featurePageMap.get(target), item); return `[${label ?? f.title}](${featureHref(f.id)})`; }
		if (kind === 'category') { need(categoryMap.get(target), item); const l = categoryLink(target); return `[${label ?? l.label}](${l.href})`; }
		if (kind === 'wiki') { const w: any = need(wikiByTitle.get(target), item); return `[${label ?? w.title.replace(/^Category:/, '')} (Second Life Wiki)](${w.source.url})`; }
		return `[${label ?? target}](${target})`;
	}).join(', ');
}

function featureFooter(a: Attrs) {
	const out: string[] = [];
	if (a.related?.length) out.push('## Related features\n\n' + a.related.map((id: string) => { const f = need(featurePageMap.get(id), `feature "${id}"`); return `- [${f.title}](${featureHref(f.id)})`; }).join('\n'));
	if (a.categories?.length) out.push('## Categories\n\n' + a.categories.map((id: string) => { const l = categoryLink(id); return `- [${l.label}](${l.href})`; }).join('\n'));
	if (a.archive?.length) out.push('## On the Second Life Wiki\n\n' + a.archive.map((t: string) => { const w: any = need(wikiByTitle.get(t), `wiki page "${t}"`); return `- [${w.title.replace(/^Category:/, '')}](${w.source.url})`; }).join('\n'));
	return out.join('\n\n');
}

function attribution(a: Attrs) {
	const titles: string[] = [...(a.pages ?? []), ...(a.page ? [a.page] : [])];
	const links = titles.map(t => { const w: any = wikiByTitle.get(t) ?? wikiByTitle.get(t.replace(/_/g, ' ')); return w ? `[${w.source.title}](${w.source.url})` : t; });
	return `*${a.what ?? 'Adapted from the Second Life Wiki'} ${links.join(', ')}, by Second Life Wiki contributors, under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*`;
}

function wikiSource(source: Source) {
	if (!source?.url) return '';
	return `---\n\n*Source: [${source.wiki ?? 'Second Life Wiki'}](${source.url}) on the Second Life Wiki.${source.license ? ' ' + source.license : ''}*`;
}

/** Self-closing components (or the opening tag of paired ones that render their own content). */
function selfClosing(tag: string, a: Attrs, page: MarkdownPage): string | undefined {
	switch (tag) {
		case 'LSLFunction': return apiHeader('function', a.name, !!a.description);
		case 'LSLEvent': return apiHeader('event', a.name, !!a.description);
		case 'LSLConstant': return apiHeader('constant', a.name, !!a.description);
		case 'ConstantGroup': return constantGroup(a.name);
		case 'WikiSource': return wikiSource(page.data.source);
		case 'InlineSyntax': return code(String(a.code ?? ''));
		case 'ConstantGroups': return `Constant groups: ${(a.names ?? []).map((g: string) => `[${g}](${constantGroupHref(g)}) (${constantsInGroup(g).length})`).join(', ')}`;
		case 'FeatureFooter': return featureFooter(a);
		case 'Attribution': return attribution(a);
		case 'LinkCard': return `- [${a.title}](${a.href})${a.description ? `: ${a.description}` : ''}`;
		case 'LSLControl': { const e: any = need(catalog.controls.find((c: any) => c.name === a.name), `control "${a.name}"`); return ['do', 'else', 'for', 'if', 'jump', 'return', 'state', 'while'].includes(a.name) ? '```text\n' + e.description + '\n```' : e.description; }
		case 'LSLType': { const e: any = need(catalog.types.find((c: any) => c.name === a.name), `type "${a.name}"`); return e.description; }
	}
	return undefined;
}

/** Opening/closing text of paired components; children are converted in between. */
function paired(tag: string, a: Attrs): [string, string] {
	switch (tag) {
		case 'Box': return [`\n\n## ${a.href ? `[${a.title}](${a.href})` : a.title}\n\n`, '\n\n'];
		case 'Card': return [`\n\n### ${a.title}\n\n`, '\n\n'];
		case 'Signatures': return [(a.names ?? []).map((n: string) => `- ${sigLine(need(apiMap.get(n), `API "${n}"`))}${a.descriptions && (apiMap.get(n) as any).description ? `: ${(apiMap.get(n) as any).description}` : ''}`).join('\n') + '\n', '\n'];
		case 'Signature': return [`- ${sigLine(need(apiMap.get(a.name), `API "${a.name}"`))}: `, '\n'];
		case 'SeeAlso': return [`\n\nSee also: ${seeAlso(a.items ?? [])}`, '\n\n'];
		case 'Planned': return [' (planned: ', ')'];
		case 'LinkButton': return ['[', `](${a.href})`];
		case 'Aside': return [`\n\n**${a.title ?? (a.type ? a.type[0].toUpperCase() + a.type.slice(1) : 'Note')}:** `, '\n\n'];
	}
	return ['', ''];
}

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

/** Converts MDX prose (no fenced code) with a stack of open components. */
function convertText(s: string, page: MarkdownPage): string {
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
				if (closing) { const top = stack.pop(); out += top ?? ''; }
				else if (t.selfClose) { const r = selfClosing(name, t.attrs, page); out += r !== undefined ? `\n\n${r}\n\n` : paired(name, t.attrs).join(''); }
				else { const [open, close] = paired(name, t.attrs); out += open; stack.push(close); }
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

/** MDX body to Markdown: fenced code is kept verbatim, imports/exports are dropped, the rest is converted. */
export function mdxToMarkdown(body: string, page: MarkdownPage): string {
	const lines = body.replace(/\r\n/g, '\n').split('\n');
	const parts: string[] = [];
	let text: string[] = [];
	let fence: string | null = null;
	const flush = () => { if (text.length) parts.push(convertText(text.join('\n'), page)); text = []; };
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
