# Authoring components plan

Status: approved, with the [decisions](#decisions) below, which override anything later in this
document. Phase 0 (the shared scaffold) is built. The batches are next, built in parallel by
separate agents on disjoint files ([components-ownership.md](components-ownership.md)).
Real-page conversions come later.

Goal: give guide, recipe, feature and API authors a small, readable set of MDX components,
modelled on Mintlify's set. Starlight and Astro primitives get reused or wrapped wherever
they exist, and the site stays static with almost no client JS.

## Contents

1. [Decisions](#decisions)
2. [Ground rules](#ground-rules)
3. [Platform features (required)](#platform-features-required)
4. [Comparison table](#comparison-table)
5. [Batch 1: API hover cards](#batch-1-api-hover-cards)
6. [Batch 2: Recipe kit](#batch-2-recipe-kit)
7. [Batch 3: Asides and disclosure](#batch-3-asides-and-disclosure)
8. [Batch 4: Guide kit](#batch-4-guide-kit)
9. [Optional ideas](#optional-ideas)
10. [Cross-cutting: layout, naming, discovery, showcase, verification](#cross-cutting)
11. [Open questions (resolved)](#open-questions)
12. [Phasing, effort, risks, parallelisation](#phasing)

## Decisions

Recorded 2026-10-11 from the user's answers to the open questions and their review of two
independent critiques of this plan. They override the rest of the document.

1. **Diagrams: deferred.** When they come back, they use a custom build-time SVG renderer, not
   Mermaid (dagre or a simple layered layout, CSS-variable theming). No dependency is installed now.
2. **LSL ⇄ SLua tabs and `<CodeGroup>`: deferred.** Without SLua, CodeGroup is just Starlight
   Tabs, which authors can already use. No Luau grammar, no SLua lint.
3. **Limits become a dataset** (this replaces "per-row ids added to the Markdown tables"):
   - `src/data/limits.yaml` holds one entry per limit row: `id`, `label`, `section`, lower and
     upper values with units, exact-wording notes, related APIs and feature links (from the
     "More coverage" column). It is extracted from the tables in
     `src/content/docs/reference/limits.mdx` and checked against them, so no figure changes.
   - The Limits page keeps its hand-written prose, asides and attribution. Its tables render from
     the data, e.g. `<LimitsTable section="…" />`, and per-row ids come from the data.
   - `<Limit id="…" />` renders the value inline (highlighted, linking to its row), and
     `<Limit id="…" note />` renders a callout with the value and the note. Unknown ids fail the
     build.
   - It can feed hover cards later.
   - Owner: the asides batch. It owns `src/data/limits.yaml`, the Limits table component and the
     table conversion in `limits.mdx`.
4. **Hover cards** (Batch 1, details in its section): Popover plus CSS anchor positioning,
   opening on hover and focus only (`interestfor` where supported, otherwise a tiny script). The
   link stays a normal `<a href>` that navigates on click and tap: no `popovertarget` on the
   link, and no tap-to-open on touch. One popover per API per file, appended to the content tree
   and shared by every link to that API; it anchors to the link that opened it (implicit anchor). The card has no links or other interactive content, no
   `role="tooltip"` and no `aria-describedby` pointing at it. It is purely supplementary
   (`aria-hidden="true"`) and carries `data-pagefind-ignore`.
5. **`<Linkset>` v1** is a styled nested Markdown list (FileTree-style wrapper) with no pipe DSL.
6. **No permanent test infrastructure.** No test runner, no Playwright/axe, no snapshots.
   Each batch checks that its work behaves as intended during development (build, look at the
   showcase, ad-hoc scripts that are not committed). The one committed guard is in
   `src/lib/page-markdown.ts`: an authoring component (imported from `src/components/authoring`)
   without a Markdown-export case fails the build. Starlight's and the site's existing
   components are not checked.
7. **Phasing:** simple, low-risk components first (asides including the Limits dataset,
   Details/FAQ/Figure/Since, RecipeMeta, ScriptFile, Requires as static badges, Param/Returns),
   then hover cards, then Linkset and BuildStep. Deferred items come last.
8. **Every other open question** takes the recommended answer: a slim generated hover-card JSON
   with per-page markup; a closed Requires vocabulary; BuildStep titles are not headings; cards
   on API pages too, except self-links, headings and the sidebar; no `:::gotcha` directives in
   v1; the built-in Starlight asides are restyled with the new ones.
9. **Execution:** the integrator built Phase 0. Batch agents work in parallel and touch only the
   files [components-ownership.md](components-ownership.md) gives them.

Facts checked while recording these:

- There are about 1,660 MDX sources but 4,128 built pages (the rest are Astro routes: catalog
  lists, categories, constant groups, the wiki archive).
- `rehype-inline-lsl` already runs on MDX pages, so hover cards see its links.
- A sitemap does exist: Starlight adds `@astrojs/sitemap` by itself whenever `site` is set (the
  build writes `sitemap-index.xml`). Phase 0 registers it explicitly, before Starlight, with a
  filter that drops `/meta/`, so the hidden showcase stays out of it.
- Restyling the asides is global CSS. It belongs to the asides batch, inside
  `src/components/authoring/asides/asides.css`, not `custom.css`.
- If `<Since>` or API flags ever go on API pages, `scripts/generate-mdx.py` must emit them, or a
  regeneration drops them. That is for later.

## Ground rules

- **Reuse first.** Starlight 0.42 already provides Aside (`:::type[title]`), Tabs/TabItem
  (with `syncKey`), Steps, FileTree, Card/CardGrid/LinkCard, Badge and Icon (277 built-ins,
  no custom SVG registration). Expressive Code 0.44 provides titles, frames, copy, markers,
  wrap and collapse. Only Tabs ships client JS.
- **No remote assets.** The link checker forbids them. Icons are inline SVG or Starlight
  `Icon`, and diagrams are rendered at build time.
- **Static output.** Anything interactive works without JS through platform features
  (popover, `<details>`).
- **Markdown export.** `src/lib/page-markdown.ts` is a hand-written MDX-source scanner. Each
  authoring component needs a case in its batch's `src/lib/page-markdown/<batch>.ts`, and the
  build fails without one.
  Each component below states its export. A case is `selfClosing`, `paired` (open/close text) or
  `transform` (gets the converted children, fenced code included, and returns the whole output,
  e.g. to quote every line), and every case receives a context with its open parent components
  (`ctx.parents`, e.g. a Details inside a FAQ). The `.md` route resolves `<Figure>` sources with
  `getImage()` into `page.images`, so figures export as `![alt](url)`.
- **Simple props.** Feature components get parsed from source by `scripts/lib/feature_mdx.py`
  (props as JSON), so props stay as strings, numbers, booleans or short string lists. No
  JSX expressions beyond `{["a","b"]}`.
- **Colour.** Accent blue is reserved for meaning: links and interactive state. Callout
  colours come from Starlight's semantic `--sl-color-*` tokens. The dark-mode code treatment
  and the slua.dev base in `src/styles/custom.css` stay authoritative, and new components
  inherit them instead of defining new palettes.
- **Readable MDX.** Children are Markdown wherever possible. Authors should never have to
  write HTML.

## Platform features (required)

**Required browser features (stated requirement, current evergreen Chrome, Edge, Firefox,
Safari):** CSS anchor positioning, the Popover API (including `popover="hint"`),
`<details name>`, container queries, `:has()`, `@starting-style`,
`transition-behavior: allow-discrete`, `light-dark()`, `color-mix()` and native CSS nesting.
`@scope`, `::details-content` and `interestfor` are used where they are useful but are not
required.

We ship **no JS polyfills or positioning libraries**. In an older browser, fallbacks only
have to keep content accessible and readable. They don't have to look the same.

| Feature | Used for | Support (late 2026) | Fallback when missing |
|---|---|---|---|
| Anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`) | Hover cards, tooltips | All evergreen engines | The popover opens in the UA default spot (centred top layer). Still readable. |
| Popover API (`popover`, `popover="hint"`) | Hover cards, the optional Since note | All evergreen engines; `hint` is newer | `hint` falls back to `auto`. If popovers are unsupported, the plain link still navigates. |
| `interestfor` (interest invokers) | Hover/focus to open a card without JS | Chromium; others in progress | A tiny shared inline script (under 1 KB) opens on hover and focus. Click and tap always navigate. |
| `<details name>` | Exclusive FAQ accordions | All evergreen | Items open independently. |
| `::details-content` | Animated open/close | Chromium, Firefox; Safari recent | No animation. |
| Container queries | RecipeMeta, Linkset, Param, Columns, cards | All evergreen | Content stacks in one column. |
| `:has()` | Styling a parent by its state, e.g. a Steps item containing code | All evergreen | Minor styling loss. |
| `@starting-style` + `allow-discrete` | Popover and details enter/exit transitions | All evergreen | Instant show and hide. |
| `light-dark()`, `color-mix()` | Theme-aware tints derived from `--sl-color-*` | All evergreen | Not needed (required feature). |
| `@scope`, nesting | Component-local CSS without class soup | All evergreen (`@scope` in Firefox since 2025) | Astro's scoped styles already isolate CSS, so `@scope` is optional. |

Rules that apply to every component:

- Theme colours are written as `light-dark()` over Starlight tokens, keyed off
  `:root[data-theme]` via `color-scheme`. Tints are `color-mix(in oklab, var(--sl-color-…) 12%, transparent)`.
- Every open/close animation is guarded by `@media (prefers-reduced-motion: no-preference)`.
- No component needs client JS to reveal its content.

## Comparison table

| Mintlify | lsl.dev | Status |
|---|---|---|
| Tooltip | Automatic API hover card on every API link; `<Tip>` for ad-hoc terms (optional) | New (rehype + popover) |
| Note/Warning/Info/Tip/Check/Danger | Starlight Aside (`:::note` etc.) | Already exists (restyle only) |
| Callout (custom) | `<Caveat>` `<Limit>` `<Gotcha>` `<Performance>` | New, wraps Aside markup |
| Accordion / AccordionGroup | `<Details>` / `<FAQ>` | New (native `<details name>`) |
| Expandable | `<Details>` inside `<Param>` | New |
| Steps / Step | Starlight `<Steps>` + `<BuildStep>` | Wraps Starlight |
| Tabs | Starlight Tabs/TabItem | Already exists |
| CodeGroup | Starlight Tabs for now; `<CodeGroup>` (LSL ⇄ SLua) | Deferred |
| Code meta (title, highlight, wrap, collapse) | Expressive Code | Already exists |
| Code line numbers / focus / diff | EC line-numbers plugin, markers | Optional (plugin install) |
| ParamField / ResponseField | `<Param>` / `<Returns>` | New |
| Frame | `<Figure>` | New |
| Badge | Starlight Badge; `<Since>` | Wraps Starlight |
| Card / Columns / Tile | Starlight Card/CardGrid/LinkCard; `<Columns>` (optional) | Exists / optional |
| Tree | `<Linkset>` (prim tree, styled nested list); Starlight FileTree | New (FileTree-like) |
| Mermaid | `<StateFlow>` / `<EventFlow>` | Deferred (build-time SVG) |
| Update | `<Update>` changelog entry (optional) | Optional |
| Visibility | `<Visibility for>` (optional) | Optional, tied to the Markdown export |
| Prompt | `<Prompt>` (optional) | Optional |
| (none) | `<RecipeMeta>`, `<Requires>`, `<ScriptFile>` | New, LSL-specific |
| API playground, GitHub cards, icon libraries | (none) | Not a fit: needs remote data or assets or a runtime |

---

## Batch 1: API hover cards

### Purpose
Every link to an API page (`/reference/functions/llFoo/` etc., and inline-LSL links from
`rehype-inline-lsl`) gets a card with the signature, a one-line description and flags (sleep,
energy, permission, experience). Readers can check an API without leaving the page.

### Authoring
None. The cards apply globally. Opt out per link by wrapping it in `<NoCard>` (adds
`data-nocard`), or per page with frontmatter `hoverCards: false` (already in the content schema).
Opt-outs should be rare.

### Data
`src/data/catalog.json` is 5 MB, mostly wiki metadata. `scripts/build-hovercards.ts` (runs
before `astro dev` and `astro build`; stub in place) writes `src/data/hovercards.json`
(git-ignored) with one record per entry: `{k: kind, s: signature, d: oneLine (≤140 chars),
f: flags[]}`. Flags come from `definition.sleep`, `energy`, `requires-permission` and
`experience`, plus deprecated and SLua flags from the YAML. Target size: about 400–600 KB. It is
read at build time only and never shipped.

### Rendering (decision 4)
`rehype-api-hovercards` (registered in `astro.config` after `rehype-inline-lsl`) visits each
`<a>` whose href resolves to a catalog entry, and skips self-links, links inside headings,
`[data-nocard]` and pages with `hoverCards: false`. The sidebar is not Markdown, so the plugin
never sees it. It emits **one card per distinct API per file** (the page or an imported MDX
partial), appended at the end of that file's content tree (rehype can't append to `<main>`; no
PageFrame change is needed). Every link to that API in the file points at the same card. Ids are
`hc<3-char hash of the file path>-<API name>`, unique on the page even with partials:

```html
<a href="/functions/llSetTimerEvent/" class="lsl-ref" interestfor="hck0t-llSetTimerEvent">llSetTimerEvent</a>
… <a href="/functions/llSetTimerEvent/" class="lsl-ref" interestfor="hck0t-llSetTimerEvent">…</a>
…
<span popover="hint" id="hck0t-llSetTimerEvent" class="au-popover hc" aria-hidden="true" data-pagefind-ignore>
  <span class="hc-sig"><code>…signature, LSL token colours…</code></span>
  <span class="hc-desc">One-line description.</span>
  <span class="hc-flags"><span class="hc-flag">Sleeps 0.2 s</span>…</span>
</span>
```

- The link keeps its `href`, text and classes. It gets only `interestfor`. It never gets
  `popovertarget`, so click and tap always navigate.
- The card is phrasing content (`<span>`s, styled as blocks) with no links, buttons or other
  focusable content.
- One card per API (changed from one per link): the card anchors to whichever link opened it,
  because an invoker is the popover's implicit anchor, so `position-area` needs no `anchor-name`.
  Measured card markup (cards plus `interestfor` attributes) before → after: features/combat
  26.9 → 16.2 KB, features/avatar 35.4 → 27.9 KB, llSetLinkPrimitiveParamsFast 18.4 → 11.0 KB,
  llRequestPermissions 21.1 → 13.6 KB.
- Positioning comes from `shared/popover.css` (`.au-popover`): `inset: auto`, `position-area:
  block-end span-inline-end`, `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline`.
- Only APIs with a reference page get a card (or a link at all, see `hasApiPage` in
  `src/lib/inline-lsl.ts`); deprecated or private names render as unlinked highlighted code.
- Opening: `interestfor` where supported. Elsewhere a shared inline script in
  `hovercards/PageEnd.astro` (under 1 KB, no island) uses delegation on `a[interestfor]` for
  `pointerover` and `focusin` (300 ms intent delay, mouse and pen only; `pointerType ===
  "touch"` is ignored), and `pointerout`/`focusout` to hide. It opens the card with
  `showPopover({ source: link })` (implicit anchor) and also sets `anchor-name: --hc` on the
  active link, which the card uses as `position-anchor`, for engines without `source`. Esc and
  light dismiss come from the popover.
- Build cost: one map lookup per link, with the JSON memoised once per build.

### Accessibility
- The card is supplementary and hidden from assistive tech (`aria-hidden="true"`). The link text
  and destination are unchanged, and the destination has everything the card shows.
- No `role="tooltip"`, no `aria-describedby` and no visually hidden description in the link
  (it would be read in the middle of the sentence).
- Focus never moves into the card. Respect `prefers-reduced-motion`.

### Markdown export
Nothing changes: links export as links. Cards are web-only.

### Styling
- Uses the code surface treatment: dark-mode code background, monospace signature
  highlighted by the same LSL token colours as inline code.
- Max width 28rem. Flags render as small neutral Badges, and only "deprecated" uses the
  caution colour.
- No accent fill on the card body. Accent is used only for the link.

---

## Batch 2: Recipe kit

### `<RecipeMeta>`
**Purpose:** a summary strip at the top of a recipe.

```mdx
<RecipeMeta scripts={1} time="15 min" />
```

| Prop | Type | Default |
|---|---|---|
| prims | number | 1 |
| scripts | number | 1 |
| permissions | string[] (catalog constants) | `[]` |
| time | string | none |

- **Rendering:** Astro component with no JS. Markup is a `<dl>` grid. A container query
  switches it from 4 columns to 2 to a stacked list. Permission names link to their API
  pages, so they get hover cards automatically.
- **Accessibility:** `<dl>` semantics.
- **Markdown export:** a single line,
  `**Prims:** 2 · **Scripts:** 1 · **Permissions:** PERMISSION_TAKE_CONTROLS`.
- **Styling:** neutral surface with a hairline border. Difficulty was dropped (user decision): a
  `<Prerequisites>` "What you need to know" box lists the knowledge a recipe assumes instead.

### `<Steps>` / `<BuildStep>`
**Purpose:** numbered build instructions. Starlight `Steps` requires a single `<ol>` and
throws otherwise, so `<BuildStep>` cannot be a sibling element. There are two options:

```mdx
<Steps>
1. **Rez two prims** and link them. The cube is the root.
2. **Add the script** to the root. <ScriptFile name="door.lsl" in="root" /> ...
</Steps>
```

Recommended: re-export Starlight `Steps` unchanged, and add `<BuildStep title>` as an
optional component that **compiles to an `<ol>` item** by being wrapped by our own `Steps`.
Our `Steps` is then a thin wrapper that collects `BuildStep` children into one `<ol>`
before delegating to Starlight's Steps CSS. Authors can use either list syntax or
`<BuildStep title="Rez two prims">…</BuildStep>`.

| BuildStep prop | Type | Default |
|---|---|---|
| title | string | required |
| id | string | slug of title (for deep links) |

- **Accessibility:** a real `<ol>`. The title is a `<p class="step-title">`, not a heading,
  to avoid polluting the TOC (see open question 6).
- **Markdown export:** `1. **Title**` followed by the indented body.
- **Styling:** Starlight Steps styling. `:has(pre)` widens the step rail spacing.

### `<Linkset>`
**Purpose:** show a linked object: the root and child prims, their names, and the
scripts and inventory in each prim.

```mdx
<Linkset>
- **Door frame**: `door.lsl`, notecard `config`
  - Door panel
  - Handle: sound `creak`
</Linkset>
```

- **Syntax (decision 5):** a plain Markdown nested list, with no pipe DSL. The first item is
  the root. Inventory, if needed, is ordinary nested list items or text such as
  "scripts: door.lsl". `(root)` is implied for the first item.
- **Props:** `title?: string`. No link numbers (user decision): apart from the root they depend on
  link order and aren't predictable, so prims are identified by name.
- **Rendering:** a FileTree-style wrapper: the component renders its slot and styles the nested
  `<ul>`, adding prim icons and link-number pills with CSS (counters) or a light hast pass. No JS
  and no `role="tree"` (a tree role without keyboard support is worse than none).
- **Markdown export:** the source list as it is.
- **Styling:** FileTree look. Prim icons are inline SVG (cube, a variant for root). Link
  numbers show as a neutral monospace pill. Script names are links when they match a
  `<ScriptFile name>` on the page (`#script-door-lsl`).

### `<ScriptFile>`
**Purpose:** a code block that says which prim the script goes in.

````mdx
<ScriptFile name="door.lsl" in="Door frame (root)">
```lsl
default { touch_start(integer n) { ... } }
```
</ScriptFile>
````

| Prop | Type | Default |
|---|---|---|
| name | string | required |
| in | string | none (the prim name) |
| lang | `"lsl" \| "slua"` | from fence |

- **Rendering:** an Astro wrapper that sets an `id="script-<slug>"` anchor and shows a header
  line ("Put in: Door frame (root)") above the fenced block. The fence keeps Expressive Code
  with `title="door.lsl"` injected. That is easiest done by asking authors to write
  ` ```lsl title="door.lsl" ` themselves, and having the wrapper only render the "in"
  label. The wrapper fails the build if the title is missing. Copy comes from EC.
- **Accessibility:** the header label is plain text placed before the code in DOM order.
- **Markdown export:** `**door.lsl** (put in: Door frame (root))` and then the fence.
- **Styling:** EC editor frame, plus a small neutral chip under the frame tab.

### `<Requires>`
**Purpose:** chips listing what a script needs before it can work.

```mdx
<Requires permissions={["PERMISSION_ATTACH"]} experience land="build" attachment />
```

| Prop | Type | Default |
|---|---|---|
| permissions | string[] | `[]` |
| experience | boolean | false |
| land | `"build" \| "scripts" \| "owner" \| "group"` | none |
| attachment / seated | boolean | false |
| owner | boolean (owner-only) | false |

- **Rendering:** an Astro component that renders a `<ul>` of static Starlight Badges, with no
  popovers. Permission chips link to the constant page, so they get hover cards once Batch 1
  lands.
- **Accessibility:** a list labelled "Requires". Each chip's text says what it means.
- **Markdown export:** `**Requires:** PERMISSION_ATTACH, an experience, build rights, attached`.
- **Styling:** neutral badges. Only permissions that prompt the user use `caution`.

---

## Batch 3: Asides and disclosure

### `<Caveat>`, `<Limit>`, `<Gotcha>`, `<Performance>`

```mdx
<Gotcha>`llSetTimerEvent(0)` stops the timer, but a pending event may still fire once.</Gotcha>
<Limit id="scripting-max-script-memory-size-mono" note title="Script memory">Plan for the cap from the start.</Limit>
{/* Children need `note` (the callout form); the inline form, <Limit id="…" />, takes none. */}
<Performance>Avoid `llSleep` in busy event handlers.</Performance>
```

| Prop | Type | Default |
|---|---|---|
| title | string | Caveat / Limit / Gotcha / Performance |
| id (Limit only) | string, a row id from `src/data/limits.yaml` | required for Limit |
| note (Limit only) | boolean: render a callout with the value and the note | false |

- **Rendering:** each is an Astro component that renders **Starlight's Aside markup**
  (`<aside class="starlight-aside starlight-aside--<base>">`). Base types:
  - Caveat uses `note`
  - Gotcha uses `caution`
  - Limit uses `note` with its own icon
  - Performance uses `tip`

  Icons are inline SVG, because Starlight Icon can't register custom icons.
- **Limit (decision 3):** the value comes from `src/data/limits.yaml`. `<Limit id />` is inline:
  the highlighted value, linking to `/reference/limits/#<id>`. `<Limit id note />` is the
  callout (Aside markup) with the value and the row's note. An unknown id fails the build. The
  Limits tables render through `<LimitsTable section>` from the same data, so every row id
  exists.
- **Directive syntax:** optionally, register remark-directive names `:::gotcha` etc. via
  Starlight's aside directive handling. Recommendation: components only for v1, so there is
  one way to do it.
- **Accessibility:** `<aside aria-label="Gotcha">`, and the title is in the visible text.
- **Markdown export:** `> **Gotcha:** body` (blockquote). An inline Limit becomes
  `[value](/reference/limits/#id)`, and the callout form adds the note and the link.
  `<LimitsTable>` becomes a Markdown table built from the data.
- **Styling:** restyle all asides together, since today they are unstyled defaults. This is
  global CSS, owned by the asides batch in `asides/asides.css`. Use a
  left rule plus a `color-mix` tint, with semantic colours only. Never accent blue for
  Caveat or Limit; those use neutral gray-blue. Dark mode matches the code surface depth.

### `<Details>` and `<FAQ>`

```mdx
<FAQ>
  <Details summary="Why does my timer drift?">Timers are throttled under sim lag…</Details>
  <Details summary="Can I use llSleep instead?">…</Details>
</FAQ>
```

| Prop | Type | Default |
|---|---|---|
| Details.summary | string | required |
| Details.open | boolean | false |
| Details.id | string | slug of summary |
| FAQ.exclusive | boolean | false |
| FAQ.title | string | none |

- **Rendering:** native `<details>`/`<summary>`. FAQ gives its children a shared
  `name="faq-<n>"` when `exclusive` is set, via a context or prop passed by slot rewriting.
  The simpler option is for FAQ to inject the `name` attribute in a rehype step on its
  rendered slot. Animation uses `::details-content` with `block-size` and
  `interpolate-size: allow-keywords`, guarded by reduced motion.
- **Deep links:** a `:target` details element doesn't open by itself. A tiny shared inline
  script opens `details:has(:target)` on load and on `hashchange` (under 300 bytes).
  Without it, content is still reachable.
- **Optional:** FAQ emits FAQPage JSON-LD.
- **Accessibility:** native semantics. The summary is focusable and announces its
  expanded state.
- **Markdown export:** `### Question` followed by the body (FAQ), or `**Summary**` and the
  body (standalone Details). Never collapsed.
- **Styling:** hairline-separated rows, a chevron rotated with `[open]`, and no fill.

### `<Figure>`

```mdx
<Figure src="./door-linkset.png" alt="Door linkset in edit mode" caption="The root prim is highlighted yellow." />
```

| Prop | Type | Default |
|---|---|---|
| src | local import path (must be local) | required |
| alt | string | required (build error if missing) |
| caption | string (Markdown inline allowed via slot) | none |
| hint | string (small text above the frame) | none |
| width | number | intrinsic |

- **Rendering:** an Astro component around `astro:assets` `<Image>`, outputting `<figure>` and
  `<figcaption>`. A remote `src` is a build error.
- **Markdown export:** `![alt](url)` followed by `*caption*`.
- **Styling:** a framed surface like Mintlify's Frame, with neutral padding and a radius
  matching code blocks.

### `<Since>`

```mdx
## llLinksetDataWrite <Since date="2022-11" />
```

| Prop | Type | Default |
|---|---|---|
| date | `YYYY-MM` or `YYYY-MM-DD` | required |
| note | string (e.g. "Server 2022-11-04") | none |

- **Rendering:** wraps Starlight Badge (`variant="note"`, size small), with text like
  "Since Nov 2022" in a `<time datetime>`. An optional `note` opens as a hint popover.
- **Markdown export:** `(since 2022-11)`.
- **Later:** on API pages, `scripts/generate-mdx.py` would have to emit `<Since>`.
- **Styling:** a small outline badge. It never uses the accent fill.

---

## Batch 4: Guide kit

### `<Param>` / `<Returns>`
**Purpose:** document user-defined functions in guides, like Mintlify's ParamField and
ResponseField.

```mdx
<Param name="target" type="key" required>Avatar to follow.</Param>
<Param name="range" type="float" default="10.0">Stop distance in metres.</Param>
<Returns type="integer">TRUE if the target was found.</Returns>
```

| Prop | Type | Default |
|---|---|---|
| name | string | required (Param) |
| type | LSL/SLua type string | required |
| required | boolean | false |
| default | string | none |
| deprecated | boolean | false |

- **Rendering:** an Astro component that outputs a `<div class="param">` with a header row
  (name in monospace, type linking to `/reference/types/<type>` if it exists, then badges)
  and Markdown children. Consecutive Params can sit inside an optional `<Params>` group for
  borders. Nesting uses `<Details summary="Fields">`.
- **Reuse:** share the visual with the existing API-page parameter tables in
  `src/components/lsl/` where possible, through one CSS partial.
- **Accessibility:** a definition-list-like structure. "required" is text, not colour.
- **Markdown export:** `- \`target\` (key, required): Avatar to follow.` and
  `**Returns** (integer): …`
- **Styling:** the type uses the code token colour for types. "required" is a small caution
  text label, and "deprecated" is struck through and gray.

### `<CodeGroup>` (LSL ⇄ SLua): deferred

Deferred (decision 2). Kept here as the design for when SLua support is picked up again. Until
then, authors use Starlight Tabs.

````mdx
<CodeGroup>
```lsl title="LSL"
llSay(0, "Hi");
```
```slua title="SLua"
ll.Say(0, "Hi")
```
</CodeGroup>
````

- **Rendering:** wraps Starlight `Tabs` with `syncKey="lang"`. The component splits the fenced
  children into TabItems labelled by each block's title or language. The sync key is stored
  in localStorage by label, so every CodeGroup on every page follows the reader's last
  choice. This uses the only existing JS (Tabs), so it adds none.
- **Prerequisite:** there is no SLua grammar locally. Add a Luau TextMate grammar (vendored
  JSON, MIT) to `ec.config.mjs` as `slua` (alias `luau`).
- **Props:** `labels?: string[]` (override), `syncKey?: string = "lang"`.
- **Accessibility:** Starlight Tabs already has ARIA tabs and keyboard support.
- **Markdown export:** each block in order, preceded by `**LSL**` or `**SLua**`.
- **Styling:** Starlight Tabs, sitting tight above the EC frame with no gap.

### `<StateFlow>` / `<EventFlow>`: deferred

Deferred (decision 1). Kept here as the design for later.
**Purpose:** LSL state machines and event sequences.

```mdx
<StateFlow>
default -> open: touch_start
open -> default: timer
</StateFlow>

<EventFlow>
state_entry -> listen: llListen
listen -> timer: llSetTimerEvent(30)
</EventFlow>
```

- **Recommendation: a custom build-time SVG renderer, not Mermaid.**
  - Mermaid needs a headless browser for SSR (via Playwright/mermaid-cli), or about 1 MB+
    of client JS. Its theming doesn't follow our tokens, and it would add minutes across
    4k pages if used widely.
  - A small renderer does the job. It is about 300 lines, parses `a -> b: label`, and lays
    out with `@dagrejs/dagre` (pure JS, build only), or with a simple layered layout since
    state graphs are small. It emits inline SVG that uses `currentColor` and CSS variables,
    so light and dark themes are free. There are no remote assets.
- **Props:** `direction?: "LR" | "TB" = "LR"`, `title?: string` (becomes `<title>` and the
  figcaption). StateFlow marks `default` as the initial state with an entry dot. EventFlow
  draws a linear timeline (lanes optional, later).
- **Accessibility:** `<figure>` > `<svg role="img" aria-labelledby>`, plus a visually hidden
  `<ol>` of transitions as the text alternative. State and event names link to API pages
  where they match, both in the SVG and in the list.
- **Markdown export:** keep the source as a fenced ` ```text ` block of transitions, which
  is readable and LLM-friendly.
- **Styling:** neutral strokes, nodes in the code surface colour, and the accent only on the
  initial state marker.

---

## Optional ideas

- **`<Visibility for="humans|agents">`** hides content on the web or in the Markdown export.
  It needs a `paired` case in `page-markdown.ts` that drops or keeps the content, and is
  cheap. Use it for "LLM context" notes.
- **Code extras:** install `@expressive-code/plugin-line-numbers` (opt-in per block via
  `showLineNumbers`), use EC `mark`/`ins`/`del` markers for focus and diff, and document
  them in `docs/components.md`.
- **`<Prompt>`:** a copyable prompt block for "ask an assistant". Low priority.
- **`<Update date label tags>`:** changelog entries and an RSS feed (Astro RSS, static). Useful
  for a "What's new" page.
- **Linkset keyboard tree:** a roving-tabindex script for arrow keys, Home/End and
  type-ahead (about 1.5 KB, an island only on pages that use it). Add `role="tree"` only
  when this ships.
- **`<Columns cols>`:** a container-query grid for side-by-side content. Starlight CardGrid
  covers most cases.

## Cross-cutting

### File layout
As built in Phase 0:

```
src/components/authoring/
  index.ts                 # the single import barrel; re-exports each <batch>/index.ts
  authoring.css            # CSS entry (customCss, after custom.css): shared/*, then <batch>/<batch>.css
  PageEnd.astro            # mounts each <batch>/PageEnd.astro once per page (from the Footer override)
  shared/                  # tokens.css (--au-*, light-dark/color-mix), popover.css, icons.ts
  asides/ recipe/ hovercards/ guide/   # one folder per batch, each with:
    index.ts               #   the batch's exports
    <batch>.css            #   the batch's styles
    PageEnd.astro          #   optional per-page inline script
    Showcase.mdx           #   the batch's showcase section
  hovercards/rehype-api-hovercards.ts  # Batch 1 plugin, already registered in astro.config
src/lib/page-markdown.ts   # the scanner and the authoring-component guard
src/lib/page-markdown/     # core.ts (existing components), asides|recipe|hovercards|guide.ts, index.ts (registry)
src/content/docs/meta/components.mdx   # the hidden showcase page; imports each Showcase.mdx
scripts/build-hovercards.ts            # writes src/data/hovercards.json (git-ignored) before dev and build
```
Each batch has its own folder, its own `page-markdown` case file and its own showcase partial,
so parallel work stays on disjoint files.

### Naming
- PascalCase, a domain noun, no prefix (`Linkset`, not `LslLinkset`).
- Boolean props are bare attributes.
- Lists use `{["a","b"]}` and nothing richer, to stay compatible with `feature_mdx.py`.

### Import barrel
Authors write one line:

```mdx
import { RecipeMeta, Steps, Linkset, ScriptFile, Requires } from '~/components/authoring';
```

The barrel exists as `src/components/authoring/index.ts` (the `~/` alias maps to `src/`).
Optionally, auto-import via an MDX components map later. Explicit imports stay greppable and
work with `feature_mdx.py`.

### Discovery
- `docs/components.md` gives each component its syntax, props and a link to its showcase
  anchor, linked from `docs/README.md`. Each component file opens with a JSDoc block that
  mirrors it.
- `editing-feature-pages.md` and `style/feature-pages.md` get a "Components" pointer.

### Showcase page
- Path: `src/content/docs/meta/components.mdx`, importing one partial per batch from
  `src/components/authoring/<batch>/Showcase.mdx`. The docs loader only skips `_`-prefixed
  file names, not folders, so the partials live outside the content collection. The page's
  Markdown export inlines them, so the export guard covers them too.
- Frontmatter: `pagefind: false`, `sidebar: { hidden: true }`, and
  `head: [{ tag: meta, attrs: { name: robots, content: noindex } }]`.
- It is excluded from the sitemap by the `/meta/` filter on `@astrojs/sitemap` in
  `astro.config` (see the facts under [Decisions](#decisions)).
- It shows every component in every state: light and dark, long content, and an overflowing
  Linkset. It is the place to check a batch's work by eye.

### Verification (decision 6)
No committed test suites. While building, each batch:

- runs `bun run check` and a build into a temporary outDir, then `test:links` and `test:sidebar`
  against it (the existing Python checks, which also forbid remote assets);
- looks at its showcase section in light and dark, keyboard only and at narrow widths;
- opens the showcase's `/meta/components/index.md` to check its Markdown forms;
- for hover cards, records `astro build` time before and after (budget +5 %) and the card
  markup size on the heaviest pages.

The build fails when an authoring component has no Markdown-export case (guard in
`src/lib/page-markdown.ts`).

## Open questions

1. **(Deferred, decision 1.) Mermaid or a custom diagram renderer?** Recommended: a custom build-time SVG renderer
   (dagre layout, CSS-variable theming). Revisit Mermaid only if authors need sequence or
   class diagrams.
2. **Hover-card data source and payload?** Recommended: a slim generated
   `hovercards.json` (~500 KB, build only), with per-page inline popovers for distinct APIs
   only (~6–10 KB of HTML per heavy page). Don't ship a client-side JSON index.
3. **(Deferred, decision 2.) Where does the SLua code come from?** Recommended: hand-written by authors in each
   CodeGroup, with a lint that warns when an LSL block has no SLua sibling only on pages that
   opt in. Don't machine-translate. Add a vendored Luau grammar first.
4. **Requires vocabulary?** Recommended: a closed set: `permissions[]` (catalog constants),
   `experience`, `land` (build | scripts | owner | group), `attachment`, `seated`, `owner`.
   Unknown values fail the build. Extend as needed.
5. **Limit anchors?** Superseded by decision 3: the Limits page becomes a dataset
   (`src/data/limits.yaml`), and its rows and ids render from it.
6. **Should BuildStep titles be headings?** Recommended: no, keep them out of the TOC. Recipes
   with long builds can use real `##` sections between Steps.
7. **Tap behaviour for hover cards?** Decided (decision 4): no cards on touch; a tap navigates.
8. **Apply hover cards on API pages themselves?** Recommended: yes, except self-links. Skip
   links inside headings and the sidebar.
9. **Callout directive syntax (`:::gotcha`)?** Recommended: not in v1. Use components only,
   so there is one way to write them.
10. **Restyle the four built-in Starlight asides at the same time?** Recommended: yes, so all
    callouts share one look.

## Phasing

| Phase | Work | Effort | Notes |
|---|---|---|---|
| 0 | Scaffold: `src/components/authoring/`, barrel, shared tokens and popover CSS, hidden showcase page, `docs/components.md` skeleton, per-batch `page-markdown` case files and the export guard, hover-card rehype slot and data stub, sitemap filter | 1 day | Done |
| 1 | Simple components, in parallel: asides (Caveat, Gotcha, Performance, Limit, the Limits dataset and `<LimitsTable>`, Details/FAQ, Figure, Since, aside restyle); recipe (RecipeMeta, ScriptFile, Requires as static badges); guide (Param, Params, Returns) | 2.5 days | Low risk; the limits extraction must not change any figure |
| 2 | Hover cards (data script, rehype, popover, intent script) | 2 days | Most cross-page impact; measure build time and HTML size |
| 3 | Recipe: Linkset (styled nested list) and Steps/BuildStep | 1.5 days | |
| 4 | Deferred: CodeGroup (LSL ⇄ SLua), StateFlow/EventFlow; optional ideas; real-page conversions | later | |

**Parallelisation.** The batch folders stay as built (asides, recipe, hovercards, guide), and
the four agents can start at once because their files are disjoint. Phase order is about
priority, not file locks: the hovercards agent can start alongside phase 1, and the recipe agent
does Linkset and BuildStep after its phase 1 items. Phase 0 registered every shared hook (barrel,
CSS entry, rehype slot, page-end scripts, `hoverCards` frontmatter, the hover-card data script),
so no batch has to edit a shared file. The exact map is in
[components-ownership.md](components-ownership.md).

**Risks.**
- Hover cards on every page could bloat HTML or slow the build. Cards are deduplicated per API
  per file (about 25-40 % less card markup than the original one-card-per-link design). Mitigate with short cards, a size check on the heaviest
  pages and memoised data.
- `interestfor` support differs between browsers. The small intent script covers the gap,
  and links always work.
- Starlight upgrades could change Aside and Steps markup that our wrappers rely on. Check the
  showcase after each upgrade.
- (Deferred items) the Luau grammar may not cover SLua-specific syntax, and dagre's layout
  quality on cyclic state graphs is unknown; prototype before committing.
- Every authoring component needs a `page-markdown` case. The build-time guard fails on one
  without a case, and checks only authoring components.
