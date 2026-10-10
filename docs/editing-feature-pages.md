# Editing and adding feature pages

Feature pages are hand-written MDX in `src/content/docs/features/<slug>.mdx`, one per slua.dev
feature (same slugs). How to write them is in [style/feature-pages.md](style/feature-pages.md);
this page covers the mechanics. `src/content/docs/features/combat.mdx` is the reference example.

## Page skeleton

```mdx
---
title: "Combat"
description: "One sentence for cards, search and the features index."
---
import { Box, Column, Columns, ConstantGroups, FeatureFooter, Planned, SeeAlso, Signature, Signatures } from '../../../components/features';

Framing intro: two to four short paragraphs, links woven in.

<Columns>
<Column>
<Box title="Concepts">

- Can apply damage [directly](/functions/llDamage/)

</Box>
</Column>
<Column>
<Box title="Functions and events">

<Signatures names={["llDamage", "on_damage"]} />

</Box>
<Box title="Combat Log" href="/wiki/combat-log-84d6ce29/">

One sentence about the sub-topic.

</Box>
</Column>
</Columns>

<Box title="Scripting Details">

<Signatures names={["llDamage"]} descriptions />

</Box>

## Related

<SeeAlso items={["feature:physics", "wiki:Combat Log"]}>
  <Planned>Recipe: a basic gun</Planned>
</SeeAlso>

<FeatureFooter related={["physics"]} categories={["combat"]} archive={["Category:LSL Combat2"]} />
```

Leave a blank line after an opening component tag and before its closing tag, or the Markdown
inside is not parsed. Escape a literal `*` as `\*`, and don't use raw `{`, `}` or `<` in prose.

## Components (`src/components/features/`)

| Component | Use |
|---|---|
| `<Columns>` + `<Column>` | 50/50 top section; one column on narrow screens. Also switches the page to the wide layout |
| `<Box title href?>` | Bordered panel with an h2 heading, linked when `href` is set |
| `<Signatures names={[...]} descriptions?>` | Signature table (type, linked name, typed parameters); `descriptions` adds the LSL Definitions description |
| `<Signature name="…">text</Signature>` | A row inside `<Signatures>` with a hand-written description (Markdown, may contain links) |
| `<ApiLinks names={[...]} />` | Grid of names with their descriptions, for dense lists |
| `<ConstantGroups names={[...]} />` | Links to constant group pages with member counts |
| `<SeeAlso items={[...]}>` | Row of links: `feature:<slug>`, `category:<id>`, `wiki:<archive title>`, or a `/path/`; add `\|Label` to change the text |
| `<Planned>…</Planned>` | A guide, recipe or sub-page that is not written yet (grey, no link) |
| `<FeatureFooter related categories archive />` | Related features, the definition categories this feature is home to, wiki archive pages |

Names are checked at build time: an unknown API, group, feature, category or archive title fails
the build. Props must be JSON arrays (double quotes, no trailing commas) because
`src/lib/feature-mdx.mjs` and `scripts/lib/feature_mdx.py` read them from the source.

## What reads the pages

- `astro.config.mjs` (through `scripts/feature-index.mjs`): Features sidebar order (by slug),
  Reference sidebar grouping (from `<FeatureFooter categories>`); sub-pages are nested under their feature.
- `src/lib/features.ts`: `featurePages`, `featurePageMap`, `featurePageByCategory`, `featureHref`
  and `featuresForApi(entry)`, which gives the feature chips for an API page. A page "links" an API
  if any component lists it or the prose links `/functions/<name>/`, `/events/<name>/` or
  `/constants/<name>/`; a constant group counts through `<ConstantGroups>` or `/constants/groups/<name>/`.
- `src/data/feature-clusters.json` is a **generated** index for older code. After editing pages,
  run `node scripts/feature-index.mjs`; `npm run test:data` fails if it is stale.

## Adding a page

1. Create `src/content/docs/features/<slug>.mdx` from the skeleton above.
2. Give it `<FeatureFooter categories={[...]}>` if it should own definition categories (each
   category belongs to exactly one feature).
3. Run `node scripts/feature-index.mjs`, `npm run test:data`, `npm run build` and `npm run test:links`.
   The tests check that every public function and event is linked from at least one feature page
   (except `llFindNotecardTextCount`), that every constant group is linked, and that all links resolve.
   If the new page is a slua.dev feature, add it to `SLUA_FEATURES` in `scripts/lib/test_features.py`.

`python scripts/check-feature-migration.py` compares the pages with the snapshot of the old JSON
(`scripts/lib/fixtures/feature-clusters-pre-mdx.json`) and reports anything that was dropped.
