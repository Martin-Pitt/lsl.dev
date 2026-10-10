# Test evidence and known limitations

Collected 2026-10-10 on branch `feature/modernize-local-datasets`, Windows 11, Node
v26.7.0, Python 3.14.7. Nothing was committed, pushed or deployed. No request was made to
the Second Life Wiki. The only network use was npm registry metadata (`npm view`,
`npm audit`, `npm install`).

Another agent was editing `src/` and `scripts/lib/` and running builds at the same time.
The results below are from the moment they were taken.

## Working tree (`git status` / `git diff --stat`)

- `git diff --stat` (tracked files): 1,610 files changed, 3,524 insertions, 25,040
  deletions. Most of this is deleting the old per-API MDX stubs (1,578 `D` entries:
  `src/content/docs/{constants,events,functions}/*.mdx`, old components, and
  `scripts/autogenerate-*.js`, which moved to `scripts/legacy/`).
- 32 modified tracked files: workflows, `.gitignore`, `astro.config.mjs`,
  `package.json`/`package-lock.json`, `README.md`, `favicon.svg`, `content.config.ts`,
  types/controls MDX and templates, `custom.css`, `tsconfig.json`.
- 17 untracked paths: `HANDOFF.md`, `handoff/`, `data/` (sources and reports),
  `public/wiki-source/`, `scripts/{import-datasets.py,check-built-links.py,requirements.txt,lib/,legacy/}`,
  `src/{components/reference,components/site,data,legacy,lib,pages}/`, and
  `src/content/docs/controls/{default,print}.mdx`.
- Root clutter fixed: `audit-local.json` (stale npm audit from before the Astro 7
  upgrade) moved to `data/reports/npm-audit-pre-astro7.json`. `check.log` stays local
  and is now ignored through `*.log` in `.gitignore`. Neither file had been tracked.

## Python tests

| Command | Result |
|---|---|
| `python -m unittest discover -s scripts -p 'test_*.py'` (old CI and `test:data` command) | **Ran 0 tests: NO TESTS RAN** |
| `python -m unittest discover -s scripts/lib -p 'test_*.py'` (fixed command) | **Ran 15 tests: OK** |
| `npm run test:data` (after the fix) | Ran 15 tests: OK |

Cause: the only test module is `scripts/lib/test_import.py`, and `scripts/lib` has no
`__init__.py`, so discovery from `scripts/` never reaches it. Fixed in
`.github/workflows/lsl-sync.yml` and in the `test:data` script in `package.json`.
`data/sources/README.md` already listed the correct command.

The 15 tests are `DatasetTests` (llAbs caveat label, verbatim llSay example, canonical
signatures and categories, counts and exclusions, injected helpers and footnotes,
shared primitive article caveats and table, source coverage and original revision,
unique archive routes) and `RenderTests` (verbatim and inert code, local links and
escaped labels, nested template fields, precise category label, visible unknown
template arguments, inspectable unknown templates, untrusted HTML and protocols).

## npm

- `npm ls --depth=0` exits 0 after the change: astro 7.3.8, @astrojs/starlight 0.42.6,
  @astrojs/markdown-remark 7.3.2, @expressive-code/plugin-collapsible-sections 0.44.2,
  @astrojs/check 0.9.10, typescript 5.9.3, yaml 2.9.1. Full `npm ls` also exits 0, so the
  lockfile is consistent with `package.json`.
- Changed `@expressive-code/plugin-collapsible-sections` from `^0.41.3` to `^0.44.2` and
  ran `npm install`. This removes the duplicate `@expressive-code/core@0.41.7`.
- `npm audit`: 11 moderate, 0 high, 0 critical, all from GHSA-rj75-hqrm-r3gf
  (`postcss-selector-parser@6.1.4` via `postcss-nested@6.2.0` via `@expressive-code/core`).
  No compatible upstream fix exists. See `data/reports/dependency-audit.md`.
- Engines: `astro@7.3.8` requires Node >= 22.12.0. CI deploy uses Node 22.

## Build, type check, links (existing artifacts, not re-run by me)

- `check.log` (earlier, after the Astro 7 upgrade): `astro check` reported 28 files, 0
  errors, 0 warnings, 0 hints.
- `data/reports/built-links.json` (from the latest `npm run test:links` against `dist/`,
  whose `dist/index.html` is dated 07:07): 3,944 pages, 0 missing local routes, 0 remote
  assets.
- I did not re-run `npm run build`, `npm run check` or `npm run import:data`, to avoid
  clashing with the other agent's builds and its edits under `src/`. Re-run all three,
  plus `test:links`, after the final src changes. Also confirm that
  `git diff --exit-code -- src/data/catalog.json public/wiki-source data/reports` is
  clean after `import:data`, because CI enforces it. Note that `data/reports` now also
  contains `dependency-audit.md` and `npm-audit*.json`. The importer does not write
  those files, so they don't affect the diff check, but they must be committed alongside.

## Known limitations

- The wiki renderer is partial (see README, "Partial wiki renderer: limits"). Parser
  functions, conditional or variable template logic, dynamic transclusion, nested
  tables and images are not reproduced. `import-report.json` lists 1,186 unexpanded
  template entries and 2,296 referenced titles with no local route. Original wikitext
  is always available at `rawPath`.
- `apiWithoutWiki` in `import-report.json` lists **9 functions** with no matched wiki page
  (llFindNotecardTextCount, llGetObjectLinkKey, llLinkAdjustSoundVolume,
  llLinksetDataDeleteProtected/ReadProtected/WriteProtected, llLinkSetSoundQueueing,
  llLinkSetSoundRadius, llLinkStopSound), plus many events and constants. HANDOFF item 4
  says all documented public functions map to the wiki. This needs checking: the
  key may count something narrower than "has a page", such as direct-title matches only.
- The link checker only checks that local destinations exist. It does not check
  anchors or that the link points to the right content (HANDOFF item F). External links
  are deliberately never fetched.
- The 11 moderate npm advisories remain (build-time only, see the audit report).
- The English filter for the wiki snapshot was heuristic (57 translations removed).
- The CI drift check depends on byte-identical importer output across platforms. I
  have not verified this on Linux CI, only locally on Windows.
- Browser/visual QA (HANDOFF item A) and renderer fidelity review (item G) are not
  covered here.
