/**
 * Markdown export cases for Batch 3 (asides and disclosure): Caveat, Limit, Gotcha, Performance,
 * LimitsTable, Details, FAQ, Figure, Since. Owned by the asides batch agent. See ./types.ts and
 * docs/design/components-plan.md for the agreed Markdown form of each component.
 *
 * - Caveat / Gotcha / Performance: `> **Gotcha:** body` (the first paragraph is quoted).
 * - Limit: inline `[value](/reference/limits/#id)`; with `note`, a quoted callout with the label,
 *   the linked value and the row's note. LimitsTable: a Markdown table built from the data.
 * - Details: `**Summary**` and the body, never collapsed. FAQ: its title as `### Title`.
 * - Figure: the built image URL isn't known here, so `*[Figure: alt]*` and the caption (a prop in italics, or the children as they are).
 * - Since: `(since 2022-11)`.
 */
import type { CaseFile } from './types';
import { getLimit, limitHref, limitsIn, limitSections, limitValue, type LimitField } from '../../components/authoring/asides/limits';

const callout = (title: string) => (a: Record<string, any>): [string, string] => [`\n\n> **${a.title ?? title}:** `, '\n\n'];
/** A value inside our own link: its links are unwrapped. */
const value = (id: string) => limitValue(getLimit(id)).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
/** Markdown cells hold `<br />` already; pipes would split a cell. */
const cell = (s?: string) => (s ?? '').replace(/\|/g, '\\|');

function limitsTable(section: string) {
	const columns = Object.entries(limitSections.get(section)?.columns ?? {}) as [LimitField, string][];
	const rows = limitsIn(section).map(l => `| ${columns.map(([f]) => cell(l[f])).join(' | ')} |`);
	return [`| ${columns.map(([, h]) => h).join(' | ')} |`, `| ${columns.map(() => '---').join(' | ')} |`, ...rows].join('\n');
}

function limitCallout(a: Record<string, any>) {
	const l = getLimit(a.id);
	const lines = [`**${a.title ?? 'Limit'}:** ${l.label}: [${value(l.id)}](${limitHref(l.id)})`];
	if (l.notes) lines.push(l.notes);
	return lines.map(s => `> ${s}`).join('\n>\n');
}

export default {
	selfClosing: {
		LimitsTable: (a) => limitsTable(a.section),
		/** The inline form returns undefined, so it falls back to `paired` and stays in its sentence. */
		Limit: (a) => (a.note ? limitCallout(a) : undefined),
		Since: () => undefined,
		Figure: (a) => `*[Figure: ${a.alt}]*${a.caption ? `\n\n*${a.caption}*` : ''}`,
	},
	paired: {
		Caveat: callout('Caveat'),
		Gotcha: callout('Gotcha'),
		Performance: callout('Performance'),
		Limit: (a) => (a.note ? [`\n\n${limitCallout(a)}\n\n`, '\n\n'] : [`[${value(a.id)}](${limitHref(a.id)})`, '']),
		Details: (a) => [`\n\n**${a.summary}**\n\n`, '\n\n'],
		FAQ: (a) => [a.title ? `\n\n### ${a.title}\n\n` : '\n\n', '\n\n'],
		Figure: (a) => [`\n\n*[Figure: ${a.alt}]*${a.caption ? `\n\n*${a.caption}*` : ''}\n\n`, '\n\n'],
		Since: (a) => [`(since ${a.date})`, ''],
	},
	passthrough: [],
} satisfies CaseFile;
