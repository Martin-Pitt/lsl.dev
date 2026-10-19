/** /llms.txt (https://llmstxt.org): an index of lsl.dev for LLMs and tools. See docs/llms.md. */
import type { APIRoute } from 'astro';
import { catalog } from '../lib/catalog';
import { SITE } from '../lib/page-markdown/util';
import { DEFINITIONS_YAML, DEFINITIONS_REPO, deprecatedItems } from '../lib/llms';
import { LLMS_FULL } from './llms-full.txt';

const md = (path: string) => `${SITE}${path}index.md`;

export const GET: APIRoute = () => {
	const m = catalog.meta as any;
	const lines = [
		'# lsl.dev',
		'',
		'> Unofficial developer documentation for the Linden Scripting Language (LSL) of Second Life: every public function, event and constant, plus fundamentals, feature overviews, guides and recipes.',
		'',
		`lsl.dev is not affiliated with Linden Lab. It merges the official LSL Definitions (${DEFINITIONS_REPO}, ${m.definitionsLicense}), which are authoritative for names, signatures, parameters and categories, with text adapted from the Second Life LSL Wiki (${m.wikiLicense}, ${m.wikiLicenseUrl}). Reuse of wiki-derived text must credit the wiki and keep the CC BY-SA license.`,
		'',
		'URL scheme (all under ' + SITE + '):',
		'',
		'- `/functions/<name>/`, `/events/<name>/`, `/constants/<name>/`: one page per API item, e.g. `/functions/llListen/`',
		'- `/constants/groups/<group>/`: a constant group (enum or flag set), e.g. `/constants/groups/PrimParam/`',
		'- `/categories/<id>/`: a definition category, e.g. `/categories/chat/`',
		'- `/features/<id>/`: a feature overview, e.g. `/features/physics/`',
		'- Any page written in MDX (API pages, fundamentals, features, guides, recipes, types) is also plain Markdown at `<page>/index.md`, e.g. `/functions/llListen/index.md`',
		'',
		'Section anchors on API pages (present when the page has that section): `#specification`, `#caveats`, `#known-issues`, `#examples`, `#helper-functions`, `#notes`, `#history`, `#related-functions`, `#see-also`; constant pages also have `#constant-groups`.',
		'',
		'## Machine-readable',
		'',
		`- [API JSON](${SITE}/api.json): every public function, event and constant with signatures, parameters, descriptions, sleep, energy, permissions, constant groups, categories and the deprecated-name map, with page and Markdown URLs`,
		...(LLMS_FULL ? [`- [llms-full.txt](${SITE}/llms-full.txt): the Markdown of every function, event and constant page in one file`] : []),
		`- [Sitemap](${SITE}/sitemap-index.xml): every HTML page`,
		`- [lsl_definitions.yaml](${DEFINITIONS_YAML}): the upstream LSL Definitions source (${DEFINITIONS_REPO})`,
		'',
		'## Docs',
		'',
		`- [Fundamentals](${md('/fundamentals/')}): types, operators, flow control, states and events, memory, errors`,
		`- [Reference overview](${SITE}/reference/): entry point to functions, events, constants and categories`,
		`- [Limits](${md('/reference/limits/')}): script, memory, chat, HTTP and other numeric limits`,
		`- [Viewer URIs](${md('/reference/viewer-uris/')}): every secondlife:// and secondlife:///app/ URI form`,
		`- [Features overview](${SITE}/features/): Second Life features with their APIs`,
		`- [Guides](${md('/guides/')}): longer explanations and techniques`,
		`- [Recipes](${md('/recipes/')}): small complete scripts`,
		'',
		'## Deprecated functions to avoid',
		'',
		'These have no lsl.dev pages; use the replacement. Deprecated constants are listed in the `deprecated` section of api.json.',
		'',
		...deprecatedItems().filter(d => d.kind === 'function').map(d => `- ${d.name} → [${d.use}](${SITE}/functions/${d.use}/index.md)`),
		'',
		'## Optional',
		'',
		`- [About](${md('/about/')}): sources, licensing and how the site is built`,
		`- [Functions](${SITE}/functions/), [Events](${SITE}/events/), [Constants](${SITE}/constants/), [Categories](${SITE}/categories/): full HTML catalogs`,
		'',
	];
	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
