/**
 * Markdown export cases for the media batch: Figure (with zoom), Compare, Hotspots/Hotspot,
 * Gallery. Owned by the media batch. Image URLs come from page.images, filled by the .md route
 * (src/pages/[...page]/index.md.ts) for every src/before/after of these components.
 *
 * - Figure: `![alt](built URL)` and the caption (a prop in italics, or the children as they are).
 *   With zoom, the full-size URL. Without a resolved URL, `*[Figure: alt]*`.
 * - Compare: `**Before label**`, its image, `**After label**`, its image, then the caption.
 * - Hotspots: the image, a numbered list of `**label**: note`, then the caption.
 * - Gallery: its figures, one after another.
 */
import type { CaseFile, MarkdownPage } from './types';
import { imageKey, indent } from './util';

const image = (src: unknown, alt: string, page: MarkdownPage, width?: unknown) => {
	const url = typeof src === 'string' ? page.images?.get(imageKey(src, width)) : undefined;
	return url ? `![${alt}](${url})` : `*[Figure: ${alt}]*`;
};
const figureImage = (a: Record<string, any>, page: MarkdownPage) => image(a.src, a.alt, page, a.zoom ? undefined : a.width);
const caption = (a: Record<string, any>) => (a.caption ? `\n\n*${a.caption}*` : '');
const compare = (a: Record<string, any>, page: MarkdownPage) =>
	`**${a.beforeLabel ?? 'Before'}**\n\n${image(a.before, a.beforeAlt, page)}\n\n**${a.afterLabel ?? 'After'}**\n\n${image(a.after, a.afterAlt, page)}${caption(a)}`;

export default {
	selfClosing: {
		Figure: (a, page) => `${figureImage(a, page)}${caption(a)}`,
		Compare: (a, page) => compare(a, page),
	},
	paired: {
		Figure: (a, page) => [`\n\n${figureImage(a, page)}${caption(a)}\n\n`, '\n\n'],
		Compare: (a, page) => [`\n\n${compare(a, page)}\n\n`, '\n\n'],
		Hotspots: (a, page) => [`\n\n${image(a.src, a.alt, page, a.width)}\n\n`, `${caption(a)}\n\n`],
	},
	transform: {
		Hotspot: (children, a) => `\n1. **${a.label}**${children.trim() ? `: ${indent(children.trim(), 3)}` : ''}\n`,
	},
	passthrough: ['Gallery'],
} satisfies CaseFile;
