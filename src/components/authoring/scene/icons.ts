/**
 * Inline SVG icons for <Item> types (16px grid, stroke in currentColor), and the closed list of
 * Second Life inventory types.
 */
export const ITEM_TYPES = ['script', 'notecard', 'sound', 'texture', 'animation', 'object', 'landmark', 'clothing', 'bodypart', 'gesture', 'material', 'settings'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

const paths: Record<ItemType, string> = {
	script: '<path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5M9 3 7 13"/>',
	notecard: '<path d="M3.5 2h6l3 3v9h-9zM9.5 2v3h3M5.5 8h5M5.5 10.5h5"/>',
	sound: '<path d="M2.5 6h2.5L8.5 3v10L5 10H2.5zM11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.7a6 6 0 0 1 0 8.6"/>',
	texture: '<rect x="2.5" y="2.5" width="11" height="11" rx="1"/><path d="m2.5 11 3.5-3.5 3 3 1.5-1.5 3 3"/><circle cx="10.5" cy="5.5" r="1"/>',
	animation: '<circle cx="8" cy="3" r="1.5"/><path d="M8 4.5v4.5L5.5 13.5M8 9l2.5 4.5M4.5 6.5 8 6l3.5 1.5"/>',
	object: '<path d="M8 1.8 13.5 5v6L8 14.2 2.5 11V5zM2.5 5 8 8.2 13.5 5M8 8.2v6"/>',
	landmark: '<path d="M8 14s-4.5-4.4-4.5-7.7a4.5 4.5 0 0 1 9 0C12.5 9.6 8 14 8 14z"/><circle cx="8" cy="6.3" r="1.6"/>',
	clothing: '<path d="M5.5 2 2 4.5 3.5 7.5 5 7v7h6V7l1.5.5L14 4.5 10.5 2c0 1.2-1.1 2-2.5 2s-2.5-.8-2.5-2z"/>',
	bodypart: '<circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/>',
	gesture: '<path d="M5 8.5V3.8a1 1 0 0 1 2 0V7.5m0-4.5a1 1 0 0 1 2 0v4.5m0-3.5a1 1 0 0 1 2 0V8m0-2.5a1 1 0 0 1 2 0V10a4.5 4.5 0 0 1-8.4 2.3L3 9.5a1 1 0 0 1 1.7-1z"/>',
	material: '<circle cx="8" cy="8" r="5.5"/><path d="M8 2.5a5.5 5.5 0 0 0 0 11zM5 5.5l.5.5"/>',
	settings: '<path d="M2.5 4.5h7M12.5 4.5h1M2.5 11.5h1M6.5 11.5h7"/><circle cx="11" cy="4.5" r="1.5"/><circle cx="5" cy="11.5" r="1.5"/>',
};

export const icon = (t: ItemType) =>
	`<svg class="au-inv__icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[t]}</svg>`;
