/**
 * Writes src/data/hovercards.json (git-ignored), the slim per-API card data read at build time by
 * src/components/authoring/hovercards/rehype-api-hovercards.ts. It runs before `astro build` and
 * `astro dev` (see package.json). Owned by the hovercards batch agent.
 *
 * Record shape: { [name]: { k: kind, s: signature, d: oneLine (<= 140 chars), f?: flags[] } }
 * Flags are short display strings: sleep, non-default energy, required permissions, experience,
 * god mode and SLua availability (removed or deprecated). Only notable values become flags, so most records
 * have none.
 */
import { readFileSync, writeFileSync } from 'node:fs';

type Def = Record<string, any>;
type Entry = { name: string; kind: string; signature?: string; description?: string; definition?: Def };

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));
const DEFAULT_ENERGY = 10;

/** The first sentence, cut at a word boundary to at most 140 characters. */
function oneLine(text = ''): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	const first = flat.match(/^.+?[.!?](?=\s+[A-Z(]|$)/)?.[0] ?? flat;
	if (first.length <= 140) return first;
	return first.slice(0, 139).replace(/\s+\S*$/, '') + '…';
}

function flags(e: Entry): string[] {
	const d = e.definition ?? {};
	const out: string[] = [];
	if (d.sleep > 0) out.push(`Sleeps ${d.sleep} s`);
	if (typeof d.energy === 'number' && d.energy !== DEFAULT_ENERGY) out.push(`Energy ${d.energy}`);
	for (const p of d['requires-permission'] ?? []) out.push(p);
	if (d.experience) out.push('Experience');
	if (d['god-mode']) out.push('God mode');
	if (d['slua-removed']) out.push('Not in SLua');
	else if (d['slua-deprecated']) out.push('Deprecated in SLua');
	return out;
}

const out: Record<string, { k: string; s: string; d: string; f?: string[] }> = {};
for (const e of [...catalog.functions, ...catalog.events, ...catalog.constants] as Entry[]) {
	const f = flags(e);
	out[e.name] = { k: e.kind, s: e.signature ?? e.name, d: oneLine(e.description ?? e.definition?.tooltip), ...(f.length ? { f } : {}) };
}

const json = JSON.stringify(out);
writeFileSync(new URL('../src/data/hovercards.json', import.meta.url), json + '\n');
console.log(`hovercards.json: ${Object.keys(out).length} entries, ${(json.length / 1024).toFixed(0)} KB`);
