/**
 * Shapes shared by the Markdown export (src/lib/page-markdown.ts) and its case files.
 * Integrator-owned: batch agents read these types but do not change them.
 */
export type Attrs = Record<string, any>;
export type Source = { url?: string; wiki?: string; license?: string } | undefined;
/** `images`: built URLs of the page's media-component images (Figure, Compare, Hotspots), keyed by imageKey() (filled by the .md route). */
export type MarkdownPage = { id: string; body?: string; data: { title: string; description?: string; source?: Source }; images?: Map<string, string> };
/** Where a case sits: the names of the open components around it, outermost first. */
export type Context = { parents: string[] };

/**
 * One case file per component batch, registered in ./index.ts. A tag may be claimed by only one
 * file. Every authoring component (imported from src/components/authoring) must have a case, or
 * the build fails (guard in ../page-markdown.ts). Other tags without a case keep their children.
 * - `selfClosing`: `<Tag ... />` (or the opening tag of a paired component that renders its own
 *   content) becomes this text. Return `undefined` to fall back to `paired`.
 * - `paired`: `<Tag>children</Tag>` becomes open + converted children + close.
 * - `transform`: `<Tag>children</Tag>` becomes whatever this returns, given the converted
 *   children (fenced code included). Use it when the children need rewriting (e.g. quoting every
 *   line). Takes precedence over `paired`.
 * - `passthrough`: tags whose children are kept as they are and that add no text.
 * Every case also gets a Context with the open parent components (e.g. a Details inside a FAQ).
 */
export type CaseFile = {
	selfClosing?: Record<string, (a: Attrs, page: MarkdownPage, ctx: Context) => string | undefined>;
	paired?: Record<string, (a: Attrs, page: MarkdownPage, ctx: Context) => [string, string]>;
	transform?: Record<string, (children: string, a: Attrs, page: MarkdownPage, ctx: Context) => string>;
	passthrough?: string[];
};
