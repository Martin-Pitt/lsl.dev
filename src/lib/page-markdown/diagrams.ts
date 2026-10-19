/**
 * Markdown export case for the diagrams batch: Diagram.
 *
 * - Diagram: `*[Diagram: title]* description`, then the caption (the prop, or the diagram's own,
 *   in italics; Markdown children as they are). The description is the SVG's <desc>, so readers of
 *   the Markdown get what the picture shows.
 */
import type { CaseFile } from './types';
import { diagram } from '../../components/authoring/diagrams/registry';

const body = (a: Record<string, any>) => {
	const def = diagram(a.name);
	return `*[Diagram: ${def.title}]* ${def.desc}`;
};
const caption = (a: Record<string, any>) => {
	const text = a.caption ?? diagram(a.name).caption;
	return text ? `\n\n*${text}*` : '';
};

export default {
	selfClosing: {
		Diagram: a => `${body(a)}${caption(a)}`,
	},
	paired: {
		Diagram: a => [`\n\n${body(a)}${a.caption ? caption(a) : ''}\n\n`, '\n\n'],
	},
} satisfies CaseFile;
