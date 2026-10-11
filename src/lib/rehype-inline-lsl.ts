/**
 * Rehype plugin: highlights inline LSL in Markdown/MDX pages the way the API pages show it.
 *
 * - `code` outside `pre` (Markdown backticks, or an HTML <code> in MDX) is highlighted with the
 *   LSL grammar; API names inside it link to their pages (see src/lib/inline-lsl.ts).
 * - A link to an API page whose text is the API name, e.g. [llListen](/functions/llListen/),
 *   is rendered as highlighted code inside the link.
 * - A link to an API that has no page (deprecated or private, e.g. llSetPrimitiveParams) is
 *   unlinked: only the highlighted code remains, so no dead link and no hover card.
 * The page's own name (its frontmatter title) is never linked.
 */
import { fromHtml } from 'hast-util-from-html';
import { inlineLsl, hasApiPage, apiHrefName } from './inline-lsl';

type Node = { type: string; tagName?: string; name?: string; value?: string; properties?: Record<string, any>; attributes?: any[]; children?: Node[] };
const API_HREF = /^\/(?:functions|events|constants)\/[A-Za-z_][A-Za-z0-9_]*\/$/;
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

const isEl = (n: Node, tag: string) => (n.type === 'element' && n.tagName === tag) || ((n.type === 'mdxJsxTextElement' || n.type === 'mdxJsxFlowElement') && n.name === tag);
const textOf = (n: Node): string => n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(textOf).join('');
const hrefOf = (n: Node) => n.type === 'element' ? n.properties?.href : n.attributes?.find((a: any) => a.name === 'href')?.value;
const fragment = (html: string) => fromHtml(html, { fragment: true }).children as Node[];

export default function rehypeInlineLsl() {
	return async (tree: Node, file: any) => {
		const self: string | undefined = file?.data?.astro?.frontmatter?.title;
		const jobs: Promise<void>[] = [];
		/** Visits node's children, or only `only` of them; jobs always splice the real node.children. */
		const visit = (node: Node, inLink: boolean, only?: Node[]) => {
			// Iterate over a snapshot: unlinking below splices node.children.
			for (const child of [...(only ?? node.children ?? [])]) {
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
					if (API_HREF.test(href) && !hasApiPage(apiHrefName(href)!)) {
						// No page: replace the link by its content, highlighted when it is just the name.
						const kids = child.children ?? [];
						const plain = IDENT.test(label) && kids.every(k => k.type === 'text');
						const at = node.children!.indexOf(child);
						if (plain) jobs.push(inlineLsl(label, { link: false }).then(html => { node.children!.splice(node.children!.indexOf(child), 1, ...fragment(html)); }));
						else {
							node.children!.splice(at, 1, ...kids);
							// The unwrapped content, now in node, still gets highlighting and unlinking.
							visit(node, inLink, kids);
						}
						continue;
					}
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
	};
}
