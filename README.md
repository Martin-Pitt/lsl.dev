# lsl.dev

**Unofficial** documentation for the Linden Scripting Language (LSL) used in Second Life.
lsl.dev is a community project. It is not affiliated with or endorsed by Linden Lab.

The content merges two sources:

- **[LSL Definitions](https://github.com/secondlife/lsl-definitions)** supplies signatures,
  parameter names and descriptions, return types, constant values, categories and other
  metadata. The `sync-lsl-definitions.yml` workflow refreshes the snapshot from GitHub.
- **The official [LSL Wiki](https://wiki.secondlife.com/wiki/LSL_Portal)** supplies
  descriptive prose, caveats and examples, from an offline English export (assembled
  10 October 2026, newest revision 3 October 2026). Wiki content is used under
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) with per-page attribution.

The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build),
and shares its look, components and navigation structure with the sister site
[slua.dev](https://slua.dev).

Production URL (from `astro.config.mjs`): https://lsl.dev

## Offline policy: no wiki network access

**Nothing in this repository may make a network request to the Second Life Wiki.** (LSL Definitions
is the one source fetched from the network, by its sync workflow on GitHub.) That
covers crawling, scraping, API calls, fetching templates or images, and checking links.
In the past, automated requests got 403 responses and probably contributed to a bot ban.

- All wiki content comes from the checked-in export `data/sources/wiki-English.xml`.
- `scripts/import-datasets.py` and `scripts/check-built-links.py` use only local files.
- Rendered pages can *link* to `wiki.secondlife.com` (source, revision and history links
  for attribution). The site never *embeds* remote wiki assets, and
  `test:links` fails if any `<img>`, `<script>` or `<iframe>` has a remote `src`.
- Do not validate external links by fetching them.
- The generators in `scripts/legacy/` predate this policy. They are archival, unsupported,
  and must not be run (see `scripts/legacy/README.md`).

## Architecture

```
data/sources/            SOURCE: checked-in snapshots (edit only to refresh them)
  wiki-English.xml         original English wiki revisions (2,266 pages)
  lsl_definitions.yaml     canonical LSL definitions (MIT)
  definitions-LICENSE      the definitions' license, verbatim
  categories.en.json       readable category labels (from slua.dev)
  README.md                provenance and rendering-policy details
scripts/
  import-datasets.py       offline importer: sources -> derived data
  lib/wiki_render.py       safe partial wikitext -> HTML renderer
  lib/wiki_fields.py       template field extraction helpers
  lib/test_import.py       15 unittest tests for importer + renderer
  check-built-links.py     offline audit of dist/ (local links, remote assets)
  requirements.txt         Python deps (PyYAML==6.0.3)
  legacy/                  archived JS generators (unsupported)
src/data/catalog.json    DERIVED: full catalog consumed by the site
src/data/topic-guides.json  hand-curated category summaries and task links
public/wiki-source/*.txt DERIVED: raw wikitext per archived page (downloadable)
data/reports/            DERIVED/diagnostic: import, link and dependency reports
src/lib/catalog.ts       typed access to catalog.json
src/pages/               data-driven routes (see below)
src/components/reference ApiDetail, CatalogList, WikiContent, WikiAttribution
src/components/starlight Header, Hero, PageFrame (from slua.dev) and Footer overrides
src/styles/slua-base.css slua.dev's theme CSS, copied verbatim; custom.css adds lsl.dev rules
src/data/feature-clusters.json  feature dashboards (slua.dev slugs) and old-slug redirects: drives /features/, the sidebar and API feature links
src/content/docs/        hand-written MDX: home, guides, types, controls
src/legacy/              pre-modernization MDX/components (excluded from the build)
```

Routes built from the catalog: `/reference/`, `/functions/` and `/functions/[name]/`,
`/events/` and `/events/[name]/`, `/constants/` and `/constants/[name]/`,
`/categories/` and `/categories/[id]/`, `/constants/groups/` and `/constants/groups/[group]/`,
`/features/` and `/features/[id]/`, `/wiki/` and `/wiki/[slug]/`. The sidebar links only to
feature areas, categories and indexes, never to individual functions or constants. Search uses Starlight's built-in Pagefind index.

### Source data vs derived data

| Kind | Paths | How it changes |
|---|---|---|
| Source | `data/sources/*` | Replaced deliberately when refreshing snapshots |
| Curated | `src/data/topic-guides.json`, `src/content/docs/**` | Edited by hand |
| Derived | `src/data/catalog.json`, `public/wiki-source/*.txt`, `data/reports/import-report.json` | Written by `npm run import:data`, never edited by hand |
| Diagnostic | `data/reports/built-links.json`, `data/reports/npm-audit*.json`, `data/reports/dependency-audit.md` | Written by checks/audits |

Derived files are committed so that `astro build` needs only Node, not Python or the
sources. The importer is deterministic: running it twice on the same inputs gives
byte-identical output. The CI workflow relies on this (see below).

Precedence: the YAML is authoritative for signatures, parameter names and descriptions,
return types, constant values, categories and metadata. Wiki prose, caveats, notes and
examples are kept verbatim from the original revisions, with no rewriting or summarizing.
The main API reference leaves out entries flagged `private` or `deprecated` for LSL.
The wiki archive keeps every imported page, including historical ones.

## Setup

Requirements:

- **Node.js >= 22.12.0** (the `engines` requirement of `astro@7.3.8`; npm >= 9.6.5). CI
  uses Node 22. Development was also checked on Node 26.7.0.
- **Python >= 3.12** only for the importer and tests (CI uses 3.12; also checked locally
  on 3.14.7), plus `PyYAML==6.0.3`. Building the site does not need Python.

```sh
npm ci                                       # or npm install
python -m pip install -r scripts/requirements.txt
npm run dev                                  # http://localhost:4321
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Astro dev server |
| `npm run build` | Production build to `dist/` (includes Pagefind) |
| `npm run preview` | Serve the built `dist/` |
| `npm run check` | `astro check` type/diagnostic pass |
| `npm run import:data` | `python scripts/import-datasets.py`: regenerate derived data from `data/sources` |
| `npm run test:data` | `python -m unittest discover -s scripts/lib -p "test_*.py"` (15 tests) |
| `npm run test:links` | `python scripts/check-built-links.py`: needs a prior build. Checks local `href`s in `dist/` and fails on remote assets. Writes `data/reports/built-links.json` |

Importer options: `python scripts/import-datasets.py --wiki PATH --definitions PATH`
reads other local files instead of the default snapshots. No network is involved.

## Regeneration and tests

```sh
npm run import:data     # rewrites catalog.json, public/wiki-source/, import-report.json
npm run test:data       # importer/renderer unit tests
npm run build
npm run test:links
git diff --stat         # derived output should change only where the sources changed
```

CI (`.github/workflows/lsl-sync.yml`, on pull requests touching `data/`, `scripts/`
or `src/data/`, and on manual dispatch) installs `scripts/requirements.txt` and runs
the unit tests. It then reruns the importer and fails if `src/data/catalog.json`,
`public/wiki-source` or `data/reports` differ from what is committed. The workflow makes
no network requests to the wiki and pushes nothing. Deployment
(`.github/workflows/astro.yml`) runs only on pushes to `main` or manual dispatch.

## Catalog schema (`src/data/catalog.json`, `meta.schemaVersion` 1)

Top-level keys:

- `meta`: `schemaVersion`, `sourcePolicy`, `sources` (`wiki`/`definitions` file names
  and SHA-256), `counts`, `wikiLicense`, `wikiLicenseUrl`, `definitionsLicense`,
  `latestWikiRevision`.
- `functions`, `events`, `types`, `controls`: arrays of entries with `name`, `kind`,
  `slug`, `description`, `signature`, `returnType`, `parameters[]` (`name`, `type`,
  `description`), `categories[]`, `definition` (the full original YAML record:
  energy, sleep, func-id, flags, etc.), and `wiki` (the matched archive page or null).
- `constants`: the same fields plus `type`, `value` and `groups`.
- `categories`: `id`, `label`, and lists of `functions`, `events`, `constants`.
- `wiki`: archive pages with `id`, `slug`, `title`, `namespace`, `html` (rendered),
  `sections`, `rawPath` (link to `public/wiki-source/<slug>.txt`), and `source`
  (`title`, `url`, `revisionId`, `timestamp`, `contributor`, `revisionUrl`, `historyUrl`).
- `enums`: enum groups from the definitions (for example `AgentInfo`, `AttachPoint`).

Current counts: 501 functions, 42 events, 1,042 constants, 62 categories, 2,266 wiki
pages, 7 types, 10 controls. `data/reports/import-report.json` records exclusions,
API entries with no wiki page (for example `llFindNotecardTextCount`, which exists only in
the YAML and is not claimed to be deployed), unexpanded templates, and referenced titles
that have no local route.

## Partial wiki renderer: limits

`scripts/lib/wiki_render.py` is a deliberately limited, safe converter. **It is not
MediaWiki.** It handles headings and sections, internal links (rewritten to local
routes), code blocks (kept verbatim and inert), lists, basic tables, known inline
parameter helpers, `LSL Function/Headless` shared pages, and the static set/get branches
of the primitive-parameter tables.

It does not handle parser functions, dynamic transclusion, conditional or variable
template logic, nested table layouts, images, or arbitrary HTML. Unknown templates are
shown as escaped invocations that link to their archived template page, so no content
is invented. Injected helper templates appear under "Shared wiki helpers" with their
original source and a note that their conditionals were not evaluated. Wiki HTML,
scripts and iframes never run. When the rendering is incomplete, the full original
wikitext is always available at the page's `rawPath`.

## Updating the snapshots

1. Get a new wiki export **by hand** (for example, a user-initiated Special:Export
   download in a browser). Never script it. Do the same for a new `lsl-definitions`
   checkout.
2. Try it first without replacing anything:
   `python scripts/import-datasets.py --wiki /path/new.xml --definitions /path/lsl_definitions.yaml`
3. Review the diff of `src/data/catalog.json` and `data/reports/import-report.json`,
   then run `npm run test:data`, `npm run build` and `npm run test:links`.
4. To accept it, copy the files over `data/sources/wiki-English.xml` and
   `data/sources/lsl_definitions.yaml`, update `data/sources/README.md` (date, page
   count, provenance), and run `npm run import:data` with no arguments so the default
   run reproduces the committed output. Keep translations out of the English export.

## License and attribution

- **Site code:** MIT, see `LICENSE`.
- **LSL definitions** (`data/sources/lsl_definitions.yaml`): MIT, see
  `data/sources/definitions-LICENSE`.
- **Wiki content** (`data/sources/wiki-English.xml`, `public/wiki-source/`, and the
  rendered wiki prose on API and archive pages): written by Second Life Wiki contributors
  under **Creative Commons Attribution-ShareAlike 3.0**
  (https://creativecommons.org/licenses/by-sa/3.0/). It is not covered by the MIT code
  license. Each page shows its original title, revision ID, timestamp, latest-revision
  contributor, and links to the source revision and full history. The contributor shown
  is only the latest editor; the history link gives the full attribution chain.
  Derivative reuse must keep this attribution and the CC BY-SA terms.

Dependency audit status: see `data/reports/dependency-audit.md` (11 moderate advisories,
all from one build-time transitive dependency with no compatible upstream fix yet).
