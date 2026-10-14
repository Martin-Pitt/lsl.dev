/**
 * Markdown export cases for the site's existing components: the data-driven API components and
 * the layout components. Owned by the integrator; batch components go in their own case file.
 * See ./types.ts for the case-file shape.
 */
import { catalog, apiMap, apiHref, constantGroupHref, constantsInGroup, categoryMap, wikiByTitle } from '../catalog';
import { categoryLink } from '../categories';
import { featurePageMap, featureHref } from '../features';
import { parseSeeAlsoItem } from '../feature-mdx.mjs';
import { ruleUsage } from '../rule-usage';
import { code, need, quote } from './util';
import type { Attrs, CaseFile, Source } from './types';

const lslType = (t: string) => ({ boolean: 'integer', asset: 'string', uuid: 'key' } as Record<string, string>)[t] ?? t;
const literal = (c: any) => (c.type === 'string' || c.type === 'key' ? JSON.stringify(String(c.value)) : String(c.value));
const params = (e: any) => `(${(e.parameters ?? []).map((p: any) => `${p.type} ${p.name}`).join(', ')})`;
const typeOf = (e: any) => (e.kind === 'event' ? 'event' : e.kind === 'constant' ? e.type : e.returnType);
/** One-line linked signature, as in a <Signatures> row. */
const sigLine = (e: any) => `\`${typeOf(e)}\` [\`${e.name}\`](${apiHref(e.kind, e.name)})${e.kind === 'constant' ? ` \`= ${literal(e)}\`` : ` \`${params(e)}\``}`;

function apiHeader(kind: 'function' | 'event' | 'constant', name: string, showDescription: boolean) {
	const list = { function: catalog.functions, event: catalog.events, constant: catalog.constants }[kind] as any[];
	const e = need(list.find(x => x.name === name), `${kind} "${name}"`);
	const d = e.definition ?? {};
	const out: string[] = [];
	const flags = [['experience', 'requires an experience'], ['linden-experience', 'Linden experience only'], ['god-mode', 'privileged function']].filter(([k]) => d[k]).map(([, l]) => l);
	out.push(`*LSL ${kind}${flags.length ? ` (${flags.join(', ')})` : ''}*`);
	if (e.replaces?.length) out.push(`Replaces deprecated ${e.replaces.map(code).join(', ')}.`);
	const sig = kind === 'constant' ? `${e.type} ${e.name} = ${literal(e)};` : kind === 'function' ? `${e.returnType} ${e.signature};` : `${e.signature}`;
	out.push('```lsl\n' + sig + '\n```');
	if (kind === 'constant') {
		const usage = ruleUsage(e);
		for (const f of usage.forms) {
			const fns = f.functions.map(n => `[${code(n)}](${apiHref('function', n)})`).join(', ');
			out.push(`${f.mode === 'set' ? 'Set' : 'Get'} with ${fns}:\n\n` + '```lsl\n' + (f.returns ? `${f.call} → ${f.returns}` : f.call) + '\n```');
		}
		const notes = (a: any) => [a.details, a.range && `Range ${a.range}.`, a.access === 'read' && 'Returned only.', a.access === 'write' && 'Set only.', a.enum && `Values: [${a.enum}](${constantGroupHref(a.enum)})`].filter(Boolean).join(' ');
		if (usage.args.length) out.push(usage.args.map(a => `- ${code(`${a.type} ${a.name}`)}${notes(a) ? `: ${notes(a)}` : ''}`).join('\n'));
	}
	if (kind !== 'constant' && e.parameters?.length) out.push(e.parameters.map((p: any) => `- ${code(`${p.type} ${p.name}`)}${p.description ? `: ${p.description}` : ''}`).join('\n'));
	const sleep = d['mono-sleep'] ?? d.sleep;
	const facts = [
		kind === 'function' && e.returnType !== 'void' && `Returns: ${code(e.returnType)}`,
		kind === 'function' && sleep && `Delay: ${sleep}s`,
		kind === 'function' && d.energy != null && `Energy: ${d.energy}`,
		d['requires-permission'] && `Permission: ${code(String(d['requires-permission']))}`,
	].filter(Boolean);
	if (facts.length) out.push(facts.map(f => `- ${f}`).join('\n'));
	if (showDescription && e.description) out.push(e.description);
	const groups: string[] = d['member-of'] ?? [];
	if (groups.length) out.push(`Constant groups: ${groups.map(g => `[${g}](${constantGroupHref(g)})`).join(', ')}`);
	return out.join('\n\n');
}

function constantGroup(name: string) {
	const members = constantsInGroup(name) as any[];
	need(members.length, `constant group "${name}"`);
	const lines = members.map(c => {
		const vals = c.definition?.values as any[] | undefined;
		return vals?.length ? `${c.name}, ${vals.map(a => `${lslType(a['value-type'] ?? a.type ?? '')} ${a.name}`.trim()).join(', ')}` : `${c.name} = ${literal(c)}`;
	});
	return `Constant group [${name}](${constantGroupHref(name)}):\n\n\`\`\`lsl\n${lines.join('\n')}\n\`\`\``;
}

function seeAlso(items: string[]) {
	return items.map(item => {
		const { kind, target, label } = parseSeeAlsoItem(item);
		if (kind === 'feature') { const f = need(featurePageMap.get(target), item); return `[${label ?? f.title}](${featureHref(f.id)})`; }
		if (kind === 'category') { need(categoryMap.get(target), item); const l = categoryLink(target); return `[${label ?? l.label}](${l.href})`; }
		if (kind === 'wiki') { const w: any = need(wikiByTitle.get(target), item); return `[${label ?? w.title.replace(/^Category:/, '')} (Second Life Wiki)](${w.source.url})`; }
		return `[${label ?? target}](${target})`;
	}).join(', ');
}

function featureFooter(a: Attrs) {
	const out: string[] = [];
	if (a.related?.length) out.push('## Related features\n\n' + a.related.map((id: string) => { const f = need(featurePageMap.get(id), `feature "${id}"`); return `- [${f.title}](${featureHref(f.id)})`; }).join('\n'));
	if (a.categories?.length) out.push('## Categories\n\n' + a.categories.map((id: string) => { const l = categoryLink(id); return `- [${l.label}](${l.href})`; }).join('\n'));
	if (a.archive?.length) out.push('## On the Second Life Wiki\n\n' + a.archive.map((t: string) => { const w: any = need(wikiByTitle.get(t), `wiki page "${t}"`); return `- [${w.title.replace(/^Category:/, '')}](${w.source.url})`; }).join('\n'));
	return out.join('\n\n');
}

function attribution(a: Attrs) {
	const titles: string[] = [...(a.pages ?? []), ...(a.page ? [a.page] : [])];
	const links = titles.map(t => { const w: any = wikiByTitle.get(t) ?? wikiByTitle.get(t.replace(/_/g, ' ')); return w ? `[${w.source.title}](${w.source.url})` : t; });
	return `*${a.what ?? 'Adapted from the Second Life Wiki'} ${links.join(', ')}, by Second Life Wiki contributors, under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*`;
}

function wikiSource(source: Source) {
	if (!source?.url) return '';
	return `---\n\n*Source: [${source.wiki ?? 'Second Life Wiki'}](${source.url}) on the Second Life Wiki.${source.license ? ' ' + source.license : ''}*`;
}

export default {
	selfClosing: {
		LSLFunction: (a) => apiHeader('function', a.name, !!a.description),
		LSLEvent: (a) => apiHeader('event', a.name, !!a.description),
		LSLConstant: (a) => apiHeader('constant', a.name, !!a.description),
		ConstantGroup: (a) => constantGroup(a.name),
		WikiSource: (a, page) => wikiSource(page.data.source),
		InlineSyntax: (a) => code(String(a.code ?? '')),
		ConstantGroups: (a) => `Constant groups: ${(a.names ?? []).map((g: string) => `[${g}](${constantGroupHref(g)}) (${constantsInGroup(g).length})`).join(', ')}`,
		FeatureFooter: (a) => featureFooter(a),
		Attribution: (a) => attribution(a),
		LinkCard: (a) => `- [${a.title}](${a.href})${a.description ? `: ${a.description}` : ''}`,
		LSLControl: (a) => { const e: any = need(catalog.controls.find((c: any) => c.name === a.name), `control "${a.name}"`); return ['do', 'else', 'for', 'if', 'jump', 'return', 'state', 'while'].includes(a.name) ? '```text\n' + e.description + '\n```' : e.description; },
		LSLType: (a) => { const e: any = need(catalog.types.find((c: any) => c.name === a.name), `type "${a.name}"`); return e.description; },
	},
	paired: {
		Box: (a) => [`\n\n## ${a.href ? `[${a.title}](${a.href})` : a.title}\n\n`, '\n\n'],
		Card: (a) => [`\n\n### ${a.title}\n\n`, '\n\n'],
		Signatures: (a) => [(a.names ?? []).map((n: string) => `- ${sigLine(need(apiMap.get(n), `API "${n}"`))}${a.descriptions && (apiMap.get(n) as any).description ? `: ${(apiMap.get(n) as any).description}` : ''}`).join('\n') + '\n', '\n'],
		Signature: (a) => [`- ${sigLine(need(apiMap.get(a.name), `API "${a.name}"`))}: `, '\n'],
		SeeAlso: (a) => [`\n\nSee also: ${seeAlso(a.items ?? [])}`, '\n\n'],
		Planned: () => [' (planned: ', ')'],
		LinkButton: (a) => ['[', `](${a.href})`],
	},
	/** Layout components whose children are exported as they are, with no text of their own. */
	transform: {
		/** The whole aside, every block, quoted under its title. */
		Aside: (children, a) => `

${quote(`**${a.title ?? (a.type ? a.type[0].toUpperCase() + a.type.slice(1) : 'Note')}:** ${children.trim()}`)}

`,
	},
	passthrough: ['Column', 'Columns', 'CardGrid', 'PortalColumns', 'Tabs', 'TabItem'],
} satisfies CaseFile;
