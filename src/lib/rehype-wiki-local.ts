/**
 * Rehype plugin: links to SL wiki articles that lsl.dev covers point at the local page instead
 * (the map is built from `wikiArticles` frontmatter, see src/lib/wiki-local.ts).
 */
import { relative } from 'node:path';
import { localForWiki } from './wiki-local';

type Node = { type: string; tagName?: string; name?: string; properties?: Record<string, any>; attributes?: any[]; children?: Node[] };

export default function rehypeWikiLocal() {
	return (tree: Node, file: any) => {
		const path = file?.path ? relative(`${process.cwd()}/src/content/docs`, file.path).replace(/\\/g, '/') : '';
		const self = path.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
		const visit = (node: Node) => {
			for (const child of node.children ?? []) {
				if (child.type === 'element' && child.tagName === 'a' && typeof child.properties?.href === 'string') {
					const local = localForWiki(child.properties.href, self);
					if (local) child.properties.href = local;
				} else if ((child.type === 'mdxJsxTextElement' || child.type === 'mdxJsxFlowElement') && child.name === 'a') {
					const attr = child.attributes?.find((a: any) => a.name === 'href' && typeof a.value === 'string');
					const local = attr && localForWiki(attr.value, self);
					if (local) attr.value = local;
				}
				visit(child);
			}
		};
		visit(tree);
	};
}
