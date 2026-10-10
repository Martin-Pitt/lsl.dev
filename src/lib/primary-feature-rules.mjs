// @ts-check
/**
 * Primary feature of an API: the one feature page that the breadcrumb (Functions › Combat ›
 * llDamage) and the sidebar point at. Pure functions, no file system access, so the site
 * (src/lib/primary-feature.ts), the report script (scripts/primary-features.mjs) and the Python
 * tests all run the same code.
 *
 * Choice, highest first:
 *   1. an entry in src/data/primary-feature-overrides.json (API name -> feature id);
 *   2. how prominently the feature presents the API (see TIER below);
 *   3. the feature's own categories (<FeatureFooter categories>) include one of the API's;
 *   4. the smallest feature (fewest listed APIs), i.e. the most specific one;
 *   5. feature id, alphabetical.
 * A feature that only "owns" one of the API's categories, without mentioning the API, is a
 * candidate at the lowest tier. With no candidate at all there is no primary feature and the
 * breadcrumb falls back to the category (or the constant group).
 */

/** Prominence of one mention, by where it appears. */
export const TIER = {
	/**
	 * <Signatures>/<Signature>/<ApiLinks> in a main section, or any link in the main page's Scripting
	 * Details box. (Pages repeat their Functions-and-events list in Scripting Details, so the two rank equal.)
	 */
	main: 5,
	/** The same on a sub-page (features/<id>/<topic>.mdx). */
	subpage: 4,
	/** <ConstantGroups> in a main section listing one of the constant's groups. */
	group: 3,
	/** A prose link in a main section. */
	prose: 2,
	/** Anything in Additional / Related / See also / Known issues / Wishlist, or a prose link to the group. */
	minor: 1,
	/** The feature owns one of the API's categories but does not mention the API. */
	category: 0,
};

const MINOR = /^(additional|related|see also|known issues|wishlist)$/i;

/** @param {string} body @returns {(pos: number) => { title: string, box: boolean }} */
function sectionAt(body) {
	/** @type {{ pos: number, kind: 'h' | 'open' | 'close', title: string }[]} */
	const marks = [];
	for (const m of body.matchAll(/^##\s+(.+)$/gm)) marks.push({ pos: m.index ?? 0, kind: 'h', title: m[1].trim() });
	for (const m of body.matchAll(/<Box\b[^>]*?title="([^"]*)"/g)) marks.push({ pos: m.index ?? 0, kind: 'open', title: m[1] });
	for (const m of body.matchAll(/<\/Box>/g)) marks.push({ pos: m.index ?? 0, kind: 'close', title: '' });
	marks.sort((a, b) => a.pos - b.pos);
	return pos => {
		let heading = '', box = '';
		for (const m of marks) {
			if (m.pos > pos) break;
			if (m.kind === 'h') { heading = m.title; box = ''; } else if (m.kind === 'open') box = m.title; else box = '';
		}
		return box ? { title: box, box: true } : { title: heading, box: false };
	};
}

/** @param {string} body @param {string} tag @param {string} prop @returns {{ pos: number, names: string[] }[]} */
function arrayPropsAt(body, tag, prop) {
	const out = [];
	for (const m of body.matchAll(new RegExp(`<${tag}\\b([\\s\\S]*?)>`, 'g'))) {
		const p = m[1].match(new RegExp(`\\b${prop}=\\{(\\[[\\s\\S]*?\\])\\}`));
		if (p) out.push({ pos: m.index ?? 0, names: JSON.parse(p[1]) });
	}
	return out;
}

/**
 * Best tier of every API name and constant group mentioned on one feature page.
 * @param {string} source MDX source
 * @param {boolean} subpage whether this is a sub-page of the feature
 * @returns {{ names: Map<string, number>, groups: Map<string, number> }}
 */
export function pageProminence(source, subpage = false) {
	const text = source.replace(/\r\n/g, '\n');
	const fm = text.match(/^---\n[\s\S]*?\n---\n/);
	const body = fm ? text.slice(fm[0].length) : text;
	const at = sectionAt(body);
	const names = new Map(), groups = new Map();
	/** @param {Map<string, number>} map @param {string} key @param {number} tier */
	const bump = (map, key, tier) => { if ((map.get(key) ?? -1) < tier) map.set(key, tier); };
	/** @param {number} pos */
	const inDetails = pos => !subpage && at(pos).box && /^scripting details$/i.test(at(pos).title);
	const listed = subpage ? TIER.subpage : TIER.main;
	/** @param {number} pos @param {number} tier */
	const where = (pos, tier) => (MINOR.test(at(pos).title) ? TIER.minor : tier);
	for (const tag of ['Signatures', 'ApiLinks']) for (const { pos, names: ns } of arrayPropsAt(body, tag, 'names')) for (const n of ns) bump(names, n, where(pos, listed));
	for (const m of body.matchAll(/<Signature\s+name="([^"]+)"/g)) bump(names, m[1], where(m.index ?? 0, listed));
	for (const { pos, names: gs } of arrayPropsAt(body, 'ConstantGroups', 'names')) for (const g of gs) bump(groups, g, where(pos, TIER.group));
	for (const m of body.matchAll(/\]\(\/(functions|events|constants)\/([^/#?)\s]+)\/?(?:#[^)\s]*)?\)/g)) {
		const pos = m.index ?? 0;
		if (m[2] === 'groups') continue;
		bump(names, decodeURIComponent(m[2]), where(pos, inDetails(pos) ? TIER.main : TIER.prose));
	}
	for (const m of body.matchAll(/\]\(\/constants\/groups\/([^/#?)\s]+)/g)) bump(groups, decodeURIComponent(m[1]), TIER.minor);
	return { names, groups };
}

/**
 * @typedef {{ id: string, title: string, categories: string[], size: number,
 *   names: Map<string, number>, groups: Map<string, number> }} FeatureScore
 */

/**
 * @param {{ id: string, title: string, categories: string[], items: string[] }} feature parsed feature (sub-pages merged)
 * @param {string} source main page MDX
 * @param {string[]} subSources sub-page MDX sources
 * @returns {FeatureScore}
 */
export function featureScore(feature, source, subSources = []) {
	const pages = [pageProminence(source, false), ...subSources.map(s => pageProminence(s, true))];
	const names = new Map(), groups = new Map();
	for (const p of pages) {
		for (const [k, v] of p.names) if ((names.get(k) ?? -1) < v) names.set(k, v);
		for (const [k, v] of p.groups) if ((groups.get(k) ?? -1) < v) groups.set(k, v);
	}
	return { id: feature.id, title: feature.title, categories: feature.categories, size: feature.items.length, names, groups };
}

/**
 * @typedef {{ feature: string | null, tier: number | null, reason: string, tied: string[] }} Choice
 * `tied`: other features that matched the winner on tier and category and lost on size or name;
 * these are the ambiguous choices worth reviewing.
 */

/**
 * @param {{ name: string, categories?: string[] | null, groups?: string[] | null }} entry
 * @param {FeatureScore[]} scores
 * @param {Record<string, string>} overrides
 * @returns {Choice}
 */
export function choosePrimary(entry, scores, overrides = {}) {
	const forced = overrides[entry.name];
	if (forced && scores.some(s => s.id === forced)) return { feature: forced, tier: null, reason: 'override', tied: [] };
	const cats = entry.categories ?? [];
	const grps = entry.groups ?? [];
	const cands = [];
	for (const s of scores) {
		let tier = s.names.get(entry.name) ?? -1;
		for (const g of grps) tier = Math.max(tier, s.groups.get(g) ?? -1);
		const home = s.categories.some(c => cats.includes(c));
		if (tier < 0 && home) tier = TIER.category;
		if (tier >= 0) cands.push({ s, tier, home });
	}
	if (!cands.length) return { feature: null, tier: null, reason: 'none', tied: [] };
	cands.sort((a, b) => b.tier - a.tier || Number(b.home) - Number(a.home) || a.s.size - b.s.size || a.s.id.localeCompare(b.s.id));
	const [win, ...rest] = cands;
	const peers = rest.filter(c => c.tier === win.tier && c.home === win.home);
	const bySize = peers.length && peers.every(c => c.s.size !== win.s.size);
	const tierName = Object.entries(TIER).find(([, v]) => v === win.tier)?.[0] ?? String(win.tier);
	let reason = tierName;
	if (rest.length && rest[0].tier === win.tier) reason += win.home && !rest[0].home ? ' + category' : bySize ? ' + smallest' : ' + alphabetical';
	return { feature: win.s.id, tier: win.tier, reason, tied: peers.map(c => c.s.id) };
}
