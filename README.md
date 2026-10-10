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
- Rendered pages can *link* to `wiki.secondlife.com` (live article and history links
  for attribution). The site never *embeds* remote wiki assets, and
  `test:links` fails if any `<img>`, `<script>` or `<iframe>` has a remote `src`.
- Do not validate external links by fetching them.

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
  lib/test_import.py       unittest tests for importer + renderer
  generate-mdx.py          creates missing API pages (MDX) and reports drift; never overwrites
  lib/mdx_convert.py       wiki HTML -> readable MDX (Markdown first, HTML only where needed)
  lib/desc_review.py       compares definitions and wiki descriptions (data/reports/description-review.md)
  check-built-links.py     offline audit of dist/ (local links, remote assets, no /wiki/ links from API pages)
  feature-index.mjs        reads feature pages for astro.config; writes the generated feature index
  check-feature-migration.py  confirms the feature pages kept everything from the old JSON
  lib/feature_mdx.py       Python reader for feature pages (tests)
  lib/test_features.py     feature page tests (coverage, links, structure)
  requirements.txt         Python deps (PyYAML==6.0.3)
src/data/catalog.json    DERIVED: catalog index (definitions, categories, enums, slim wiki references)
src/data/wiki-html/      DERIVED: rendered archive pages, one file each, loaded lazily by /wiki/[slug]/
data/derived/api-wiki.json  DERIVED: per-API wiki sections, input of the MDX generator only
src/content/docs/{functions,events,constants}/  HAND-EDITED MDX: one page per public API (see docs/editing-api-pages.md)
src/data/mdx-pages.json  generator state: signature and wiki revision each page was generated from
src/data/topic-guides.json  hand-curated category summaries and task links
data/derived/wiki-source/*.txt  DERIVED: raw wikitext per archived page (tests, generator, CI; not deployed)
data/reports/            DERIVED/diagnostic: import, link and dependency reports
src/lib/catalog.ts       typed access to catalog.json
src/pages/               data-driven routes (see below)
src/components/lsl       API page components: LSLFunction/LSLEvent/LSLConstant, ConstantGroup, WikiSource
src/components/reference ApiSignature, CatalogList, WikiContent, WikiAttribution
src/route-middleware.ts, src/routeData.ts  meta descriptions; the current sidebar entry on deep pages
src/lib/page-nav.ts      breadcrumbs and chips under the title (PageTitle override)
src/lib/rehype-inline-lsl.ts  highlights inline `code` and API links in Markdown/MDX as LSL
src/components/starlight Header, Hero, PageFrame (from slua.dev) and Footer overrides
src/styles/slua-base.css slua.dev's theme CSS, copied verbatim; custom.css adds lsl.dev rules
src/content/docs/features/  hand-written feature pages (slua.dev slugs); drive /features/, the sidebar and API feature chips
src/components/features  feature page components (Columns, Box, Signatures, ApiLinks, SeeAlso, Planned, ...)
src/lib/features.ts      reads the feature pages: featurePages, featuresForApi (API feature chips)
src/lib/categories.ts    categoryLink(id): link and label for a category; a single-member category links its member (no page)
src/data/feature-clusters.json  GENERATED from the feature pages by scripts/feature-index.mjs (for older code)
src/content/docs/        hand-written MDX: home, guides, types, controls, features
docs/                    contributor guides (not published)
```

API pages `/functions/<name>/`, `/events/<name>/` and `/constants/<name>/` are the MDX files in
`src/content/docs/{functions,events,constants}/` (one page per API; see
[docs/editing-api-pages.md](docs/editing-api-pages.md) for editing, adding pages and what the
generator does and does not overwrite).
Routes built from the catalog: `/reference/`, `/functions/`, `/events/`, `/constants/`,
`/categories/` and `/categories/[id]/`, `/constants/groups/` and `/constants/groups/[group]/`,
`/features/` (feature pages themselves are MDX in `src/content/docs/features/`), `/wiki/` and `/wiki/[slug]/`. The sidebar links only to
feature areas, categories and indexes, never to individual functions or constants. Search uses Starlight's built-in Pagefind index.

### Source data vs derived data

| Kind | Paths | How it changes |
|---|---|---|
| Source | `data/sources/*` | Replaced deliberately when refreshing snapshots |
| Curated | `src/data/topic-guides.json`, `src/content/docs/**` | Edited by hand |
| Generated index | `src/data/feature-clusters.json` | `node scripts/feature-index.mjs` after editing feature pages |
| Curated, generated once | `src/content/docs/{functions,events,constants}/*.mdx` | Created by `bun run generate:mdx` when missing, then edited by hand; never overwritten |
| Derived | `src/data/catalog.json`, `src/data/wiki-html/`, `data/derived/` (including `wiki-source/*.txt`), `data/reports/import-report.json` | Written by `bun run import:data`, never edited by hand |
| Diagnostic | `data/reports/built-links.json`, `data/reports/npm-audit*.json`, `data/reports/dependency-audit.md` | Written by checks/audits |

Derived files are committed so that `astro build` needs only Node, not Python or the
sources. The importer is deterministic: running it twice on the same inputs gives
byte-identical output. The CI workflow relies on this (see below).

Precedence: the YAML is authoritative for signatures, parameter names and descriptions,
return types, constant values, categories and metadata. Wiki prose, caveats, notes and
examples are kept verbatim from the original revisions, with no rewriting or summarizing.
The main API reference leaves out entries flagged `private` or `deprecated` for LSL.
The wiki archive keeps every imported page, including historical ones.

## Feature pages

Feature pages are MDX in `src/content/docs/features/<slug>.mdx`: Markdown prose with links on
meaningful phrases, plus components for signature tables, panels and link rows. See
[docs/editing-feature-pages.md](docs/editing-feature-pages.md) for editing or adding one and
[docs/style/feature-pages.md](docs/style/feature-pages.md) for the writing style.

## Setup

Requirements:

- **Bun** (package manager; `bun.lock` is the only lockfile, and CI installs with `bun ci`).
- **Node.js >= 22.12.0** (the `engines` requirement of `astro@7.3.8`). CI
  uses Node 22. Development was also checked on Node 26.7.0.
- **Python >= 3.12** only for the importer and tests (CI uses 3.12; also checked locally
  on 3.14.7), plus `PyYAML==6.0.3`. Building the site does not need Python.

```sh
bun install                                  # CI uses `bun ci` (frozen bun.lock)
python -m pip install -r scripts/requirements.txt
bun run dev                                  # http://localhost:4321
```

## Commands

| Command | What it does |
|---|---|
| `bun run dev` | Astro dev server |
| `bun run build` | Production build to `dist/` (includes Pagefind) |
| `bun run preview` | Serve the built `dist/` |
| `bun run check` | `astro check` type/diagnostic pass |
| `bun run features:index` | Regenerate `src/data/feature-clusters.json` from the feature pages |
| `bun run import:data` | `python scripts/import-datasets.py`: regenerate derived data from `data/sources` |
| `bun run generate:mdx` | `python scripts/generate-mdx.py`: create missing API pages, report drift (`--check`, `--force NAME`, `--accept NAME`) |
| `bun run test:data` | `python -m unittest discover -s scripts/lib -p "test_*.py"` |
| `bun run test:links` | `python scripts/check-built-links.py`: needs a prior build. Checks local `href`s in `dist/` and fails on remote assets. Writes `data/reports/built-links.json` |

Install dependencies with Bun only. `package-lock.json` is ignored, and `npm install` is not a
supported install path because it ignores `bun.lock`. Once dependencies are installed, `npm run <script>`
runs the same package.json scripts.

Importer options: `python scripts/import-datasets.py --wiki PATH --definitions PATH`
reads other local files instead of the default snapshots. No network is involved.

## Regeneration and tests

```sh
bun run import:data     # rewrites catalog.json, data/derived/ (incl. wiki-source/), import-report.json
bun run test:data       # importer/renderer unit tests
bun run build
bun run test:links
git diff --stat         # derived output should change only where the sources changed
```

CI (`.github/workflows/lsl-sync.yml`, on pull requests touching `data/`, `scripts/`
or `src/data/`, and on manual dispatch) installs `scripts/requirements.txt` and runs
the unit tests. It then reruns the importer and fails if `src/data/catalog.json`,
`src/data/wiki-html`, `data/derived` or `data/reports/import-report.json`
differ from what is committed, and runs `generate-mdx.py --check`, which fails if a public API has
no page or a page has no public API. The hand-edited MDX is never regenerated in CI. The workflow makes
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
  energy, sleep, func-id, flags, etc.), `wiki` (a reference to the matched archive page: `id`,
  `slug`, `title`, `source`, `sharedWith`; or null; `source` is the provenance of this API's prose) and, on modern entries, `replaces`
  (deprecated names whose `deprecated.use` points here in the same context).
- `constants`: the same fields plus `type`, `value` and `groups`.
- `categories`: `id`, `label`, and lists of `functions`, `events`, `constants`.
- `deprecated`: deprecated entries with a same-context replacement (`name`, `kind`, `use`).
- `wiki`: archive pages with `id`, `slug`, `title`, `namespace`, `headings` (the rendered HTML
  is in `src/data/wiki-html/<slug>.html`; the raw wikitext is in `data/derived/wiki-source/<slug>.txt`),
  and `source`: `title` and `url` of the live article the content comes from (for a wrapper page
  that only redirects to or transcludes another article, that article, with the anchor), its
  `revisionId`, `timestamp` and `contributor`, `historyUrl`, `sources` (that article plus every
  page and template the renderer transcluded, each with `title`, `revisionId`, `timestamp`),
  `updated` (the newest `sources` timestamp) and, for wrappers, `redirectFrom`.
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

It expands transclusions of **local** pages only: `{{:Page}}` includes and the
`LSL Constants …` / `LSL Constant/…` templates, read from the export (following redirects;
`<noinclude>`, `<includeonly>` and `<onlyinclude>` honoured, `{{{n|default}}}`
parameters substituted, headings demoted one level). The `#var` values set by
`{{LSL Const}}` rows, `{{#if:}}`/`{{#ifeq:}}` with plain-text operands, and a few simple
formatting templates (`LSL PL`, `LSL Hex`, `GetSet`, `Interval`, `Unicode`, `w`) are
resolved. On function pages the wiki's `spec` and `constants` fields form the
"Specification" section, as the wiki template places them together.

It does not handle other parser functions, conditional or variable logic in general
templates, images, or arbitrary HTML. Unknown templates are
shown as escaped invocations that link to their archived template page, so no content
is invented. Injected helper templates appear under "Shared wiki helpers" with their
original source and a note that their conditionals were not evaluated. Wiki HTML,
scripts and iframes never run. When the rendering is incomplete, the full original
wikitext is kept in `data/derived/wiki-source/<slug>.txt`, and readers are linked to the live article.

## Updating the snapshots

1. Get a new wiki export **by hand** (for example, a user-initiated Special:Export
   download in a browser). Never script it. Do the same for a new `lsl-definitions`
   checkout.
2. Try it first without replacing anything:
   `python scripts/import-datasets.py --wiki /path/new.xml --definitions /path/lsl_definitions.yaml`
3. Review the diff of `src/data/catalog.json` and `data/reports/import-report.json`,
   then run `bun run test:data`, `bun run build` and `bun run test:links`.
4. To accept it, copy the files over `data/sources/wiki-English.xml` and
   `data/sources/lsl_definitions.yaml`, update `data/sources/README.md` (date, page
   count, provenance), and run `bun run import:data` with no arguments so the default
   run reproduces the committed output. Keep translations out of the English export.

## License and attribution

- **Site code:** MIT, see `LICENSE`.
- **LSL definitions** (`data/sources/lsl_definitions.yaml`): MIT, see
  `data/sources/definitions-LICENSE`.
- **Wiki content** (`data/sources/wiki-English.xml`, `data/derived/wiki-source/`, and the
  rendered wiki prose on API and archive pages): written by Second Life Wiki contributors
  under **Creative Commons Attribution-ShareAlike 3.0**
  (https://creativecommons.org/licenses/by-sa/3.0/). It is not covered by the MIT code
  license. Each page names every wiki page and template its content was built from, with the
  imported revision ID and date of each (the headline date is the newest), and links to the live
  article and its full history. The contributor shown
  is only the latest editor; the history link gives the full attribution chain.
  Derivative reuse must keep this attribution and the CC BY-SA terms.

Dependency audit status: see `data/reports/dependency-audit.md` (11 moderate advisories,
all from one build-time transitive dependency with no compatible upstream fix yet).
