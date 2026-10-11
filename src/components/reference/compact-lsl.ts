/**
 * Shrinks highlighted inline LSL (src/lib/inline-lsl.ts) for long list pages: every token's
 * `style="--shiki-dark:…;--shiki-light:…"` becomes a short shared class (`k0`, `k1`, …) that sets
 * the same two variables, so the site's `code.lsl-inline span` colouring still applies.
 * Use one registry per page and emit `registry.css(scope)` once.
 */
export function styleRegistry() {
	const classes = new Map<string, string>();
	return {
		compact(html: string) {
			return html.replace(/ style="(--shiki-dark:[^;"]*;--shiki-light:[^;"]*)"/g, (_, style: string) => {
				let cls = classes.get(style);
				if (!cls) classes.set(style, (cls = `k${classes.size}`));
				return ` class="${cls}"`;
			});
		},
		css(scope: string) {
			return [...classes].map(([style, cls]) => `${scope} .${cls}{${style}}`).join('');
		},
	};
}
