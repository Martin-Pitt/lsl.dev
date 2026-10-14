/**
 * How a rule constant (PRIM_COLOR, PSYS_SRC_PATTERN, OBJECT_PERMS, …) is written in the rules
 * list of the functions that take it, in the notation of <ConstantGroup>: setter
 * `RULE, type arg, …`, getter `RULE, request → returned values`, no list brackets.
 *
 * Functions come from the definitions: `param-semantics` names the group a setter's rules list
 * takes, `param-get-semantics` a getter's. A group no function takes but which is another rule's
 * enum (PrimType, under PRIM_TYPE) is written nested after that rule. Arguments are the
 * definition's `values`, else the hand-edited shape in src/data/rule-groups/, else the
 * definition's own value-type, else a `[RULE, …]` shape quoted in the description.
 */
import { catalog } from './catalog';
import { ruleGroupOrders, type RuleLine } from '../data/rule-groups';

export type RuleArg = { type: string; name: string; details?: string; range?: string; enum?: string; access?: string };
export type RuleForm = { mode: 'set' | 'get'; functions: string[]; call: string; returns?: string };
export type RuleUsage = { forms: RuleForm[]; args: RuleArg[] };

const constants = catalog.constants as any[];
// LSL spellings of the definitions' semantic types (as in <ConstantGroup>).
const lslType = (t: string) => ({ boolean: 'integer', asset: 'string', uuid: 'key' } as Record<string, string>)[t] ?? t;

const takers = { set: new Map<string, string[]>(), get: new Map<string, string[]>() };
for (const f of catalog.functions as any[]) for (const p of f.parameters ?? []) {
	for (const [key, mode] of [['param-semantics', 'set'], ['param-get-semantics', 'get']] as const) {
		const g = p[key];
		if (g) takers[mode].set(g, [...(takers[mode].get(g) ?? []), f.name]);
	}
}
const ruleLines = new Map<string, RuleLine>();
for (const sections of Object.values(ruleGroupOrders)) for (const s of sections) for (const r of s.rules) {
	const line = typeof r === 'string' ? { rule: r } : r;
	if (!ruleLines.has(line.rule)) ruleLines.set(line.rule, line);
	for (const f of line.forms ?? []) if (f.args && !ruleLines.has(f.name)) ruleLines.set(f.name, { rule: f.name, args: f.args });
}

const range = (r: unknown) => {
	if (!Array.isArray(r) || r.length !== 2) return undefined;
	return r.every(v => typeof v === 'number') ? `${r[0]}–${r[1]}` : `${r[0]} to ${r[1]}`;
};
const parseArgs = (s: string): RuleArg[] => s.split(',').map(a => a.trim()).filter(Boolean)
	.map(a => { const [type, ...n] = a.split(/\s+/); return { type, name: n.join(' ') }; }).filter(a => a.name);

function argsOf(c: any): RuleArg[] {
	const d = c.definition ?? {};
	if (d.values?.length) return d.values.map((v: any) => ({
		type: lslType(v['value-type'] ?? v.type ?? ''), name: v.name, details: v.details, range: range(v.range), enum: v.enum, access: v.access,
	}));
	const explicit = ruleLines.get(c.name)?.args;
	if (explicit) {
		const args = parseArgs(explicit);
		// A single-valued rule with an enum (PRIM_MATERIAL → PRIM_MATERIAL_*): that value is the enum.
		if (args.length === 1 && d.enum) args[0].enum = d.enum;
		return args;
	}
	if (d['value-type']) {
		// PRIM_TYPE → PRIM_TYPE_BOX, …: each form has its own arguments, shown on the form's page.
		const forms = d.enum && constants.some(m => m.definition?.['member-of']?.includes(d.enum) && m.definition.values);
		return [{ type: lslType(d['value-type']), name: 'value', enum: d.enum, range: range(d.range), details: forms ? 'Followed by the arguments of that form.' : undefined }];
	}
	const m = new RegExp(`\\[\\s*${c.name}\\s*,([^\\]]+)\\]`).exec(c.description ?? '');
	return m ? parseArgs(m[1]) : [];
}

// In getter notation the face (or link) selector is passed; everything else is returned.
const isRequest = (a: RuleArg) => a.access === 'arg' || (!a.access && (a.name === 'face' || a.name === 'link_target'));
const fmt = (args: RuleArg[]) => args.map(a => `${a.type} ${a.name}`);

/** Set and get forms of a rule constant, or none when no function takes its groups. */
export function ruleUsage(c: any): RuleUsage {
	const groups: string[] = c.definition?.['member-of'] ?? [];
	const args = argsOf(c);
	const forms: RuleForm[] = [];
	const add = (mode: 'set' | 'get', functions: string[], head: string[], nested?: boolean) => {
		if (!functions.length) return;
		let call: string, returns: string | undefined;
		if (mode === 'set') call = [...head, ...fmt(args.filter(a => a.access !== 'read'))].join(', ');
		else if (nested) { call = head[0]; returns = [...head.slice(1), ...fmt(args.filter(a => a.access !== 'write'))].join(', '); }
		else {
			call = [...head, ...fmt(args.filter(isRequest))].join(', ');
			returns = fmt(args.filter(a => !isRequest(a) && a.access !== 'write')).join(', ') || undefined;
		}
		const same = forms.find(f => f.mode === mode && f.call === call && f.returns === returns);
		if (same) same.functions.push(...functions.filter(f => !same.functions.includes(f)));
		else forms.push({ mode, functions: [...functions], call, returns });
	};
	for (const g of groups) {
		const set = takers.set.get(g) ?? [], get = takers.get.get(g) ?? [];
		if (set.length || get.length) {
			add('set', set, [c.name]);
			// Set-only rules (PRIM_PROJECTOR) are not returned by the getter.
			if (!ruleLines.get(c.name)?.setOnly) add('get', get, [c.name]);
			continue;
		}
		// Nested forms: PRIM_TYPE_BOX is written after PRIM_TYPE, in PRIM_TYPE's functions.
		for (const parent of constants.filter(p => p.definition?.enum === g && !p.definition?.values)) {
			for (const pg of parent.definition['member-of'] ?? []) {
				add('set', takers.set.get(pg) ?? [], [parent.name, c.name], true);
				add('get', takers.get.get(pg) ?? [], [parent.name, c.name], true);
			}
		}
	}
	return { forms: forms.sort((a, b) => (a.mode === b.mode ? 0 : a.mode === 'set' ? -1 : 1)), args: forms.length ? args : [] };
}
