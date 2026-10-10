/**
 * Rehype plugin: highlights inline LSL in Markdown/MDX pages the way the API pages show it.
 *
 * - `code` outside `pre` (Markdown backticks, or an HTML <code> in MDX) is highlighted with the
 *   LSL grammar; API names inside it link to their pages (see src/lib/inline-lsl.ts).
 * - A link to an API page whose text is the API name, e.g. [llListen](/functions/llListen/),
 *   is rendered as highlighted code inside the link.
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
	};
}
