# Files for LLMs and tools

lsl.dev publishes static, build-time files so that LLMs, crawlers and scripts can find and read the
docs without scraping HTML. Everything comes from `src/data/catalog.json` and the MDX pages; no
network access at build time.

| URL | Source | Contents |
|---|---|---|
| `/llms.txt` | `src/pages/llms.txt.ts` | [llmstxt.org](https://llmstxt.org) index: what the site is, licensing, URL scheme, section anchors, machine-readable files, key pages, deprecated functions to avoid |
| `/api.json` | `src/pages/api.json.ts`, `src/lib/llms.ts` | Every public function, event and constant (signature, parameters, description, sleep, energy, permissions, experience/god-mode flags, categories, `replaces`), constant groups, categories and a `deprecated` section (`name`, `use`, `status: "deprecated, use X"`), each with absolute `url` and `markdown`. Minified, about 720 KB (120 KB gzipped) |
| `/llms-full.txt` | `src/pages/llms-full.txt.ts` | The `.md` export of every function, event and constant page, concatenated (about 3.9 MB, 670 KB gzipped). Set `LLMS_FULL = false` there to drop it from llms.txt |
| `/<page>/index.md` | `src/pages/[...page]/index.md.ts` | Markdown of every MDX page ([page-actions.md](page-actions.md)); starts with the title and a one-line pointer to `/api.json` and `/llms.txt` |
| `/robots.txt` | `public/robots.txt` | Allows all crawlers, AI crawlers included; points to the sitemap and llms.txt. Neither Astro nor Starlight emits one |

`api.json` has `schemaVersion` (bump it when fields change shape), `generated`, and `source` with
the definitions file's sha256 and upstream URL. The bulky wiki metadata is left out. Fields that would be
false or empty are omitted. Functions, events and constants carry `added` and `updated` (`YYYY-MM-DD`) from
lsl-definitions git history when known: `added` is omitted for items that existed at the baseline import
(`source.definitionsHistory.baseline`), and `updated` is the newest behaviour change (arguments and their types,
return, sleep, energy, permission/experience flags, deprecated, constant type/value), never wording.
See `data/sources/README.md`. Deprecated and private items have no pages, so they are not in the main lists.

## In the HTML

- Every page: `<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">` (Starlight
  `head` in `astro.config.mjs`). llms.txt defines no `rel`. `alternate` with a type and title is
  the form most sites use, and `help` would claim the file is user help.
- Pages with an MDX source: `<link rel="alternate" type="text/markdown" href="…/index.md">`, added
  in `src/route-middleware.ts`. Astro-route pages (catalog lists, categories, constant groups) have
  no Markdown and get no link.
- API pages: schema.org `TechArticle` JSON-LD (name, definitions one-liner, url, `dateModified` from
  frontmatter `source.date`, CC BY-SA 3.0 license when the page has wiki-derived prose, the signature as
  a `SoftwareSourceCode` part). The home page has a `WebSite` block. Both come from `src/route-middleware.ts`.
- `data-nosnippet` on hover cards, the page actions menu, breadcrumbs and chips, so snippets and
  scrapers skip that text. It is not on the sidebar, because the Starlight markup has no wrapper
  element to put it on without changing the layout. Note that Google honours it only on `span`, `div` and `section`.
