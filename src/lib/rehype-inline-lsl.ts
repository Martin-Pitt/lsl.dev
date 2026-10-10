/**
 * Rehype plugin: highlights inline LSL in Markdown/MDX pages the way the API pages show it.
 *
 * - `code` outside `pre` (Markdown backticks, or an HTML <code> in MDX) is highlighted with the
 *   LSL grammar; API names inside it link to their pages (see src/lib/inline-lsl.ts).
 * - A link to an API page whose text is the API name, e.g. [llListen](/functions/llListen/),
 *   is rendered as highlighted code inside the link.
 * - Pages with `highlightNumbers: true` in their frontmatter (e.g. Limits) also get every number in
 *   their prose and tables coloured like an LSL number literal, so figures stand out.
 * The page's own name (its frontmatter title) is never linked.
 */
import { fromHtml } from 'hast-util-from-html';
import { inlineLsl } from './inline-lsl';

type Node = { type: string; tagName?: string; name?: string; value?: string; properties?: Record<string, any>; attributes?: any[]; children?: Node[] };
const API_HREF = /^\/(?:functions|events|constants)\/[A-Za-z_][A-Za-z0-9_]*\/$/;
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

const isEl = (n: Node, tag: string) => (n.type === 'element' && n.tagName === tag) || ((n.type === 'mdxJsxTextElement' || n.type === 'mdxJsxFlowElement') && n.name === tag);
const textOf = (n: Node): string => n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(textOf).join('');
const hrefOf = (n: Node) => n.type === 'element' ? n.properties?.href : n.attributes?.find((a: any) => a.name === 'href')?.value;
const fragment = (html: string) => fromHtml(html, { fragment: true }).children as Node[];
/** A number with optional sign, thousands separators, decimals and exponent (1,024 / -0.5 / 2e-5). */
const NUMBER = /(?<![\w.])-?\d+(?:,\d{3})*(?:\.\d+)?(?:e[-+]?\d+)?(?!\d)/gi;
const NO_NUMBERS = new Set(['code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'svg']);

/** Wrap numbers in text nodes with a span using the LSL theme's number colour. */
function highlightNumbers(node: Node, style: string) {
	const kids = node.children ?? [];
	for (let i = 0; i < kids.length; i++) {
		const child = kids[i];
		if (child.type === 'text') {
			const text = child.value ?? '';
			const parts: Node[] = [];
			let last = 0;
			for (const m of text.matchAll(NUMBER)) {
				if (m.index! > last) parts.push({ type: 'text', value: text.slice(last, m.index) });
				parts.push({ type: 'element', tagName: 'span', properties: { className: ['lsl-num'], style }, children: [{ type: 'text', value: m[0] }] });
				last = m.index! + m[0].length;
			}
			if (!parts.length) continue;
			if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
			kids.splice(i, 1, ...parts);
			i += parts.length - 1;
		} else if (child.type === 'element' && !NO_NUMBERS.has(child.tagName ?? '')) highlightNumbers(child, style);
	}
}

export default function rehypeInlineLsl() {
	return async (tree: Node, file: any) => {
		const self: string | undefined = file?.data?.astro?.frontmatter?.title;
		const jobs: Promise<void>[] = [];
		const visit = (node: Node, inLink: boolean) => {
			for (const child of node.children ?? []) {
				if (isEl(child, 'pre')) continue;
				if (isEl(child, 'code')) {
					const kids = child.children ?? [];
					if (kids.length && kids.every(k => k.type === 'text')) {
						const code = textOf(child);
						jobs.push(inlineLsl(code, { self, link: !inLink }).then(html => { Object.assign(child, fragment(html)[0]); }));
					}
					continue;
				}
				if (isEl(child, 'a')) {
					const href = String(hrefOf(child) ?? '');
					const label = textOf(child);
					if (API_HREF.test(href) && IDENT.test(label) && (child.children ?? []).every(k => k.type === 'text')) {
						if (child.type === 'element') child.properties = { ...child.properties, className: ['lsl-ref'] };
						jobs.push(inlineLsl(label, { link: false }).then(html => { child.children = fragment(html); }));
						continue;
					}
					visit(child, true);
					continue;
				}
				visit(child, inLink);
			}
		};
		visit(tree, false);
		await Promise.all(jobs);
		if (file?.data?.astro?.frontmatter?.highlightNumbers) {
			// Take the number colour from the same highlighter as inline LSL, for both themes.
			const sample = fragment(await inlineLsl('1', { link: false }))[0];
			const style = String((sample.children?.[0] as Node | undefined)?.properties?.style ?? '');
			if (style) highlightNumbers(tree, style);
		}
	};
}
