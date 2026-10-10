// @ts-check
/**
 * Reads the structured parts of a feature page (src/content/docs/features/<id>.mdx) from its
 * source text, without rendering it. Feature pages list names in component props
 * (`<ApiLinks names={[...]} />`, `<ConstantGroups names={[...]} />`, `<SeeAlso items={[...]}>`,
 * `<Planned>…</Planned>`, `<FeatureFooter related={[...]} categories={[...]} archive={[...]} />`).
 * The arrays must be JSON (double-quoted strings), which keeps them readable for humans and
 * lets this module, astro.config.mjs and the Python tests read them the same way.
 *
 * Pure string parsing, no file system access: callers supply the source.
 */
import { parse as parseYaml } from 'yaml';

/**
 * @typedef {{ id: string, title: string, description: string, categories: string[], related: string[], archive: string[],
 *   items: string[], groups: string[], links: string[], hrefs: string[], planned: string[] }} FeatureMdx
 * `items`: every API the page links (component names plus prose links to /functions|events|constants/<name>/).
 * `groups`: constant groups (<ConstantGroups> plus prose links to /constants/groups/<group>/).
 * `links`: <SeeAlso> items; `hrefs`: every Markdown link target in the prose.
 */

/** @param {string} body @param {string} tag @param {string} prop */
function arrayProps(body, tag, prop) {
	/** @type {string[]} */
	const out = [];
	const tagRe = new RegExp(`<${tag}\\b([\\s\\S]*?)>`, 'g');
	for (const m of body.matchAll(tagRe)) {
		const propRe = new RegExp(`\\b${prop}=\\{(\\[[\\s\\S]*?\\])\\}`);
		const p = m[1].match(propRe);
		if (p) out.push(...JSON.parse(p[1]));
	}
	return out;
}

/** @param {string} body */
function planned(body) {
	return [...body.matchAll(/<Planned>([\s\S]*?)<\/Planned>/g)].map(m => m[1].replace(/\\\*/g, '*').replace(/\s+/g, ' ').trim());
}

/** @param {string[]} list */
const uniq = list => [...new Set(list)];

/**
 * @param {string} id file name without `.mdx`
 * @param {string} source MDX source
 * @returns {FeatureMdx}
 */
export function parseFeatureMdx(id, source) {
	const text = source.replace(/\r\n/g, '\n');
	const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!fm) throw new Error(`features/${id}.mdx: missing frontmatter`);
	const data = parseYaml(fm[1]) ?? {};
	const body = text.slice(fm[0].length);
	const hrefs = [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map(m => m[1]);
	const apiLinks = hrefs.map(h => h.match(/^\/(?:functions|events|constants)\/([^/#?]+)\/?(?:#.*)?$/)).filter(m => m && m[1] !== 'groups').map(m => decodeURIComponent(/** @type {RegExpMatchArray} */ (m)[1]));
	const groupLinks = hrefs.map(h => h.match(/^\/constants\/groups\/([^/#?]+)/)).filter(Boolean).map(m => decodeURIComponent(/** @type {RegExpMatchArray} */ (m)[1]));
	const signatureRows = [...body.matchAll(/<Signature\s+name="([^"]+)"/g)].map(m => m[1]);
	return {
		id,
		title: String(data.title ?? id),
		description: String(data.description ?? ''),
		categories: arrayProps(body, 'FeatureFooter', 'categories'),
		related: arrayProps(body, 'FeatureFooter', 'related'),
		archive: arrayProps(body, 'FeatureFooter', 'archive'),
		items: uniq([...arrayProps(body, 'ApiLinks', 'names'), ...arrayProps(body, 'Signatures', 'names'), ...signatureRows, ...apiLinks]),
		groups: uniq([...arrayProps(body, 'ConstantGroups', 'names'), ...groupLinks]),
		links: arrayProps(body, 'SeeAlso', 'items'),
		hrefs,
		planned: planned(body),
	};
}

/**
 * A See-also item string: `feature:<id>`, `category:<id>`, `wiki:<archive title>`, or a site
 * path starting with `/`. An optional `|Label` overrides the link text.
 * @param {string} item
 * @returns {{ kind: 'feature' | 'category' | 'wiki' | 'href', target: string, label?: string }}
 */
export function parseSeeAlsoItem(item) {
	const bar = item.indexOf('|');
	const ref = bar < 0 ? item : item.slice(0, bar);
	const label = bar < 0 ? undefined : item.slice(bar + 1);
	if (ref.startsWith('/')) return { kind: 'href', target: ref, label };
	const m = ref.match(/^(feature|category|wiki):(.+)$/);
	if (!m) throw new Error(`SeeAlso: unknown item "${item}" (use feature:, category:, wiki: or a /path)`);
	return { kind: /** @type {'feature' | 'category' | 'wiki'} */ (m[1]), target: m[2], label };
}

/**
 * Sub-pages (src/content/docs/features/<feature>/<topic>.mdx) belong to their feature: their API,
 * group and link names count as the feature's own (chips, coverage, migration check).
 * @param {FeatureMdx} main
 * @param {FeatureMdx[]} subs parsed sub-pages; their `id` is the topic file name
 * @returns {FeatureMdx & { subpages: { id: string, title: string, description: string, href: string }[] }}
 */
export function withSubpages(main, subs) {
	const sorted = [...subs].sort((a, b) => a.id.localeCompare(b.id));
	return {
		...main,
		items: uniq([...main.items, ...sorted.flatMap(s => s.items)]),
		groups: uniq([...main.groups, ...sorted.flatMap(s => s.groups)]),
		links: [...main.links, ...sorted.flatMap(s => s.links)],
		hrefs: [...main.hrefs, ...sorted.flatMap(s => s.hrefs)],
		planned: [...main.planned, ...sorted.flatMap(s => s.planned)],
		subpages: sorted.map(s => ({ id: s.id, title: s.title, description: s.description, href: `/features/${main.id}/${s.id}/` })),
	};
}
