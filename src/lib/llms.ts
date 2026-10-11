/**
 * Machine-readable views of the catalog for LLMs and tools: /api.json (src/pages/api.json.ts)
 * and the links in /llms.txt (src/pages/llms.txt.ts). See docs/llms.md.
 */
import { catalog, apiHref, constantGroupHref, constantsInGroup } from './catalog';
import { categoryLinkHref } from './categories';
import { SITE } from './page-markdown/util';

export const API_SCHEMA_VERSION = 1;
export const DEFINITIONS_YAML = 'https://raw.githubusercontent.com/secondlife/lsl-definitions/main/lsl_definitions.yaml';
export const DEFINITIONS_REPO = 'https://github.com/secondlife/lsl-definitions';
/** One-line pointer placed under the title of every .md export (src/lib/page-markdown.ts). */
export const MARKDOWN_HEADER = `> lsl.dev (unofficial LSL docs). Full API: ${SITE}/api.json · Index for LLMs: ${SITE}/llms.txt`;

const abs = (path: string) => SITE + path;
const urls = (path: string) => ({ url: abs(path), markdown: abs(`${path}index.md`) });
/** Drops undefined, false and empty-array fields so the minified file stays small. */
const compact = <T extends Record<string, any>>(o: T): T =>
	Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== false && !(Array.isArray(v) && !v.length))) as T;
const params = (ps: any[]) => ps.map(p => compact({ name: p.name, type: p.type, description: p.description || undefined }));

function callable(e: any) {
	const d = e.definition ?? {};
	return compact({
		name: e.name,
		signature: e.signature,
		returns: e.kind === 'function' ? e.returnType : undefined,
		parameters: params(e.parameters),
		description: e.description,
		sleep: d.sleep || undefined,
		monoSleep: d['mono-sleep'],
		energy: d.energy,
		permissions: d['requires-permission'],
		experience: d.experience === true,
		lindenExperience: d['linden-experience'] === true,
		godMode: d['god-mode'] === true,
		categories: e.categories,
		replaces: e.replaces,
		added: e.added ?? undefined,
		updated: e.updated ?? undefined,
		...urls(apiHref(e.kind, e.name)),
	});
}

/** Deprecated names (they have no pages) and the item to use instead, from the definitions' alias map. */
export const deprecatedItems = () => (catalog.deprecated as any[]).map(d => ({ name: d.name as string, kind: d.kind as string, use: d.use as string }));

export function buildApi() {
	const m = catalog.meta as any;
	const constantGroups = Object.entries(catalog.enums as Record<string, any>)
		.map(([name, info]) => ({ name, info, members: constantsInGroup(name).map(c => c.name) }))
		.filter(g => g.members.length)
		.map(g => compact({ name: g.name, type: g.info.type, prefix: g.info.prefix, description: g.info.tooltip || undefined, members: g.members, url: abs(constantGroupHref(g.name)) }));
	return {
		schemaVersion: API_SCHEMA_VERSION,
		generated: new Date().toISOString(),
		site: SITE,
		about: 'Public LSL (Linden Scripting Language) API from lsl.dev, an unofficial merge of the LSL Definitions and the Second Life LSL Wiki. Deprecated and private items are not in functions/events/constants; the `deprecated` section lists each deprecated name with its replacement (`use`).',
		license: { definitions: m.definitionsLicense, wiki: m.wikiLicense, wikiUrl: m.wikiLicenseUrl, note: 'Descriptions come from the LSL Definitions (MIT); page prose derived from the wiki is CC BY-SA.' },
		source: {
			definitions: { ...m.sources.definitions, url: DEFINITIONS_YAML, repo: DEFINITIONS_REPO },
			wiki: { ...m.sources.wiki, latestRevision: m.latestWikiRevision },
			definitionsHistory: m.definitionsHistory ? { commit: m.definitionsHistory.commit, commitDate: m.definitionsHistory.commitDate, baseline: m.definitionsHistory.baseline } : undefined,
		},
		counts: { functions: catalog.functions.length, events: catalog.events.length, constants: catalog.constants.length, constantGroups: constantGroups.length, categories: catalog.categories.length },
		functions: catalog.functions.map(callable),
		events: catalog.events.map(callable),
		constants: catalog.constants.map((c: any) => compact({ name: c.name, type: c.type, value: c.value, description: c.description, groups: c.groups, replaces: c.replaces, added: c.added ?? undefined, updated: c.updated ?? undefined, ...urls(apiHref('constant', c.name)) })),
		constantGroups,
		categories: catalog.categories.map(c => compact({ id: c.id, label: c.label, functions: c.functions, events: c.events, constants: c.constants, url: abs(categoryLinkHref(c.id)) })),
		deprecated: deprecatedItems().map(d => ({ ...d, status: `deprecated, use ${d.use}`, useUrl: abs(apiHref(d.kind, d.use)) })),
	};
}
