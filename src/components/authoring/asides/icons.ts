/** Inline SVG icons of the asides batch (Starlight's Icon cannot register custom icons). 24px grid, currentColor. */
const svg = (body: string) => `<svg class="starlight-aside__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const asideIcons = {
	/** Caveat: a circled "i" with a hanging stroke, read as "mind the fine print". */
	caveat: svg('<circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><path d="M12 8h.01"/>'),
	/** Limit: a gauge with its needle near the end stop. */
	limit: svg('<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l5-5"/><path d="M4 18h16"/>'),
	/** Gotcha: a warning triangle. */
	gotcha: svg('<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
	/** Experimental: a lab flask. */
	experimental: svg('<path d="M9 3h6"/><path d="M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>'),
	/** Performance: a lightning bolt. */
	performance: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
	/** Chevron for <Details> summaries. */
	chevron: '<svg class="au-details__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
};
