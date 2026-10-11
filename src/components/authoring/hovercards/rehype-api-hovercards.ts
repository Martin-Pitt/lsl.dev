/**
 * rehype-api-hovercards: adds a supplementary hover card to links to API pages (Batch 1 of
 * docs/design/components-plan.md). Registered in astro.config after rehype-inline-lsl, so it also
 * sees the links that plugin makes inside inline code.
 *
 * For each link to /functions|events|constants/<name>/ it inserts one card right after the link
 * (after the enclosing inline <code> when the link sits inside one):
 *
 *   <a href="/functions/llSay/" interestfor="hcx1a-3" style="anchor-name:--hcx1a-3">…</a><span
 *     popover="hint" id="hcx1a-3" class="au-popover hc" aria-hidden="true"
 *     data-pagefind-ignore style="position-anchor:--hcx1a-3">signature, one line, flags</span>
 *
 * The link keeps its href (never popovertarget), so click and tap always navigate. The card is
 * phrasing content with nothing focusable in it. Skipped: self-links, links in headings, in <pre>,
 * inside <NoCard> or [data-nocard], inside another card, and pages with `hoverCards: false`.
 *
 * Card data: src/data/hovercards.json from scripts/build-hovercards.ts. It may be missing (astro
 * check, fresh clones), so it is loaded lazily and a missing file means "no cards". Each card body
 * is built once per API per build and cloned for every link.
 */
import { readFileSync } from 'node:fs';
import { fromHtml } from 'hast-util-from-html';
import { inlineLsl } from '../../../lib/inline-lsl';

type Node = { type: string; tagName?: string; name?: string; value?: string; properties?: Record<string, any>; children?: Node[] };
type Card = { k: string; s: string; d: string; f?: string[] };

const API_HREF = /^\/(?:functions|events|constants)\/([A-Za-z_][A-Za-z0-9_]*)\/(?:#.*)?$/;
const HEADING = /^h[1-6]$/;
const SKIP_TAGS = new Set(['pre', 'script', 'style', 'svg']);

let data: Record<string, Card> | undefined;
function cards(): Record<string, Card> {
	if (!data) {
		try { data = JSON.parse(readFileSync(new URL('../../../data/hovercards.json', import.meta.url), 'utf8')); }
		catch { data = {}; }
	}
	return data!;
}

/** The only Shiki colour pairs that occur in signatures, mapped to classes coloured in hovercards.css. */
const TOKENS: Record<string, string> = {
	'--shiki-dark:#f97583;--shiki-light:#d73a49': 'k', // type keywords
	'--shiki-dark:#79b8ff;--shiki-light:#005cc5': 'f', // function, event and constant names
	'--shiki-dark:#b392f0;--shiki-light:#6f42c1': 'p',
};

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inner nodes of a card, built once per API name. */
const bodies = new Map<string, Promise<Node[]>>();
function body(name: string, c: Card): Promise<Node[]> {
	let b = bodies.get(name);
	if (!b) {
		b = inlineLsl(c.s, { link: false }).then(html => {
			// Short token classes instead of inline Shiki styles keep each card small (see TOKENS).
			const sig = html.replace(/^<code[^>]*>/, '<code>').replace(/<span style="([^"]+)">([^<]*)<\/span>/g, (m, style, text) =>
				TOKENS[style.toLowerCase()] ? `<i class="${TOKENS[style.toLowerCase()]}">${text}</i>` : m);
			const flags = c.f?.length
				? `<span class="hc-flags">${c.f.map(f => `<span class="hc-flag"${f.startsWith('Deprecated') ? ' data-tone="caution"' : ''}>${escape(f)}</span>`).join('')}</span>`
				: '';
			const card = `<span class="hc-sig">${sig}</span>${c.d ? `<span class="hc-desc">${escape(c.d)}</span>` : ''}${flags}`;
			return fromHtml(card, { fragment: true }).children as Node[];
		});
		bodies.set(name, b);
	}
	return b;
}

const classes = (n: Node): string[] => {
	const c = n.properties?.className;
	return Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(/\s+/) : [];
};

export default function rehypeApiHovercards() {
	return async (tree: Node, file: any) => {
		const fm = file?.data?.astro?.frontmatter ?? {};
		if (fm.hoverCards === false) return;
		const all = cards();
		// Ids must be unique on the page, and one page can render several MDX files (imported
		// partials), so each file gets a short prefix derived from its path.
		const path = String(file?.path ?? file?.history?.[0] ?? '');
		let hash = 0;
		for (const ch of path.slice(process.cwd().length)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
		const prefix = `hc${hash.toString(36).slice(-3)}`;
		const self = new Set<string>([fm.title, path.match(/([^\\/]+)\.mdx?$/)?.[1]].filter(Boolean));

		type Job = { link: Node; parent: Node; after: Node; name: string };
		const jobs: Job[] = [];
		const skip = (n: Node) => n.type === 'element'
			? HEADING.test(n.tagName!) || SKIP_TAGS.has(n.tagName!) || n.properties?.dataNocard != null || classes(n).includes('hc')
			: n.name === 'NoCard';
		// `host` is set inside inline <code>: the card then goes after that <code>, not inside it.
		const visit = (node: Node, host?: { parent: Node; code: Node }) => {
			for (const child of node.children ?? []) {
				if (!(child.type === 'element' || child.type === 'mdxJsxTextElement' || child.type === 'mdxJsxFlowElement') || skip(child)) continue;
				if (child.type === 'element' && child.tagName === 'a') {
					const name = String(child.properties?.href ?? '').match(API_HREF)?.[1];
					if (name && all[name] && !self.has(name)) jobs.push({ link: child, parent: host?.parent ?? node, after: host?.code ?? child, name });
					continue; // nothing card-worthy nests inside a link
				}
				visit(child, host ?? (child.type === 'element' && child.tagName === 'code' ? { parent: node, code: child } : undefined));
			}
		};
		visit(tree);
		if (!jobs.length) return;

		const built = await Promise.all(jobs.map(j => body(j.name, all[j.name])));
		// Insert from the last job backwards so earlier indexes stay valid; ids follow document order.
		for (let i = jobs.length - 1; i >= 0; i--) {
			const { link, parent, after } = jobs[i];
			const id = `${prefix}-${i + 1}`;
			link.properties = { ...link.properties, interestfor: id, style: [link.properties?.style, `anchor-name:--${id}`].filter(Boolean).join(';') };
			const card: Node = {
				type: 'element', tagName: 'span',
				properties: { popover: 'hint', id, className: ['au-popover', 'hc'], ariaHidden: 'true', dataPagefindIgnore: '', style: `position-anchor:--${id}` },
				children: structuredClone(built[i]),
			};
			const kids = parent.children!;
			kids.splice(kids.indexOf(after) + 1, 0, card);
		}
	};
}
