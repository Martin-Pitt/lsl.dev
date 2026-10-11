/**
 * Shapes shared by the Markdown export (src/lib/page-markdown.ts) and its case files.
 * Integrator-owned: batch agents read these types but do not change them.
 */
export type Attrs = Record<string, any>;
export type Source = { url?: string; wiki?: string; license?: string } | undefined;
export type MarkdownPage = { id: string; body?: string; data: { title: string; description?: string; source?: Source } };

/**
 * One case file per component batch, registered in ./index.ts. A tag may be claimed by only one
 * file. Every authoring component (imported from src/components/authoring) must have a case, or
 * the build fails (guard in ../page-markdown.ts). Other tags without a case keep their children.
 * - `selfClosing`: `<Tag ... />` (or the opening tag of a paired component that renders its own
 *   content) becomes this text. Return `undefined` to fall back to `paired`.
 * - `paired`: `<Tag>children</Tag>` becomes open + converted children + close.
 * - `passthrough`: tags whose children are kept as they are and that add no text.
 */
export type CaseFile = {
	selfClosing?: Record<string, (a: Attrs, page: MarkdownPage) => string | undefined>;
	paired?: Record<string, (a: Attrs, page: MarkdownPage) => [string, string]>;
	passthrough?: string[];
};
