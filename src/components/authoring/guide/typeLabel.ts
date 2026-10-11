/** Shared by Param and Returns: the type highlighted as inline LSL, linked to its type page when there is one. */
import { inlineLsl } from '../../../lib/inline-lsl';

/** Types with a page under src/content/docs/types/. */
const TYPE_PAGES = new Set(['integer', 'float', 'string', 'key', 'vector', 'rotation', 'list']);

export async function typeLabel(type: string): Promise<string> {
	const html = await inlineLsl(type, { link: false });
	return TYPE_PAGES.has(type) ? `<a class="lsl-ref au-param-type" href="/types/${type}/">${html}</a>` : `<span class="au-param-type">${html}</span>`;
}
