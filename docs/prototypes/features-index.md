# Features index: decision and prototypes

Status: **decided.** The live Features Overview (`/features/`) is now the C dashboard without
its filter box, with the tightened B task list below it. The other variants are kept under
`/prototypes/` for reference and for the next round (E and F). The prototype pages carry no
banner, because they are opened by URL. They are absent from the sidebar (the sidebar in
`astro.config.mjs` is an explicit list), left out of search (`pagefind: false` plus
`data-pagefind-ignore`), and carry `noindex, nofollow`. The landing-page prototype F is described
in [landing.md](landing.md).

| Page | URL | Source |
| --- | --- | --- |
| **Features Overview (live)**: C cards + B tasks | http://localhost:4321/features/ | `src/pages/features/index.astro` |
| Previous baseline (A–Z LinkCards) | http://localhost:4321/prototypes/features/baseline/ | `src/pages/prototypes/features/baseline.astro` |
| B: task-first, standalone | http://localhost:4321/prototypes/features/b/ | `src/pages/prototypes/features/b.astro` |
| D: start here + goal groups | http://localhost:4321/prototypes/features/d/ | `src/pages/prototypes/features/d.astro` |
| E: features by category (portal style) | http://localhost:4321/prototypes/features/e/ | `src/pages/prototypes/features/e.astro` |
| F: landing page (portal style) | http://localhost:4321/prototypes/landing/ | `src/pages/prototypes/landing/index.astro` |

Removed: **A (by goal)** and **C (dashboard with filter)**. C now lives on as the real page. The
baseline+B, C+B and D+B comparison pages were planned, then dropped once the user picked C+B.

## Building blocks

- `src/lib/features-overview.ts`: the editorial data for the live page (usage order, purpose
  lines, icons, tasks) plus the helpers `apiHref` and `keyApis`. Titles, descriptions and key
  APIs come from the feature MDX through `src/lib/features.ts`.
- `src/components/features/FeatureCards.astro`: the dashboard cards ("Most used" 6, then "More
  features").
- `src/components/features/TaskList.astro`: the "I want to…" list. It is a self-contained
  `<section>` with optional `id`/`heading` props, so it can be embedded below any layout.
- **Every feature appears on `/features/`, including future ones.** The cards come from all
  feature pages. A feature that `usageOrder` does not rank yet is appended A–Z, a missing purpose
  line falls back to the frontmatter `description`, and a missing icon falls back to a generic
  one. An unknown id in the editorial data fails the build, and so does a card list that does not
  contain every feature exactly once. (The new `inventory` page, added in parallel, already shows
  up this way.)
- Prototype-only: `src/components/prototypes/ProtoShell.astro` (no banner, noindex, search
  exclusion, optional wide `splash` template), `src/lib/prototypes/features-index.ts` (D's goal
  groups; unlisted features fall into an "Other" group), and `src/lib/prototypes/portal-topics.ts`
  with `PortalTopics.astro` and `TopicList.astro` (E and F).
- `/functions/` now has jump anchors `#from-a`, `#from-l` and `#from-t` on the first function of
  each range (ignoring the `ll` prefix), so F can offer the portal's A–L / L–T / T–Z links.

Screenshots are in `img/`: `<page>-desktop-light.png` (1280 px, light) and `<page>-375-dark.png`
(375 px, dark), for `features`, `baseline`, `b`, `d`, `e` and `landing`. They were captured from
the dev server with headless Chrome over CDP using device emulation. All six pages were checked
at 1280 and 375 px in both themes. None scrolls horizontally at 375 px, none shows a prototype
banner, and each has exactly one `h1` and a `main` landmark.

## Audit of the old baseline

The old page was an intro paragraph and a `CardGrid` of 23 `LinkCard`s in slug (A–Z) order.

| Law | Finding |
| --- | --- |
| **Hick's Law** | 23 options of equal weight, no grouping. Decision time grows with the count. |
| **Miller's Law / Chunking** | One undivided run of 23, and A–Z is not a meaningful chunk. |
| **Law of Proximity** | Every card is equidistant, so related areas look no closer than unrelated ones. |
| **Law of Common Region** | No region contains a set of features, so the page has no structure above the item. |
| **Law of Similarity** | All cards look the same, with nothing to tell kinds of feature apart. |
| **Serial Position** | Animesh (niche) comes first. The most-used areas sit in the middle. |
| **Jakob's Law** | Docs portals offer topics plus "How do I…". A flat A–Z reads like a tag cloud. |
| **Fitts's Law** | Large card targets, but no direct API targets, so every API costs a second page load. |
| **Tesler's Law** | The reader must already know that touch lives under *Input* and rezzing under *Linksets*. |
| **Goal-Gradient** | The API is never closer than two clicks. |

## Decision: C cards + B tasks (live `/features/`)

What the user liked about C: the cards, their key-API shortcuts and the information density.
Its filter box was dropped because it duplicated the sidebar search. B's task list was liked as a
*secondary* section, not as the whole page.

- **Serial Position:** the 6 most-used areas lead. The usage order is editorial until analytics
  exist.
- **Von Restorff / Similarity:** the icon tiles are easy to tell apart.
- **Goal-Gradient / Fitts:** 4 key-API links per card put the API one click away, and each card
  head is a large target.
- **Jakob / Tesler:** the "I want to…" list maps tasks to APIs, so the reader no longer has to.
- **Law of Proximity (B tightened):** each task row is now a single wrapped line, made of the task
  text, a colon, its API links and the feature pill. Before, the task sat at the left edge and its
  links at the right edge of a full-width row. Rows are shorter and sit in two columns at desktop
  width, so the page stays dense.
- **Doherty:** static HTML with no client JS. Removing the filter removed C's only script.
- **Trade-offs:** about 90 API links across 23+ cards add many tab stops. The inline task links
  are small targets (`code` size), which trades Fitts for density. The Starlight built-in icons
  only roughly fit LSL concepts, and **a custom LSL icon set would improve them**.

## Rejected: A (by goal)

Deleted. Reason recorded from the user: **the goal taxonomy and the heavy boxing don't fit the
nature of scripting in Second Life.** Most real scripts cut across goals (a vendor uses touch,
dialogs, money, inventory and chat at once), so any five-way split puts features in arguable
buckets: Combat, Data Storage, Experience, Land. Five bordered boxes also add visual weight
without helping anyone find an API. D still uses the same groups, which is a point against D.

## B: task-first (standalone)

The shared `TaskList` followed by a compact multi-column A–Z of every feature. It is kept as a
standalone page, and the same component is the secondary section on the live page.

## D: start here + goal groups

Unchanged apart from losing the banner. It inherits A's grouping, which the user rejected, so it
is kept only for reference.

## E: features by category (LSL Portal style)

Modelled on the LSL Portal's "LSL Features by category" column
(`data/derived/wiki-source/lsl-portal-079327e8.txt`). It has the same dual view: a flat **A–Z** of 36
topics next to a **topic tree** (Avatar › Animation/Attachment/Camera/Controls/Sit,
Communications › Chat/Dialog/HTTP/XML-RPC, Detection › Collision/Sensor/Touch, Inventory ›
Creator/Notecard/Owner, Primitive › Effects › Light/Particles, Face › Alpha/Color/Texture,
Region › Ground/Parcel/Security/Time, Script › Error/Keywords/Math/Types, …). A third column,
"Also on lsl.dev", lists the features that no portal topic reaches (computed, so it stays
correct).

Each topic links to the best match: a feature page (bold), a category (plain), a constant group
(`code`) or a reference page. A–Z rows add secondary links in small grey text, for example
*Alpha* → Textures & Materials, plus `AlphaMode`. Category links go through `categoryLink()`, so
a single-member category links straight to its member. Every ref is resolved at build time, and
an unknown feature, category or group fails the build. Inventory topics use
`f:inventory|c:prim_inventory`, which points at the feature page once it exists and at the
category until then.

- **Jakob's Law:** long-time scripters know this exact layout from the wiki portal.
- **Law of Proximity / Common Region:** the tree's indentation and rules carry the grouping
  without boxes, avoiding the heaviness that sank A.
- **Miller / Chunking:** about 13 top-level tree nodes, each with 2–5 children.
- **Similarity:** weight and font encode the target type (feature, category, group), and a
  legend explains it.
- **Trade-offs:** about 120 links on one page. The portal's taxonomy is old (it has Combat2 and
  XML-RPC but no Pathfinding or Animesh), and several topics map to the same page, for example
  Color, Texture and Face all go to Textures & Materials.

### Gaps (portal topics with no lsl.dev page)

Shown as plain grey text with a dashed "no page" tag.

| Topic | Note |
| --- | --- |
| Group | No group category or feature. The group APIs (`llSameGroup`, `llDetectedGroup`, `OBJECT_GROUP`) are scattered. |
| Communications › XML-RPC | Removed from SL. A deprecation note would do. |
| Functions › God Mode | God-only functions, which the catalog omits. |
| Inventory › Creator, Owner | No pages for the creator/owner APIs (`llGetCreator`, `llGetOwner`, `llGetInventoryCreator`). |
| Movement › Physics › Damping, Hover | No pages for vehicle/hover damping (`llSetHoverHeight`, `llGroundRepel`, vehicle `*_TIMESCALE` params). |
| Primitive › Effects › Light | Light lives in `PRIM_POINT_LIGHT` / `PRIM_REFLECTION_PROBE` but has no page. |
| Script › Error, Math Errors | No page about runtime errors (stack-heap collision, math errors). |
| Needs Example | Omitted on purpose: it is a wiki maintenance list, not a topic. |

Weak matches worth improving: *Ground* → `GroundTextureParam` (no terraforming topic), *Video*
→ the Parcel Media category, *World* → the Region category.

## Missing: an object INVENTORY feature

No feature page covers object (prim) inventory. A parallel task is adding one, so this list is
input for it. It would cover the following (current home in brackets, from the committed feature
pages):

| APIs | Currently in |
| --- | --- |
| `llGetInventoryName`, `llGetInventoryNumber`, `llGetInventoryType`, `llGetInventoryKey`, `llGetInventoryCreator`, `llGetInventoryDesc`, `llGetInventoryAcquireTime` | Prims |
| `llGetInventoryPermMask`, `llSetInventoryPermMask`, permission masks `MASK_*` / `PERM_*`, group `AssetPermission*` | Prims (Asset Permissions category) |
| `llGiveInventory` | Avatars, Dialog, Money, Prims |
| `llGiveInventoryList`, `llGiveAgentInventory` | Avatars (and Money) |
| `llRemoveInventory`, `llAllowInventoryDrop`, `CHANGED_ALLOWED_DROP` | Prims |
| `llRequestInventoryData` (dataserver) | Prims |
| `llRezObject`, `llRezAtRoot`, `llRezObjectWithParams`, `object_rez` | Linksets (and Combat, Data Storage, Physics, Sound for `llRezObjectWithParams`) |
| `changed` + `CHANGED_INVENTORY` | Events, Prims, Data Storage |
| Notecards: `llGetNotecardLine`, `llGetNotecardLineSync`, `llGetNumberOfNotecardLines` | Data Storage |
| `llFindNotecardTextCount`, `llFindNotecardTextSync`, `INVENTORY_NOTECARD` | **nowhere** |
| `INVENTORY_*` (`InventoryType` group) | Prims (`INVENTORY_ALL` only) |
| Script control: `llSetScriptState`, `llGetScriptState`, `llResetOtherScript`, `llGetScriptName` | Events |
| Remote load: `llSetRemoteScriptAccessPin`, `llRemoteLoadScriptPin` | Prims |

Relevant categories: `prim_inventory`, `avatar_inventory`, `notecard`, `asset_permissions`,
`rez`.

## Recommendation

1. **Keep C+B as `/features/`** (done). Next steps: a custom LSL icon set, a `summary:`
   frontmatter field to replace the purpose lines in `features-overview.ts`, and a rank and
   purpose for `inventory` once that page lands.
2. **Adopt E as a second view, not a replacement.** The cards answer "what are the main areas?"
   and E answers "where is topic X?" with the portal's vocabulary. E fits as `/features/topics/`
   or as a section of the Reference overview. It works best compactly inside F.
3. **Use F as the basis of a new reference landing page** (see [landing.md](landing.md)). It
   gives the site a portal-like hub that wiki users will recognise.
4. **Fill the gaps** in priority order: Inventory feature (in progress), Operators, Variables and
   Errors reference pages, then Group, Light and Creator/Owner topics.
5. Delete D and the baseline prototype once nobody needs the comparison.

## Removing the prototypes

Delete `src/pages/prototypes/`, `src/components/prototypes/`, `src/lib/prototypes/` and the
prototype screenshots. `src/lib/features-overview.ts` and `src/components/features/` belong to
the live page and stay. The `#from-*` anchors on `/functions/` are harmless to keep.
