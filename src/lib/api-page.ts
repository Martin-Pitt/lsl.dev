/** Page-level helpers shared by the function, event and constant detail routes. */
import { categoryMap, categoryHref, constantGroupHref } from './catalog';

/** The fields these helpers read; functions, events and constants all provide them. */
type ApiEntry = { name: string; kind: string; categories: string[]; parameters: { name: string; type: string }[]; returnType?: string; groups?: string[]; wiki?: { sections?: { id: string; title: string }[] } | null };

/** Wiki sections that read as the entry's lead prose; shown without a heading (see PROSE_IDS in wiki_render.py). */
export const PROSE_IDS = new Set(['overview', 'wiki-description', 'return-value-notes', 'function-notes', 'event-notes', 'constant-notes', 'function-guidance', 'function-details']);

const INDEX: Record<string, [string, string]> = { function: ['Functions', '/functions/'], event: ['Events', '/events/'], constant: ['Constants', '/constants/'] };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Breadcrumb trail: index › category (or constant group) › entry. */
export function breadcrumbs(entry: ApiEntry): { label: string; href?: string }[] {
	const [label, href] = INDEX[entry.kind];
	const trail: { label: string; href?: string }[] = [{ label, href }];
	const group = entry.kind === 'constant' ? entry.groups?.[0] : undefined;
	const category = entry.categories[0];
	if (group) trail.push({ label: group, href: constantGroupHref(group) });
	else if (category) trail.push({ label: categoryMap.get(category)?.label || category, href: categoryHref(category) });
	trail.push({ label: entry.name });
	return trail;
}

/** Breadcrumbs as HTML for Starlight's banner slot, which sits above the page title. */
export function breadcrumbBanner(entry: ApiEntry): string {
	const items = breadcrumbs(entry).map((c, i, all) => `<li>${c.href ? `<a href="${esc(c.href)}">${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}${i < all.length - 1 ? '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14"><polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</li>`);
	return `<nav class="api-crumbs" aria-label="Breadcrumbs"><ol>${items.join('')}</ol></nav>`;
}

/** Right-sidebar headings: only the wiki sections that keep a heading. */
export function apiHeadings(entry: ApiEntry) {
	return (entry.wiki?.sections || []).filter(s => !PROSE_IDS.has(s.id)).map(s => ({ depth: 2, slug: s.id, text: s.title }));
}

const PLACEHOLDER: Record<string, string> = { integer: '0', float: '0.0', string: '""', key: 'NULL_KEY', vector: 'ZERO_VECTOR', rotation: 'ZERO_ROTATION', quaternion: 'ZERO_ROTATION', list: '[]' };

/** A minimal call (functions) or handler (events) built from the signature, with typed placeholder values. */
export function usageSnippet(entry: ApiEntry): string | undefined {
	const params = entry.parameters;
	if (entry.kind === 'function') {
		const call = `${entry.name}(${params.map(p => PLACEHOLDER[p.type] ?? p.name).join(', ')});`;
		return entry.returnType && entry.returnType !== 'void' ? `${entry.returnType} result = ${call}` : call;
	}
	if (entry.kind === 'event') return `${entry.name}(${params.map(p => `${p.type} ${p.name}`).join(', ')})\n{\n\t\n}`;
	return undefined;
}
