# Features index prototypes

Status: **exploration, temporary.** The live Features Overview (`/features/`,
`src/pages/features/index.astro`) is the baseline and is unchanged. Four alternatives live under
`/prototypes/features/`. Each is marked with a dashed "Prototype" banner, is absent from the sidebar
(the sidebar in `astro.config.mjs` is an explicit list), is left out of search (`pagefind: false`
plus `data-pagefind-ignore`), carries `noindex`, and links back to the baseline and to the other variants.

| Variant | URL | Source |
| --- | --- | --- |
| Baseline | http://localhost:4321/features/ | `src/pages/features/index.astro` |
| A: By goal | http://localhost:4321/prototypes/features/a/ | `src/pages/prototypes/features/a.astro` |
| B: Task-first | http://localhost:4321/prototypes/features/b/ | `src/pages/prototypes/features/b.astro` |
| C: Dashboard | http://localhost:4321/prototypes/features/c/ | `src/pages/prototypes/features/c.astro` |
| D: Search + groups | http://localhost:4321/prototypes/features/d/ | `src/pages/prototypes/features/d.astro` |

Shared pieces: `src/components/prototypes/ProtoShell.astro` (banner, variant switcher, search
exclusion) and `src/lib/prototypes/features-index.ts`. That module holds the editorial data: goal
groups, tasks, usage order, one-line purposes and icons. Titles, descriptions and key APIs come
from the feature MDX through `src/lib/features.ts`. The build fails if a grouping leaves out a
feature or names one that does not exist, so a new feature page cannot go missing silently.
"Key APIs" are the first names a feature page links (its `<ApiLinks>` come first), so authors
already control them.

Screenshots are in `docs/prototypes/img/`, captured from the dev server with headless Chrome over
CDP using true device emulation: `<variant>-desktop-light.png` (1280 px, light) and
`<variant>-375-dark.png` (375 px, dark). The capture script also checked all 5 pages at 1280 and
375 px in both themes. None scrolls horizontally at 375 px, and each has one `h1`, a `main`
landmark and `h2` per section. The filters in C and D announce their match count through a
`role="status"` region.

## Audit of the baseline

The baseline is an intro paragraph and a `CardGrid` of 23 `LinkCard`s (title + frontmatter
description) in slug (A–Z) order.

| Law | Finding |
| --- | --- |
| **Hick's Law** | 23 options of equal weight with no grouping. A reader must scan all of them to choose, and decision time grows with the count. |
| **Miller's Law / Chunking** | One undivided run of 23 is well beyond the 7±2 items that are easy to hold in mind. Alphabetical order is not a meaningful chunk. |
| **Law of Proximity** | Every card sits the same distance from its neighbours, so related areas (Movement, Physics, Pathfinding; Communications, Dialog) look no closer to each other than unrelated ones. |
| **Law of Common Region** | Every card is its own region, and no region contains a set of features. The page expresses no structure above the item. |
| **Law of Similarity** | All cards look the same: same size, same type, no icon or color. Nothing separates kinds of feature, and nothing marks the foundational ones. |
| **Prägnanz** | The grid itself is simple and clean, a plus. But descriptions are 1–2 lines of uneven length, so card heights vary and the rhythm breaks. |
| **Serial Position** | First and last get the most attention, and here they are Animesh and Textures. Animesh is niche. The most-used areas (Events, Communications, Input) sit in the unremarkable middle. |
| **Jakob's Law** | Portals readers know (MDN's "Web APIs", Wikipedia portals, the slua.dev and Roblox docs) group by topic and offer "Getting started" or "How do I…". A flat A–Z of cards is closer to a tag cloud. |
| **Fitts's Law** | Whole cards are large, easy targets, which works well. But the page has no direct targets for APIs, so reaching a function always takes a second page load. |
| **Aesthetic-Usability** | It looks tidy and native to Starlight, which buys goodwill. That polish also hides the fact that the page does little work for the reader. |
| **Doherty Threshold** | Static HTML loads instantly, so this law is satisfied. Any variant should stay static, with at most a tiny client-side filter. |
| **Von Restorff** | Nothing stands out, so a newcomer gets no "start here" signal. |
| **Tesler's Law** | The complexity of mapping "what I want to do" to a feature is pushed onto the reader. They must already know that touch handling lives under *Input* and rezzing under *Linksets*. |
| **Goal-Gradient** | The page gives no sense of a path or progress, and the API is never closer than two clicks. |

Concrete problems to solve: (1) choice overload from 23 flat items; (2) no meaningful grouping;
(3) task-to-feature mapping left to the reader; (4) no starting point for newcomers; (5) no shortcut
to the APIs people actually came for; (6) the intro paragraph spends the most valuable spot on
meta-text.

## Variant A: by goal

Five common-region cards: *Script logic*, *Build the world*, *Interact with avatars*, *Talk to
scripts & people*, *Look & sound*. Each holds 2–6 features, and each feature shows a short purpose
line ("Play, loop and trigger sounds") in place of the longer frontmatter description. Jump pills
with counts sit at the top.

- **Why:** Hick and Miller (5 first-level choices, at most 6 inside each); Proximity and Common
  Region (related features share a card); Prägnanz (short, even purpose lines); Jakob (a topic
  portal like MDN).
- **Trade-offs:** some features belong in two groups, and the page has to pick one: is Combat about
  avatars or the world, is Data Storage logic or data? Group sizes are uneven (2 to 6). There are
  still no direct API links. The cheapest change to adopt: no JS, same data.
- Screenshots: `img/a-desktop-light.png`, `img/a-375-dark.png`.

## Variant B: task-first

An "I want to…" list of 22 everyday tasks ("react when someone touches my object", "store data
that survives a reset", "accept payment for a vendor"). Each row links the 1–3 APIs that do the job
and the feature to read more. A compact multi-column A–Z of every feature follows.

- **Why:** Tesler (the site carries the task-to-feature mapping); Jakob ("How do I…" sections are
  a familiar docs pattern); Goal-Gradient (one click to the API that does the job); Fitts (chips
  are at least 2 rem tall). The A–Z keeps scanning by name fast.
- **Trade-offs:** an editorial list goes stale and can never be complete, so readers whose task is
  not listed fall back to the A–Z. Several tasks map to the same feature, so the page reads less as
  an overview of all 23 areas. Rows are dense at 375 px. Best as a *section*, not the whole page.
- Screenshots: `img/b-desktop-light.png`, `img/b-375-dark.png`.

## Variant C: visual dashboard

Icon tiles (3 rem icon, title, purpose line, 4 key-API chips). A "Most used" section of 6 comes
first and "More features" follows, in an editorial usage order. A filter box matches titles,
descriptions *and API names*: typing `llDialog` leaves Communications and Dialog.

- **Why:** Serial Position (the commonest areas lead); Von Restorff and Similarity (icons tell
  tiles apart); Fitts (large tile heads, min-height chips); Doherty (instant client-side filter,
  live status for screen readers); Goal-Gradient (APIs one click away).
- **Trade-offs:** the busiest variant. 23 tiles with 4 chips each make about 90 more links, which
  is a lot to scan and to tab through. Starlight's built-in icons only roughly fit LSL concepts and
  would need a custom set. The usage order is a guess until analytics exist. The filter overlaps
  with the site search.
- Screenshots: `img/c-desktop-light.png`, `img/c-375-dark.png`.

## Variant D: search + groups (hybrid)

A highlighted "New to LSL? Start here" path (Events → Input → Communications), then a filter
with a line of popular tasks, then A's goal groups as compact cards. Each row expands with a
native `<details>` to show 5 key APIs.

- **Why:** Von Restorff and Goal-Gradient (one visually distinct, numbered starting path);
  Hick and Chunking (5 groups); Common Region; Tesler done as progressive disclosure, with APIs
  available but hidden until asked for (keeps the Aesthetic-Usability calm of A); Jakob
  (filter + topic portal + "popular" links, as on MDN and Wikipedia); Doherty (static page,
  small filter).
- **Trade-offs:** more moving parts than A: three zones above the groups. The "Key APIs" toggles
  add tab stops, though they are clearly labelled for screen readers ("Sound: Key APIs"). The
  start path and popular tasks are editorial choices someone must maintain.
- Screenshots: `img/d-desktop-light.png`, `img/d-375-dark.png`.

## Recommendation

Adopt **D**, built in two steps:

1. Ship **A's grouping** first as the new `/features/`. It fixes the biggest problems (Hick,
   Chunking, Proximity, Common Region) with no JS and little to maintain. The 5 groups could
   also order the sidebar's Features section, so the two navigations agree (Jakob's Law within the
   site).
2. Add D's **Start here** strip and the **filter**, then the expandable key APIs. Use B's task list
   as a trimmed "Popular tasks" line, not a whole page. Keep C's icons only if a custom LSL icon
   set appears; the generic ones add noise rather than meaning.

Open questions before adopting: settle the group names and borderline placements (Combat, Data
Storage, Experience, Land). Decide whether the purpose lines should become a frontmatter field
(e.g. `summary:`) on each feature page instead of living in the prototype module. Separately, the
breadcrumb root renders as lowercase "features" on these routes. That comes from
`src/lib/page-nav.ts`, which the prototypes did not touch.

## Removing the prototypes

Delete `src/pages/prototypes/`, `src/components/prototypes/`, `src/lib/prototypes/` and
`docs/prototypes/`. Nothing else references them.
