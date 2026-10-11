/**
 * rehype-api-hovercards: adds a supplementary hover card to links to API pages (Batch 1 of
 * docs/design/components-plan.md). Registered in astro.config after rehype-inline-lsl, so it also
 * sees the links that plugin makes inside inline code.
 *
 * One card per distinct API per file (an MDX page or an imported partial), appended at the end of
 * the file's content; every link to /functions|events|constants/<name>/ in that file points at it:
 *
 *   <a href="/functions/llSay/" interestfor="hcx1a-llSay">…</a> … <a href="/functions/llSay/" interestfor="hcx1a-llSay">…</a>
 *   … <span popover="hint" id="hcx1a-llSay" class="au-popover hc" aria-hidden="true"
 *       data-pagefind-ignore data-nosnippet>signature, one line, flags</span>
 *
 * The card anchors to whichever link opened it: an invoker is the popover's implicit anchor, so
 * position-area needs no anchor-name. The fallback script (PageEnd.astro) opens it with
 * showPopover({ source: link }) for the same effect.
 *
 * The link keeps its href (never popovertarget), so click and tap always navigate. The card is
 * phrasing content with nothing focusable in it. Skipped: self-links, links in headings, in <pre>,
 * inside <NoCard> or [data-nocard], inside another card, and pages with `hoverCards: false`.
 *
 * Card data: src/data/hovercards.json from scripts/build-hovercards.ts. It may be missing (astro
 * check, fresh clones), so it is loaded lazily and a missing file means "no cards". Each card body
 * is built once per API per build and shared by the files that use it.
 */
import { readFileSync } from 'node:fs';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { inlineLsl } from '../../../lib/inline-lsl';

type Node = { type: string; tagName?: string; name?: string; value?: string; properties?: Record<string, any>; attributes?: any[]; children?: Node[] };
type Card = { k: string; s: string; d: string; f?: string[] };

const API_HREF = /^\/(?:functions|events|constants)\/([A-Za-z_][A-Za-z0-9_]*)\/(?:#.*)?$/;
const HEADING = /^h[1-6]$/;
const SKIP_TAGS = new Set(['pre', 'script', 'style', 'svg']);

let data: Record<string, Card> | undefined;
function cards(): Record<string, Card> {
	if (!data) {
		// Next to this file when it runs as the Markdown plugin; from the repo root when it runs inside
		// the bundled server build (bindFragmentCards, fragment renders), where import.meta.url is the chunk's.
		for (const at of [new URL('../../../data/hovercards.json', import.meta.url), `${process.cwd()}/src/data/hovercards.json`]) {
			try { data = JSON.parse(readFileSync(at, 'utf8')); break; } catch {}
		}
		data ??= {};
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

/**
 * Components that render Markdown fragments themselves (the Limits dataset: <LimitsTable>, <Limit>).
 * Their HTML is made at render time, out of this plugin's sight, so the page pass hands them its
 * prefix and the APIs it already has cards for (props hcPrefix, hcHave); the fragment is rendered
 * with `{ fragment: true }`, which only marks its API links (data-hc), and bindFragmentCards()
 * points them at the page's cards, adding a card only for an API that has none yet on the page.
 */
const FRAGMENT_TAGS = new Set(['LimitsTable', 'Limit']);
const cardSpan = (id: string, children: Node[]): Node => ({
	type: 'element', tagName: 'span',
	properties: { popover: 'hint', id, className: ['au-popover', 'hc'], ariaHidden: 'true', dataPagefindIgnore: '', dataNosnippet: '' },
	children,
});

/**
 * For a fragment component: rewrites the data-hc marks of its rendered HTML to interestfor links
 * and returns the cards it must add (one per API not yet claimed on the page, tracked per render in
 * `locals`). Without a prefix (not in an MDX page, inside <NoCard>, `hoverCards: false`) the
 * marks are dropped and there are no cards.
 */
export async function bindFragmentCards(htmls: string[], props: { hcPrefix?: string; hcHave?: string }, locals: Record<string, any>) {
	const prefix = props.hcPrefix;
	const MARK = / data-hc="([A-Za-z_][A-Za-z0-9_]*)"/g;
	if (!prefix) return { htmls: htmls.map(h => h.replace(MARK, '')), cards: '' };
	const claimedAll: Map<string, Set<string>> = (locals.__hovercards ??= new Map());
	let claimed = claimedAll.get(prefix);
	if (!claimed) claimedAll.set(prefix, (claimed = new Set((props.hcHave ?? '').split(' ').filter(Boolean))));
	const fresh: string[] = [];
	const out = htmls.map(h => h.replace(MARK, (_, name) => {
		if (!claimed!.has(name)) { claimed!.add(name); fresh.push(name); } // claimed synchronously: no duplicates across concurrent renders
		return ` interestfor="${prefix}-${name}"`;
	}));
	const all = cards();
	const built = await Promise.all(fresh.map(n => body(n, all[n])));
	return { htmls: out, cards: toHtml(fresh.map((n, i) => cardSpan(`${prefix}-${n}`, structuredClone(built[i]))) as any) };
}

export default function rehypeApiHovercards(options: { fragment?: boolean } = {}) {
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

		const links = new Map<string, Node[]>(); // API name -> its links, in document order
		const skip = (n: Node) => n.type === 'element'
			? HEADING.test(n.tagName!) || SKIP_TAGS.has(n.tagName!) || n.properties?.dataNocard != null || classes(n).includes('hc')
			: n.name === 'NoCard';
		const fragments: Node[] = [];
		const visit = (node: Node) => {
			for (const child of node.children ?? []) {
				if (!(child.type === 'element' || child.type === 'mdxJsxTextElement' || child.type === 'mdxJsxFlowElement') || skip(child)) continue;
				if (child.type !== 'element' && FRAGMENT_TAGS.has(child.name!)) fragments.push(child);
				if (child.type === 'element' && child.tagName === 'a') {
					const name = String(child.properties?.href ?? '').match(API_HREF)?.[1];
					if (name && all[name] && !self.has(name)) links.set(name, [...(links.get(name) ?? []), child]);
					continue; // nothing card-worthy nests inside a link
				}
				visit(child);
			}
		};
		visit(tree);
		if (options.fragment) {
			// A fragment render: mark the links; the component binds them to the page's cards.
			for (const [name, ls] of links) for (const link of ls) link.properties = { ...link.properties, dataHc: name };
			return;
		}
		const have = [...links.keys()].join(' ');
		for (const f of fragments) f.attributes = [...(f.attributes ?? []), { type: 'mdxJsxAttribute', name: 'hcPrefix', value: prefix }, { type: 'mdxJsxAttribute', name: 'hcHave', value: have }];
		if (!links.size) return;

		// One card per API per file, appended to the end of the file's tree; every link to it shares it.
		const names = [...links.keys()];
		const built = await Promise.all(names.map(n => body(n, all[n])));
		names.forEach((name, i) => {
			const id = `${prefix}-${name}`;
			for (const link of links.get(name)!) link.properties = { ...link.properties, interestfor: id };
			tree.children!.push(cardSpan(id, structuredClone(built[i])));
		});
	};
}
