# Landing page prototype F (LSL Portal style)

URL: http://localhost:4321/prototypes/landing/ (source `src/pages/prototypes/landing/index.astro`).
Status: exploration. No banner, noindex, out of search and sidebar (see
[features-index.md](features-index.md)).

Modelled on the whole LSL Portal page (`data/derived/wiki-source/lsl-portal-079327e8.txt`), in the
site's own Starlight/slua.dev styles. It uses the `splash` template (no sidebar, max 82 rem wide)
for a wide, dense layout. There are three columns at 72 rem and up, two between 50 and 72 rem
(features spanning two rows), and one at 375 px. Checked in light and dark at 1280 and 375 px
with no horizontal scroll (`img/landing-*.png`).

## Layout

1. **Intro**: one sentence on what LSL and lsl.dev are, then **"Want to learn LSL?"** linking to
   `/guides/`.
2. **Language reference**: Constants (count, *By group*), Events, Flow control with the keywords
   `if else for while do-while jump return state`, Functions with **A–L / L–T / T–Z**
   (`/functions/#from-a|l|t`, anchors added to the catalog), Operators, States (`state`,
   `default`), Types with every type from the catalog, Variables, Errors.
3. **Features by category**: E's topic tree in compact form (two columns, no secondary links), plus
   "Also on lsl.dev". The heading links to the full E page.
4. **Developer resources**, in three ruled groups: learning (Learn LSL, Examples library, Style
   guide, Efficiency, Memory, Benchmarking), our hubs (Reference overview, Categories, Features
   overview, User-defined functions, Protocols & APIs), and about/external (About these docs,
   SLua.dev, create.secondlife.com, the live LSL Portal).
5. **Unofficial notice and source attribution**, above the site footer (which repeats the notice).

Dropped from the portal: the wiki-admin box (Editing Primer, Guidelines, To-Do, Translation
Project), Mentors/Teachers/Help, News and Bugs transclusions, Snapshot Mirrors and the historical
wikis. The live portal remains as one external link. Nothing links into `/wiki/`.

## Gaps marked on the page

Operators, Variables, Errors (Language reference); Examples library, Style guide, Efficiency,
Memory, Benchmarking, User-defined functions, Protocols & APIs (Developer resources). Also left
out entirely: Alternate editors, Hacks, Test harness, Categorized library, Function wish-list.
All are wiki articles with no curated lsl.dev page yet.

## Rationale (Laws of UX)

- **Jakob's Law:** the column structure matches the wiki portal that LSL scripters have used for
  years, so they know where to look.
- **Law of Common Region:** three light bordered columns, one per audience question (what is the
  language, where is topic X, what helps me build). Columns, not nested boxes.
- **Law of Proximity:** sub-items (keywords, types, A–L ranges) sit in tight inline rows directly
  under their parent.
- **Hick / Chunking:** 9 language entries, about 13 topic nodes and 3 resource groups. Each column
  can be scanned on its own.
- **Similarity / Von Restorff:** links are blue and bold, gaps grey with a dashed tag, so missing
  content is visible without breaking the layout. External links carry an arrow.
- **Goal-Gradient:** every keyword, type and function range is one click from the landing page.
- **Doherty:** static, no client JS.

Trade-offs: about 150 links; gap tags advertise missing content (honest, but it shows); the
compact tree drops E's secondary links.

## Recommendation

Use F as the basis for a reference/portal landing page, either replacing `/reference/` or as a
new hub linked from the home page. First write the three language gap pages (Operators,
Variables, Errors), so the most prominent column has no holes.
