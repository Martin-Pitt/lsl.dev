/**
 * rehype-api-hovercards: adds a supplementary hover card to links to API pages (Batch 1).
 * Owned by the hovercards batch agent. The slot is already registered in astro.config after
 * rehype-inline-lsl, so the batch only fills in this file. Markup and rules are in
 * docs/design/components-plan.md ("Batch 1: API hover cards"). In short: one `popover="hint"`
 * card per link, inserted right after the link in the content tree; the link stays a plain
 * `<a href>` (interestfor only, never popovertarget); opens on hover and focus, never on tap;
 * the card is aria-hidden and data-pagefind-ignore.
 *
 * Per-page opt-out: frontmatter `hoverCards: false` (already in the content schema). Card data:
 * src/data/hovercards.json, written by scripts/build-hovercards.ts before dev and build. It may
 * be missing (astro check, fresh clones), so load it lazily and treat a missing file as "no cards".
 *
 * Scaffold stub: does nothing yet.
 */
export default function rehypeApiHovercards() {
	return (_tree: unknown) => {};
}
