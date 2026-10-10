# Page actions menu (copy / view Markdown, open in ChatGPT or Claude)

MDX content pages (API pages, features, reference, fundamentals, controls, types) show a
split button next to the title, as on slua.dev: **Copy page** copies the page as Markdown,
and the menu adds **View as Markdown**, **Open in ChatGPT** and **Open in Claude**.

| Piece | File |
|---|---|
| Button and menu | `src/components/starlight/PageActions.astro` |
| Placement (beside the h1, above breadcrumbs and chips) | `src/components/starlight/PageTitle.astro` |
| Markdown endpoint, `/<page>/index.md` and `/index.md` | `src/pages/[...page]/index.md.ts` |
| MDX to Markdown conversion | `src/lib/page-markdown.ts` |

- The Markdown is built from the MDX source, not scraped from HTML. Imports and JSX
  expressions are dropped, and the data-driven components are expanded from `catalog.json`:
  `<LSLFunction>`/`<LSLEvent>`/`<LSLConstant>` become a signature block with parameters and facts,
  `<ConstantGroup>` becomes an `lsl` block of members, `<Signatures>` becomes a linked list,
  `<Box>` becomes a `##` heading, `<SeeAlso>`/`<FeatureFooter>`/`<Attribution>`/`<WikiSource>`
  become links and the CC BY-SA credit. Code is copied verbatim. Unknown components keep their
  children. When you add a new component to MDX pages, add a case in `page-markdown.ts`.
- Astro-route pages (catalog lists, categories, constant groups, prototypes, the wiki archive)
  have no Markdown source. PageTitle renders the menu only when the route's entry is a file in the
  docs collection, so those pages show no menu.
- ChatGPT and Claude are plain links (`chatgpt.com/?q=…`, `claude.ai/new?q=…`) whose prompt
  points at the page's `.md` URL on `site`. They are never fetched at build time. Icons are inline
  SVG, so no remote assets are loaded, and `test:links` checks the `.md` links like other local links.
- Without JavaScript the menu still opens (`<details>`), the links work and the copy buttons are hidden.

## Why not `starlight-contextual-menu`

slua.dev uses `starlight-contextual-menu` with `starlight-markdown`. At the latest versions
(both 0.1.5, checked 2026-10-10) their peer range is `astro ^5.0.0`. `bun add`/`npm install`
refuse them on Astro 7 without legacy peer resolution. The code would load on Astro 7, but it does not fit this site:

- it does not override PageTitle; a global client script finds `.sl-container > h1` and sets
  `display: flex; justify-content: space-between` on its parent, which would lay our title,
  breadcrumbs and chips out in one row;
- it runs on every page, including Astro-route pages that have no Markdown (the copy fails and "View" 404s);
- `starlight-markdown` serves `# title` plus the raw MDX body, so imports and `<LSLFunction … />` appear in the copied text;
- the prompt URLs are not encoded.

The local version is about 300 lines with no new dependencies. Do not add the plugin with
`overrides` or legacy peer deps unless a release supports Astro 7 and solves the points above.
