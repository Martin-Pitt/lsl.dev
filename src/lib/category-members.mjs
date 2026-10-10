// @ts-check
/**
 * Public members of definition categories, and the rule for single-member categories: a category
 * with exactly one public function, event or constant gets no page of its own. Links to it go
 * straight to the member's page.
 *
 * Pure: takes the parsed catalog (src/data/catalog.json), so astro.config.mjs (sidebar)
 * and site code (src/lib/categories.ts) share it.
 */

/** @param {any} catalog */
function publicKinds(catalog) {
	/** @type {Map<string, string>} */
	const kinds = new Map();
	for (const group of ['functions', 'events', 'constants']) for (const e of catalog[group]) kinds.set(e.name, e.kind);
	return kinds;
}

/** @param {string} kind @param {string} name */
export function apiPath(kind, name) {
	return `/${kind.endsWith('s') ? kind : kind + 's'}/${encodeURIComponent(name)}/`;
}

/**
 * @param {any} catalog
 * @returns {Map<string, { name: string, kind: string }[]>} category id -> public members
 */
export function categoryMembers(catalog) {
	const kinds = publicKinds(catalog);
	return new Map(catalog.categories.map((/** @type {any} */ c) => [
		c.id,
		[...c.functions, ...c.events, ...c.constants].filter(n => kinds.has(n)).map(n => ({ name: n, kind: /** @type {string} */ (kinds.get(n)) })),
	]));
}

/**
 * Categories that stand in for a single item: id -> { label, name, href }.
 * @param {any} catalog
 */
export function singleMemberCategories(catalog) {
	/** @type {Map<string, { label: string, name: string, href: string }>} */
	const out = new Map();
	const members = categoryMembers(catalog);
	for (const c of catalog.categories) {
		const m = members.get(c.id) ?? [];
		if (m.length === 1) out.set(c.id, { label: c.label, name: m[0].name, href: apiPath(m[0].kind, m[0].name) });
	}
	return out;
}
