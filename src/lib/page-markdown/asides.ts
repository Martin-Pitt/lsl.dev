/**
 * Markdown export cases for Batch 3 (asides and disclosure): Caveat, Limit, Gotcha, Performance,
 * LimitsTable, Details, FAQ, Since (Figure is in ./media.ts). Owned by the asides batch agent. See ./types.ts and
 * docs/design/components-plan.md for the agreed Markdown form of each component.
 *
 * - Caveat / Gotcha / Performance: `> **Gotcha:** body`, the whole body quoted (every paragraph and code block).
 * - Limit: inline `[value](/reference/limits/#id)`; with `note`, a quoted callout with the label,
 *   the linked value and the row's note. LimitsTable: a Markdown table built from the data.
 * - Details: `**Summary**` and the body, never collapsed; inside a FAQ, `### Summary` and the body.
 *   FAQ: its title, if any, as `## Title`, so its `###` questions sit under it.
 * - Since: `(since 2022-11)`.
 */
import type { CaseFile } from './types';
import { quote } from './util';
import { getLimit, limitHref, limitsIn, limitSections, limitValue, type LimitField } from '../../components/authoring/asides/limits';

/** The whole body goes into the blockquote, every paragraph and code block. */
const callout = (title: string) => (children: string, a: Record<string, any>) => `\n\n${quote(`**${a.title ?? title}:** ${children.trim()}`)}\n\n`;
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
	const head = `**${a.title ?? 'Limit'}:** ${l.label}: [${value(l.id)}](${limitHref(l.id)})`;
	return quote(l.notes ? `${head}\n\n${l.notes}` : head);
}

export default {
	selfClosing: {
		LimitsTable: (a) => limitsTable(a.section),
		/** The inline form returns undefined, so it falls back to `paired` and stays in its sentence. */
		Limit: (a) => (a.note ? limitCallout(a) : undefined),
		Since: () => undefined,
	},
	paired: {
		Limit: (a) => (a.note ? [`\n\n${limitCallout(a)}\n\n`, '\n\n'] : [`[${value(a.id)}](${limitHref(a.id)})`, '']),
		Details: (a, _page, ctx) => [ctx.parents.includes('FAQ') ? `\n\n### ${a.summary}\n\n` : `\n\n**${a.summary}**\n\n`, '\n\n'],
		FAQ: (a) => [a.title ? `\n\n## ${a.title}\n\n` : '\n\n', '\n\n'],
		Since: (a) => [`(since ${a.date})`, ''],
	},
	transform: {
		Caveat: callout('Caveat'),
		Gotcha: callout('Gotcha'),
		Performance: callout('Performance'),
	},
	passthrough: [],
} satisfies CaseFile;
