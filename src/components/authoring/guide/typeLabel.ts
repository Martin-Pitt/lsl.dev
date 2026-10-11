/** Shared by Param and Returns: the type highlighted as inline LSL, linked to its type page when there is one. */
import { inlineLsl } from '../../../lib/inline-lsl';
import { typeHref } from '../../../lib/catalog';

export async function typeLabel(type: string): Promise<string> {
	const html = await inlineLsl(type, { link: false });
	const href = typeHref(type);
	return href ? `<a class="lsl-ref au-param-type" href="${href}">${html}</a>` : `<span class="au-param-type">${html}</span>`;
}
