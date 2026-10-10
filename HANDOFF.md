# LSL.dev modernization — handoff

## User instructions (critical)
- Modernize D:/Second Life/lsl.dev using D:/Second Life/slua.dev as foundation/design reference and integrate local wiki + LSL definitions.
- User explicitly authorized a large multi-agent workflow and specifically wants Claude/OpenCode (GLM 5.3 workhorses) doing implementation; Codex should coordinate/review as high-level planner.
- Codex usage was down to 20% when this handoff was requested. Conserve it; delegate implementation.
- NEVER send HTTP requests, web searches, crawls, or asset requests to Second Life Wiki. Earlier unsolicited crawling triggered 403s and user believes it contributed to a bot ban. All wiki work MUST use local files only. External source links in rendered pages are okay; no auto-fetching remote wiki images/templates.
- Preserve precise technical function prose, caveats, constraints, examples. Do not paraphrase merely to modernize. YAML controls signatures, parameter names/descriptions, metadata, categories. Nondeprecated/public only in main API reference. Archive can keep historical pages.
- Old topic/category pages should NOT define the new information architecture. Use concise task/link-first portals modeled on user's high-quality Combat2 wiki category; details belong on reference pages.
- Keep translations out of active corpus. Source provenance and CC BY-SA wiki attribution required.
- No deploy, publish, push, or commits requested. Work is local/uncommitted.

## Working branch and repos
- Target D:/Second Life/lsl.dev, branch feature/modernize-local-datasets (started from clean main).
- Reference D:/Second Life/slua.dev (read only, unchanged).
- Canonical definitions D:/Second Life/lsl-definitions/lsl_definitions.yaml (read only). Repo AGENTS permits read-only analysis. Its main HEAD was 23e2d11 dated 2026-10-09.
- No target AGENTS.md found in repo or D:/Second Life or D:/.

## Dataset provenance
- Original exports in C:/Users/nexii/Downloads/Second+Life+Wiki-*.xml were merged locally by newest timestamp, verified.
- English base: C:/Users/nexii/Downloads/Second-Life-Wiki-combined-English-20261010.xml: 2266 pages.
- Full unfiltered merged XML has 2323 pages. English filtering removed 57 clearly identified translations, preserving /ID and /id technical pages.
- Earlier derived XML with rewritten definition fields exists in Downloads, but website importer deliberately uses ORIGINAL English wiki XML so prose and author/revision attribution stay accurate; it overlays YAML structured facts itself.
- Source snapshots now CHECKED INTO WORKING TREE under data/sources, so builds/import don't depend on Downloads paths. License/readme included by dataset agent.
- Source snapshots canonical YAML + wiki-English.xml. No need for live wiki.

## Completed implementation
1. Offline importer scripts/import-datasets.py, scripts/lib/* and scripts/requirements.txt (PyYAML==6.0.3). Generated src/data/catalog.json and data/reports/*.
2. Catalog: 501 public functions,42 events,1042 constants,62 categories,2266 wiki archive pages,7 types,10 controls. All raw wiki text under data/derived/wiki-source/*.txt.
3. Safe partial wiki renderer: local links, code, lists, known inline helpers, structural sections, Headless shared function pages, primitive set/get tables. Technical prose retained; unknown templates retain escaped invocation rather than invented content. Inject helpers provide original local helper source with unevaluated-conditional notice. It is NOT full MediaWiki expansion.
4. All500 documented public functions map to wiki; llFindNotecardTextCount exists only in YAML and must not claim deployed availability. Wiki provenance contains original title/revision/date/contributor/history link.
5. Modern teal/ink Starlight shell, responsive custom header/homepage/native navigation/theme/search. Site site=https://lsl.dev. Compact sidebar indexes, no thousand-entry sidebar.
6. Data-driven routes under src/pages: /reference/, /functions/, /events/, /constants/, /categories/ and their detail routes; /wiki/ and /wiki/[slug]/; /features/ compatibility landing.
7. API details use YAML signature/params/categories, permissions, delay/energy, wiki content and attribution. Wiki archive has original-source download, revision attribution, and current API links.
8. Category data src/data/topic-guides.json: 62 concise summaries +195 verified canonical function task links. Descriptions copied from YAML. Category route uses summary and tasks[].label/function/description.
9. Existing API MDX directories and obsolete components/templates moved to src/legacy (preserved, excluded from Astro content/TS). Existing guides/types/controls modernized; all7 types and10 controls current, default and print added. Their prose uses exact definitions.
10. Dependency foundation upgraded to Astro ^7.3.8 + Starlight ^0.42.6 + markdown-remark ^7.3.0 after auditing old Astro5 vulnerabilities; install completed. Removed old Obsidian/sidebar plugins and unused dependencies (sharp direct, breadcrumbs, dayjs, gray-matter, showcases, glob). Remaining npm audit reported11 moderate vulnerabilities; no high/critical after upgrade. Do not blindly force-upgrade incompatible dependencies.
11. package scripts import:data/test:data/check/test:links added. Old generators moved scripts/legacy. Old workflow fetching definitions+writing stubs replaced with offline dataset validation, no push. Deployment workflow still only existing main/workflow_dispatch; nothing triggered.
12. scripts/check-built-links.py audits all local href destinations and forbids remote image/script/iframe assets without network.

## Validation already completed
- Dataset agent ran15 tests passing; includes safety, llAbs caveat text, code preservation, Headless/shared pages/table rendering. Regeneration deterministic by SHA256 catalog/report/raw sources.
- Initial Astro5 build:3942 pages, Pagefind index successful.
- Initial generated link check:3942 pages,0 missing local destinations,0 remote assets.
- AFTER Astro7 upgrade, npm run check:0 errors,0 warnings,0 hints (check.log).
- Latest importer improvements and type/control additions need FINAL Astro7 production build, test:data, test:links, then browser acceptance.
- T3 native preview tab tab_7 open at http://127.0.0.1:4321/. Home loads, semantic snapshot good. Earlier tabs timed out during dependency installation; do not treat that as site issue.
- Dev server currently runs in Codex exec session97114, port4321. Do not kill unrelated node processes. Previous build/dev sessions finished/stopped.
- Browser tools: prefer t3-code preview_status/open/navigate/snapshot/evaluate/resize/etc. No external URLs; only localhost. Existing browser console Electron preload startup errors are host preview noise.

## Remaining work (delegate to Claude/OpenCode)
A. Final functional QA and fixes: build Astro7; filtered catalogs/search; mobile header/sidebar; category task links; API params, permissions, constant groups, wiki helper fallback readable and not swamping page; source attribution; pagefind query llSetPrimitiveParamsFast; accessibility/overflow. Keep technical copy exact.
B. README rewrite with architecture, setup (Node supported version/Python requirements), importer commands, offline policy, source/derived distinction, regeneration and tests, partial renderer limits, schema, license attribution, updating snapshots. Existing README still old WIP roadmap.
C. Repo hygiene: audit-local.json/check.log should not accidentally be committed as root clutter (move meaningful reports to data/reports, ignore logs); legacy generators are archival and no longer supported. Check package-lock matches package. Check CI command test discovery actually executes15 tests (not zero).
D. Rebuild and ensure link checker passes new output. Verify no external assets to wiki; don't crawl to validate links.
E. Decide moderate audit findings disposition based actual dependency chain, document any left without unsafe forced upgrades.
F. Consider preserving API anchors when wiki archive links reference anchors; full semantic link integrity beyond existence may need checks.
G. Need review renderer fidelity (e.g. llDialog inject helper caveats, llSetPrimitiveParams rules tables). Source always available; do not claim 100% MediaWiki rendering.
H. Git diff review; document test evidence and limitations. Keep local branch uncommitted unless user asks.

## CLI delegation availability
- opencode.exe available C:/ProgramData/chocolatey/bin/opencode.exe
- claude.exe available C:/Users/nexii/.local/bin/claude.exe
- opencode models lists openrouter/z-ai/glm-5.3 (also other providers). Auth has not yet been validated; do not print credentials/config files.
- opencode run --model provider/model --format json --file <brief> --title <title> <message> supports noninteractive sessions. Use separate briefs/scopes. User authorized workhorse use.
- claude --print supports --allowedTools, --permission-mode; inspect help instead of assuming flags.
- Built-in Codex subagents datasets and site_shell completed; reference subagent hit usage limit. Do not rely on spawning more Codex agents for implementation.

## Useful files
- src/components/reference/{ApiDetail,CatalogList,WikiContent,WikiAttribution}.astro
- src/lib/catalog.ts
- src/components/site/{Header,Hero,Home}.astro; src/styles/custom.css
- src/data/topic-guides.json
- data/sources/README.md, data/reports/
- scripts/import-datasets.py, scripts/lib/, scripts/test_*.py
- HANDOFF.md (this file) and handoff/git-status.txt
