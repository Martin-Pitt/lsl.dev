/** Row and group data for CatalogList on the reference index pages. */
import { inlineLsl } from '../../lib/inline-lsl';
import { apiHref, constantGroupHref, catalog } from '../../lib/catalog';
import { recentBadges } from '../../lib/recent';

export type Flag = { code: string; title: string };
/** Badge legend, in display order (after the LSL Wiki key); only data-backed badges from definition.*. */
/** NEW (src/lib/recent.ts: added in the last 12 months) leads the legend; the updated badge is not shown for now. */
export const BADGES: { code: string; label: string }[] = [
	{ code: 'NEW', label: 'added recently' },
	{ code: 'X', label: 'experience' }, { code: 'LX', label: 'Linden experience' }, { code: 'G', label: 'god mode' },
	{ code: 'S', label: 'sleeps' }, { code: 'P', label: 'permission' }, { code: '!SL', label: 'not in SLua' },
];
/** Badges for one entry: added recently, experience, Linden experience, god mode, script sleep, required permission, removed from SLua. */
export function apiFlags(entry: any): Flag[] {
	const def = entry.definition ?? {}, out: Flag[] = [], recent = recentBadges(entry);
	if (recent.badge === 'new') out.push({ code: 'NEW', title: `Added ${recent.added}` });
	if (def.experience) out.push({ code: 'X', title: 'Requires an experience' });
	if (def['linden-experience']) out.push({ code: 'LX', title: 'Requires a Linden-owned experience' });
	if (def['god-mode']) out.push({ code: 'G', title: 'Requires god mode' });
	if (def.sleep > 0) out.push({ code: 'S', title: `Sleeps ${def.sleep}s` });
	if (def['requires-permission']?.length) out.push({ code: 'P', title: `Requires ${def['requires-permission'].join(', ')}` });
	if (def['slua-removed']) out.push({ code: '!SL', title: 'Not available in SLua' });
	return out;
}

/** First letter for the A–Z bar; function names skip their ll prefix. */
export const letterOf = (name: string) => name.replace(/^ll(?=[A-Z])/, '').charAt(0).toLowerCase();

/** `name(type param, …)` with the name emphasised and parameter types muted (as in features/Signatures.astro). */
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function plainSignature(e: any) {
	const params = (e.parameters ?? []).map((q: any) => `<span class="pt">${esc(q.type)}</span> ${esc(q.name)}`).join(', ');
	return `<code><b>${esc(e.name)}</b>(${params})</code>`;
}

/** Signature-only rows (return type in a gutter); the description is the link title (hover text, and searched by the filter). */
export async function apiRows(entries: any[]) {
	return Promise.all(entries.map(async e => ({
		title: e.name, href: apiHref(e.kind, e.name), hover: e.description, categories: e.categories,
		type: e.kind === 'event' ? 'event' : e.returnType === 'void' ? '' : e.returnType, code: plainSignature(e),
		flags: apiFlags(e), letter: letterOf(e.name), prefix: e.kind === 'function' ? e.name.match(/^ll([A-Z][a-z]*)/)?.[1] : undefined,
	})));
}

/** First sentence, at most 140 characters (the hover-card summary rule). */
export function oneLine(text = ''): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	const first = flat.match(/^.+?[.!?](?=\s+[A-Z(]|$)/)?.[0] ?? flat;
	return first.length <= 140 ? first : first.slice(0, 139).replace(/\s+\S*$/, '') + '…';
}

/** Constants grouped under their first constant group (alphabetical), ungrouped ones last. */
export async function constantGroups(constants: any[]) {
	const cats = constantCategories();
	const byGroup = new Map<string, any[]>();
	for (const c of constants) { const g = c.groups?.[0] ?? ''; if (!byGroup.has(g)) byGroup.set(g, []); byGroup.get(g)!.push(c); }
	const names = [...byGroup.keys()].filter(Boolean).sort((a, b) => a.localeCompare(b));
	if (byGroup.has('')) names.push('');
	return Promise.all(names.map(async g => ({
		id: g, label: g || 'Other constants', href: g ? constantGroupHref(g) : undefined, letter: g ? g.charAt(0).toLowerCase() : undefined,
		items: await Promise.all(byGroup.get(g)!.map(async c => ({
			title: c.name, href: apiHref(c.kind, c.name), description: oneLine(c.description), categories: cats(c),
			flags: apiFlags(c), code: c.signature ? await inlineLsl(c.signature.replace(/^\w+\s+/, '').replace(/\s*=\s*"?[0-9a-f]{8}-[0-9a-f-]{27}"?$/i, ''),{ link: false }) : undefined,
		}))),
	})));
}

/** Categories for constants, which rarely carry their own: those shared by at least half of the functions
 * and events whose parameters (or results) take the constant's group, e.g. Link → Linkset (not UUID just
 * because llGetLinkKey takes a link number). A group no function names borrows from groups sharing its
 * first word (PrimShiny → Prim*). */
function constantCategories() {
	type Tally = { n: number; c: Map<string, number> };
	const byGroup = new Map<string, Tally>(), byHead = new Map<string, Tally>();
	const head = (s: string) => s.match(/^(?:[A-Z]+(?=[A-Z][a-z])|[A-Z][a-z]+)/)?.[0] ?? s;
	const add = (m: Map<string, Tally>, k: string, cats: string[]) => {
		const t = m.get(k) ?? m.set(k, { n: 0, c: new Map() }).get(k)!;
		t.n++; for (const x of cats) t.c.set(x, (t.c.get(x) ?? 0) + 1);
	};
	for (const f of [...catalog.functions, ...catalog.events] as any[]) {
		const groups = new Set<string>();
		for (const p of [f, ...(f.parameters ?? [])]) for (const [k, v] of Object.entries(p)) if (k.endsWith('semantics') && typeof v === 'string') groups.add(v);
		for (const g of groups) { add(byGroup, g, f.categories ?? []); add(byHead, head(g), f.categories ?? []); }
	}
	const shared = (t?: Tally) => t ? [...t.c].filter(([, k]) => k * 2 >= t.n).map(([x]) => x) : [];
	return (c: any) => {
		const out = new Set<string>(c.categories ?? []);
		for (const g of c.groups ?? []) for (const x of shared(byGroup.get(g) ?? byHead.get(head(g)))) out.add(x);
		return [...out];
	};
}
