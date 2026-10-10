# Local reference sources

These are checked-in source snapshots for the reproducible, offline catalog importer.
No network requests are made by the importer, and a website build uses the checked-in
catalog without requiring Python or access to the original Windows download paths.

- `wiki-English.xml`: the user's merged English-focused export, copied from
  `Second-Life-Wiki-combined-English-20261010.xml` on 10 October 2026. It contains
  2,266 pages from the user's 2025/2026 exports. These are **original wiki revisions**,
  not the later XML with rewritten definition fields. Older revisions remain where
  a later export did not return a page. English filtering was heuristic.
- `wiki-supplement-*.xml`: supplementary MediaWiki exports, kept byte-for-byte as
  the user downloaded them so their provenance stays separate from `wiki-English.xml`.
  The importer reads every matching file (sorted by name) after `wiki-English.xml`
  and merges pages by title with the same rule as the original merge: the newest
  revision timestamp wins; on a tie the earlier source is kept. Their SHA-256 values
  are recorded in catalog metadata under `sources.supplements`.
  - `wiki-supplement-limits.xml`: the user's export of the "Limits" page and the
    templates it uses, copied from `Second+Life+Wiki-20261010122419.xml` on
    10 October 2026 (SHA-256
    `428fcdfaf03bd59c26a85d169e7cbd81de17d2f8bc5e3cb7d764ba3e77ebb359`). Limits is
    revision 1218965 of 2026-07-26; `Template:References` (revision 1178626) is also
    new. The other 19 templates have the same revision IDs as `wiki-English.xml`.
    Hand-edited reference page: `src/content/docs/reference/limits.mdx`.
  - `wiki-supplement-viewer-uri.xml`: the user's export of the "Viewer URI Name Space"
    page and the templates it uses, copied from `Second+Life+Wiki-20261010122522.xml` on
    10 October 2026 (SHA-256
    `c968fbd6294dfecea789f8a22a6b42c03634298739fe65ebbabf5686fa9bb356`). The page is
    revision 1219168 of 2026-10-06; `Template:ProtocolNav` and `Template:Underline` are
    also new. The other 6 templates have the same revision IDs as `wiki-English.xml`.
    Hand-edited feature: `src/content/docs/features/viewer-uris.mdx` and its sub-page.
- `lsl_definitions.yaml`: snapshot of the user's local `lsl-definitions` checkout.
  Authoritative for public LSL signatures, argument names/descriptions, return types,
  constant values, enum relationships, and topic categories. Its SHA-256 is included
  in catalog metadata. The local snapshot does not prove server availability.
- `definitions-LICENSE`: the definitions' MIT license, retained verbatim.
- `categories.en.json`: human-readable category labels from the user's `slua.dev`.

Wiki prose is attributed to Second Life Wiki contributors under CC BY-SA 3.0.
Each page includes its original revision ID, timestamp, latest revision contributor,
source/revision URL, and history URL. The latest contributor is **not** a list of
all authors; the history link supplies the original attribution chain. Do not
relicense wiki content as part of the site's code license. Examples can carry their
own notices, which remain in the archived wikitext.

## Regeneration

From the repository root:

```sh
python -m pip install -r scripts/requirements.txt
python scripts/import-datasets.py
python -m unittest discover -s scripts/lib -p 'test_*.py'
```

Optional `--wiki PATH --definitions PATH` inputs allow local refreshes. Copy accepted
new snapshots into this directory so future default runs use the same source.
The importer deterministically writes `src/data/catalog.json`,
`data/derived/wiki-source/*.txt` (raw wikitext for the importer's tests, `generate-mdx.py` and
the CI determinism check; not deployed), and `data/reports/import-report.json`.

## Content policy and rendering limits

The public API reference excludes entries with LSL `private` or `deprecated` flags.
SLua-only deprecation/removal flags do not exclude LSL APIs. The archive preserves
all imported pages, including historical/deprecated pages, templates and categories.
Old wiki categories never determine the public API's topic categories.

Canonical definition records are retained in full in each API entry. Wiki narrative,
caveats, notes and examples come from the original XML: no AI summaries or rewrites.
The renderer converts selected syntax, headings, basic lists and tables, internal
links and code blocks. Parameter inline templates are expanded; other unsupported
templates are clearly linked to their archived template page or external source.
It is not a MediaWiki runtime: parser functions, dynamic transclusion, nested table
layout, images, arbitrary HTML and some formatting are not reproduced. No scripts,
iframes, remote images or unsafe HTML from wiki pages execute. Full original
wikitext is always retained in `data/derived/wiki-source/<slug>.txt`; use it for material
that the partial rendering cannot display. Readers are linked to the live wiki article instead. Missing link targets remain ordinary external
links and are never fetched by the importer.

The report inventories missing API wiki pages, unsupported templates and targets
without local routes. A missing title is not evidence that the live page exists or
does not exist. No claim of exhaustive live wiki coverage is made.

### Shared function pages and helper material

`LSL Function/Headless` articles retain their outer prose, function variants,
footnotes, caveats, examples and history. API pages explicitly transcluding a shared
article include its sections with a local attribution link. Static `set`/`get`
branches of the primitive-parameter table are selected from the original local
template without executing parser functions. Unresolved variable and conditional
cells remain visibly marked source syntax.

Injected helper templates can carry conditional caveats, issues or parameter notes.
The importer lists these under **Shared wiki helpers**, with local attribution links
and expandable original helper source. It does not silently discard those helpers
or claim that their mutable MediaWiki variable logic has been fully evaluated.
