# Authoring components

The MDX components for guides, recipes, feature pages and API pages, built on Starlight. Design:
[design/components-plan.md](design/components-plan.md). Every component is shown, in every state,
on the hidden showcase page `/meta/components/`
(`src/content/docs/meta/components.mdx`; not in the sidebar, search or sitemap).

Import what you use from the single barrel:

```mdx
import { Gotcha, RecipeMeta, Param } from '~/components/authoring';
```

Starlight's own components (Aside, Tabs, Steps, FileTree, Card, Badge, Icon) and Expressive Code
features (titles, markers, collapse) still work as before.

Rules that apply to every component:

- Props are strings, numbers, booleans or short string lists (`{["a","b"]}`). Boolean props are
  bare attributes.
- Children are Markdown. You never need HTML.
- Every component exports to readable Markdown for the page's `.md` version (Copy page, View as
  Markdown). The build fails if an authoring component has no Markdown form.
- Pages need a current evergreen browser (see the required-features note in
  `src/components/authoring/shared/tokens.css`). Nothing needs JavaScript to show its content.

<!-- Each batch fills only its own section below. -->

## Asides and disclosure

Caveat, Gotcha, Performance, Limit, LimitsTable, Details, FAQ, Figure, Since. Showcase:
`/meta/components/#showcase-asides`.

Not built yet.

## Recipe kit

RecipeMeta, ScriptFile, Requires, Linkset, Steps and BuildStep. Showcase:
`/meta/components/#showcase-recipe`.

Not built yet.

## API hover cards

Automatic on links to API pages. Opt out with `<NoCard>` or frontmatter `hoverCards: false`.
Showcase: `/meta/components/#showcase-hovercards`.

Not built yet.

## Guide kit

Param, Params, Returns. Showcase: `/meta/components/#showcase-guide`.

Not built yet.

## Deferred

CodeGroup (LSL ⇄ SLua tabs) and StateFlow/EventFlow diagrams are planned but not scheduled. Use
Starlight Tabs for code tabs in the meantime.
