# Contributor docs

Internal guides for writing and maintaining lsl.dev. These are not published on the site
(the site's content lives in `src/content/docs/`).

Commands are given as `bun run <script>`; install with `bun install` (`bun.lock` is the only
lockfile). `npm run <script>` still works but `npm install` is not a supported install path.

- [style/feature-pages.md](style/feature-pages.md): how feature pages are written, modelled on
  the Combat2 wiki page
- [editing-feature-pages.md](editing-feature-pages.md): editing or adding a feature page, the
  feature components, and what reads the pages (sidebar, API feature chips)
- [editing-api-pages.md](editing-api-pages.md): editing or adding a function, event or constant
  page, the API components, and what `bun run generate:mdx` does and does not overwrite
- [page-actions.md](page-actions.md): the copy/view Markdown and ChatGPT/Claude menu beside page
  titles, the `.md` endpoints, and why slua.dev's starlight-contextual-menu plugin is not used
- [sidebar.md](sidebar.md): how the sidebar is configured, nested groups, and split groups whose
  label links to an overview page
- [open-source-snippets.md](open-source-snippets.md): bringing open-source LSL code into guides:
  what we accept, no preprocessor, attribution and bug-fix notes
