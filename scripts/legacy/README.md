# Archived generators (unsupported)

`autogenerate-grammar.js`, `autogenerate-json.js` and `autogenerate-stubs.js` are the
pre-modernization generators that fetched definitions and wrote MDX stubs. They are
kept only for historical reference.

- They are **not supported**, are not wired into `package.json` scripts or CI, and may
  no longer run against the current tree.
- Some of them made network requests. Do not run them: the project policy forbids any
  automated request to the Second Life Wiki.
- The supported pipeline is `scripts/import-datasets.py` (see the root `README.md`).
