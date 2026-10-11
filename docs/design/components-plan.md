# Authoring components plan

Status: plan only, nothing built yet. Scope: four component batches plus a showcase page.
Real-page conversions come later.

Goal: give guide, recipe, feature and API authors a small, readable set of MDX components,
modelled on Mintlify's set. Starlight and Astro primitives get reused or wrapped wherever
they exist, and the site stays static with almost no client JS.

## Contents

1. [Ground rules](#ground-rules)
2. [Platform features (required)](#platform-features-required)
3. [Comparison table](#comparison-table)
4. [Batch 1: API hover cards](#batch-1-api-hover-cards)
5. [Batch 2: Recipe kit](#batch-2-recipe-kit)
6. [Batch 3: Asides and disclosure](#batch-3-asides-and-disclosure)
7. [Batch 4: Guide kit](#batch-4-guide-kit)
8. [Optional ideas](#optional-ideas)
9. [Cross-cutting: layout, naming, discovery, showcase, tests](#cross-cutting)
10. [Open questions (with recommendations)](#open-questions)
11. [Phasing, effort, risks, parallelisation](#phasing)

## Ground rules

- **Reuse first.** Starlight 0.42 already provides Aside (`:::type[title]`), Tabs/TabItem
  (with `syncKey`), Steps, FileTree, Card/CardGrid/LinkCard, Badge and Icon (277 built-ins,
  no custom SVG registration). Expressive Code 0.44 provides titles, frames, copy, markers,
  wrap and collapse. Only Tabs ships client JS.
- **No remote assets.** The link checker forbids them. Icons are inline SVG or Starlight
  `Icon`, and diagrams are rendered at build time.
- **Static output.** Anything interactive works without JS through platform features
  (popover, `<details>`).
- **Markdown export.** `src/lib/page-markdown.ts` is a hand-written MDX-source scanner, and
  `docs/page-actions.md` requires a `selfClosing` or `paired` case for every new component.
  Each component below states its export.
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
| Popover API (`popover`, `popovertarget`, `popover="hint"`) | Hover cards, Since and Requires chip tips | All evergreen engines; `hint` is newer | `hint` falls back to `auto`. If popovers are unsupported, the plain link still navigates. |
| `interestfor` (interest invokers) | Hover/focus to open a card without JS | Chromium; others in progress | A tiny shared inline script (under 1 KB) opens on hover and focus. Tap and click use `popovertarget`. The link always works. |
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
| CodeGroup | `<CodeGroup>` (LSL ⇄ SLua, `syncKey="lang"`) | Wraps Starlight Tabs |
| Code meta (title, highlight, wrap, collapse) | Expressive Code | Already exists |
| Code line numbers / focus / diff | EC line-numbers plugin, markers | Optional (plugin install) |
| ParamField / ResponseField | `<Param>` / `<Returns>` | New |
| Frame | `<Figure>` | New |
| Badge | Starlight Badge; `<Since>` | Wraps Starlight |
| Card / Columns / Tile | Starlight Card/CardGrid/LinkCard; `<Columns>` (optional) | Exists / optional |
| Tree | `<Linkset>` (prim tree); Starlight FileTree | New (FileTree-like) |
| Mermaid | `<StateFlow>` / `<EventFlow>` | New (build-time SVG) |
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
None. The cards apply globally. Opt out per link by adding
`data-nocard` through a tiny wrapper (`<NoCard>`), or per page with frontmatter
`hoverCards: false`. Opt-outs should be rare.

### Data
`src/data/catalog.json` is 5 MB, mostly wiki metadata. A build step
(`scripts/build-hovercards.ts`, run before astro) writes `src/data/hovercards.json` with one
record per entry: `{k: kind, s: signature, d: oneLine (≤140 chars), f: flags[]}`. Flags
come from `definition.sleep`, `energy`, `requires-permission` and `experience`, plus
deprecated and SLua flags from the YAML. The target size is about 400–600 KB total. It is
never shipped whole.

### Rendering
- A rehype plugin, `rehype-api-hovercards`, runs after `rehype-inline-lsl`. For each `<a>`
  whose href resolves to a catalog entry, it adds an `aria-describedby` and an
  `interestfor`/`popovertarget` pointing at `hc-<name>`.
- It appends **one popover per distinct API per page** at the end of `<main>`:
  `<div popover="hint" id="hc-llSetTimerEvent" role="tooltip" class="hc">`. A page with 30
  distinct APIs adds roughly 6–10 KB of HTML, and the payload scales with the page, not the
  catalog.
- Positioning: each link gets `anchor-name: --hc-<n>` (set inline as a style), and the
  popover uses `position-anchor`, `position-area: block-end span-inline-end` and
  `position-try-fallbacks: flip-block, flip-inline`.
- Opening:
  - Hover and focus use `interestfor` where supported. Elsewhere a shared inline script
    (under 1 KB, no island) listens with delegation for `pointerenter`, `focusin`,
    `pointerleave` and `focusout` with a 300 ms intent delay.
  - Tap works like this: the first tap on a touch pointer opens the card (the card contains
    "Open reference →"), and a second tap navigates. That is implemented in the same
    script, with `pointerType === "touch"`.
  - Esc and light dismiss come from the popover itself.
- Build cost: one map lookup per link. Memoise the JSON import once per build. The cost is
  negligible across ~4,100 pages.

### Accessibility
- The card is supplementary. The link text and destination are unchanged.
  `aria-describedby` points at a short visually-hidden description (the one-liner), so
  screen readers get the summary without needing the popover.
- Focus never moves into a hint popover. The card's "Open reference" link is the same
  destination as the link that opened it, so you can always reach it.
- Respect `prefers-reduced-motion`.

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
<RecipeMeta difficulty="beginner" prims={2} scripts={1} permissions={["PERMISSION_TAKE_CONTROLS"]} time="15 min" />
```

| Prop | Type | Default |
|---|---|---|
| difficulty | `"beginner" \| "intermediate" \| "advanced"` | required |
| prims | number | 1 |
| scripts | number | 1 |
| permissions | string[] (catalog constants) | `[]` |
| time | string | none |

- **Rendering:** Astro component with no JS. Markup is a `<dl>` grid. A container query
  switches it from 4 columns to 2 to a stacked list. Permission names link to their API
  pages, so they get hover cards automatically.
- **Accessibility:** `<dl>` semantics, and difficulty is given as text, not colour alone.
- **Markdown export:** a single line,
  `**Difficulty:** beginner · **Prims:** 2 · **Scripts:** 1 · **Permissions:** PERMISSION_TAKE_CONTROLS`.
- **Styling:** neutral surface (`--sl-color-gray-6`) with a hairline border, and a
  three-dot difficulty meter in a neutral colour.

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
**Purpose:** show a linked object: the root and child prims, link numbers, names, and the
scripts and inventory in each prim.

```mdx
<Linkset>
- Door frame (root) | scripts: door.lsl | notecards: config
  - Door panel #2
  - Handle #3 | sounds: creak
</Linkset>
```

- **Syntax:** a Markdown nested list, the same approach FileTree takes. The first item is
  the root (link 1). `#n` sets the link number explicitly, otherwise numbering follows
  depth-first order. `| kind: a, b` segments list inventory, where kind is one of
  `scripts`, `notecards`, `sounds`, `textures`, `animations` or `objects`. `(root)` is
  implied for the first item.
- **Props:** `title?: string`, `numbers?: boolean = true`.
- **Rendering:** a rehype transform at build time, done in the component via
  `Astro.slots.render` plus a hast parse, which is how Starlight's FileTree works. It
  outputs a nested `<ul role="tree">`. No JS by default. The optional keyboard tree
  navigation is described under [Optional ideas](#optional-ideas).
- **Accessibility:** if we don't ship the arrow-key script, use a plain nested `<ul>`
  without `role="tree"`. A tree role without keyboard support is worse than no role.
  Recommendation: plain lists first.
- **Markdown export:** keep the source list as is, minus the pipes. Inventory becomes
  ` — scripts: door.lsl`.
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

- **Rendering:** an Astro component that renders a `<ul>` of Starlight Badges. Each chip has
  a `popover="hint"` explanation, using the same machinery as hover cards. Permission chips
  link to the constant page.
- **Accessibility:** a list labelled "Requires", and each chip's explanation is also in
  `aria-describedby`.
- **Markdown export:** `**Requires:** PERMISSION_ATTACH, an experience, build rights, attached`.
- **Styling:** neutral badges. Only permissions that prompt the user use `caution`.

---

## Batch 3: Asides and disclosure

### `<Caveat>`, `<Limit>`, `<Gotcha>`, `<Performance>`

```mdx
<Gotcha>`llSetTimerEvent(0)` stops the timer, but a pending event may still fire once.</Gotcha>
<Limit id="scripting" title="64 KB memory">Mono scripts get 64 KB of memory.</Limit>
<Performance>Avoid `llSleep` in busy event handlers.</Performance>
```

| Prop | Type | Default |
|---|---|---|
| title | string | Caveat / Limit / Gotcha / Performance |
| id (Limit only) | string, the anchor on `/reference/limits/` | none |

- **Rendering:** each is an Astro component that renders **Starlight's Aside markup**
  (`<aside class="starlight-aside starlight-aside--<base>">`). Base types:
  - Caveat uses `note`
  - Gotcha uses `caution`
  - Limit uses `note` with its own icon
  - Performance uses `tip`

  Icons are inline SVG, because Starlight Icon can't register custom icons. `Limit`
  appends "See limits →" linking to `/reference/limits/#<id>`. Only section anchors exist
  today, so the build fails if `id` doesn't match a heading id on the Limits page.
  Per-row ids are a follow-up.
- **Directive syntax:** optionally, register remark-directive names `:::gotcha` etc. via
  Starlight's aside directive handling. Recommendation: components only for v1, so there is
  one way to do it.
- **Accessibility:** `<aside aria-label="Gotcha">`, and the title is in the visible text.
- **Markdown export:** `> **Gotcha:** body` (blockquote). Limit adds the link.
- **Styling:** restyle all asides together, since today they are unstyled defaults. Use a
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

### `<CodeGroup>` (LSL ⇄ SLua)

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

### `<StateFlow>` / `<EventFlow>`
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
```
src/components/authoring/
  index.ts                 # the single import barrel for MDX
  hovercards/              # Batch 1: rehype-api-hovercards.ts, HoverCard.css, hc-intent.ts (inline script)
  recipe/                  # Batch 2: RecipeMeta, Steps, BuildStep, Linkset, ScriptFile, Requires
  asides/                  # Batch 3: Caveat, Limit, Gotcha, Performance, Details, FAQ, Figure, Since
  guide/                   # Batch 4: Param, Returns, CodeGroup, StateFlow, EventFlow, flow/ (parser+layout)
  shared/                  # icons (inline SVG), popover.css, tokens.css (light-dark/color-mix helpers)
scripts/build-hovercards.ts
src/data/hovercards.json   # generated, git-ignored
```
Each batch has its own directory and its own `page-markdown` case file
(`src/lib/page-markdown/<batch>.ts`, registered from one list). That keeps parallel work
on disjoint files.

### Naming
- PascalCase, a domain noun, no prefix (`Linkset`, not `LslLinkset`).
- Boolean props are bare attributes.
- Lists use `{["a","b"]}` and nothing richer, to stay compatible with `feature_mdx.py`.

### Import barrel
Authors write one line:

```mdx
import { RecipeMeta, Steps, Linkset, ScriptFile, Requires } from '~/components/authoring';
```

Optionally, auto-import via an MDX components map later. Explicit imports stay greppable and
work with `feature_mdx.py`.

### Discovery
- `docs/components.md` gives each component its syntax, props and a link to its showcase
  anchor, linked from `docs/README.md`. Each component file opens with a JSDoc block that
  mirrors it.
- `editing-feature-pages.md` and `style/feature-pages.md` get a "Components" pointer.

### Showcase page
- Path: `src/content/docs/meta/components.mdx`.
- Frontmatter: `pagefind: false`, `sidebar: { hidden: true }`, and
  `head: [{ tag: meta, attrs: { name: robots, content: noindex } }]`.
- It is excluded from the sitemap, via the sitemap filter in `astro.config`.
- It shows every component in every state: light and dark, long content, and an overflowing
  Linkset. It doubles as the test fixture.

### Tests
- **Build-output checks**, run in the existing test runner against `dist/`:
  - Showcase HTML contains the expected structure (one popover per distinct API, `<details
    name>` on an exclusive FAQ, a `<figure>` with `<figcaption>`, an SVG with `role="img"`
    plus a hidden list).
  - No page has a hover-card id without a matching popover.
  - The hover-card HTML budget is under 15 KB per page, as a warning.
- **Markdown export:** snapshot tests of `page-markdown.ts` on the showcase source, so every
  component has a defined Markdown form.
- **No remote assets:** the existing link checker runs over the showcase. Add a unit test that
  `Figure` rejects `http(s)` sources.
- **a11y:** there are none today. Add `@axe-core/playwright` (dev-only, local) against the
  showcase in light and dark, plus a keyboard test: Tab to an API link opens the card, Esc
  closes it, and tap behaviour is emulated.
- **Build time:** record `astro build` duration before and after Batch 1, with a budget of
  +5 %.

## Open questions

1. **Mermaid or a custom diagram renderer?** Recommended: a custom build-time SVG renderer
   (dagre layout, CSS-variable theming). Revisit Mermaid only if authors need sequence or
   class diagrams.
2. **Hover-card data source and payload?** Recommended: a slim generated
   `hovercards.json` (~500 KB, build only), with per-page inline popovers for distinct APIs
   only (~6–10 KB of HTML per heavy page). Don't ship a client-side JSON index.
3. **Where does the SLua code come from?** Recommended: hand-written by authors in each
   CodeGroup, with a lint that warns when an LSL block has no SLua sibling only on pages that
   opt in. Don't machine-translate. Add a vendored Luau grammar first.
4. **Requires vocabulary?** Recommended: a closed set: `permissions[]` (catalog constants),
   `experience`, `land` (build | scripts | owner | group), `attachment`, `seated`, `owner`.
   Unknown values fail the build. Extend as needed.
5. **Limit anchors?** Only section ids exist. Recommended: add per-row ids to the Limits page
   (stable slugs such as `#script-memory`) in the Batch 3 PR, and validate at build time.
6. **Should BuildStep titles be headings?** Recommended: no, keep them out of the TOC. Recipes
   with long builds can use real `##` sections between Steps.
7. **Tap behaviour for hover cards?** Recommended: on touch, the first tap opens the card and
   the card links to the reference. Alternative: no cards on touch at all. Simpler, but loses
   value on mobile.
8. **Apply hover cards on API pages themselves?** Recommended: yes, except self-links. Skip
   links inside headings and the sidebar.
9. **Callout directive syntax (`:::gotcha`)?** Recommended: not in v1. Use components only,
   so there is one way to write them.
10. **Restyle the four built-in Starlight asides at the same time?** Recommended: yes, so all
    callouts share one look.

## Phasing

| Phase | Work | Effort | Notes |
|---|---|---|---|
| 0 | Scaffold `src/components/authoring/`, barrel, `shared/` tokens and popover CSS, showcase page (hidden), `docs/components.md` stub, split `page-markdown` into per-batch case files, add axe and the build-output test harness | 1 day | Must land first, because everything else depends on it |
| 1 | Batch 3 asides and disclosure (simplest; restyles asides; Limit anchors) | 1.5 days | Low risk |
| 2 | Batch 2 recipe kit (Linkset parser is the largest item) | 3 days | Linkset syntax needs user sign-off |
| 3 | Batch 1 hover cards (data script, rehype, popover, intent script, tap) | 2.5 days | Most cross-page impact; measure build time |
| 4 | Batch 4 guide kit: Param/Returns (0.5 d), CodeGroup + Luau grammar (1 d), flow renderer (2.5 d) | 4 days | Flow layout quality is the main unknown |
| 5 | Optional ideas, then real-page conversions | later | |

**Parallelisation.** After Phase 0, batches 1–4 can run as four agents at once. Each owns
only its `src/components/authoring/<batch>/` directory, its
`src/lib/page-markdown/<batch>.ts` file and its showcase section. The showcase should be
split into partials (`src/content/docs/meta/_showcase/<batch>.mdx`) so there are no edit
conflicts. Shared files (the barrel, `ec.config.mjs` for the Luau grammar, `astro.config`
for the rehype plugin, `custom.css`) are edited by a single integrator at merge time.

**Risks.**
- Hover cards on every page could bloat HTML or slow the build. Mitigate with per-page
  dedupe, a size budget and memoised data.
- `interestfor` support differs between browsers. The small intent script covers the gap,
  and links always work.
- Starlight upgrades could change Aside and Steps markup that our wrappers rely on. Pin
  behaviour with snapshot tests.
- The Luau grammar may not cover SLua-specific syntax (`ll.*` namespaces, types). Accept that
  minor highlighting gaps are possible.
- Dagre layout quality on cyclic state graphs is unknown. Prototype in Phase 4 before
  committing, with a simple layered layout as the fallback.
- Every component adds a `page-markdown.ts` case. Missing one silently degrades the export, so
  add a test that fails on unknown capitalised tags.
