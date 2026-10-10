/**
 * Links to definition categories. Use `categoryLink(id)` (or `categoryLinkHref(id)`) instead of
 * building /categories/<id>/ URLs: a category with a single public member has no page of its own,
 * so its link goes straight to that member, labelled "Category → item".
 */
import data from '../data/catalog.json';
import { categoryMembers, singleMemberCategories } from './category-members.mjs';

const labels = new Map(data.categories.map(c => [c.id, c.label]));
export const membersByCategory = categoryMembers(data);
export const singleMember = singleMemberCategories(data);

/** Categories that get a /categories/<id>/ page (two or more public members). */
export const categoryPageIds = data.categories.map(c => c.id).filter(id => !singleMember.has(id));

export function categoryLink(id: string): { href: string; label: string; single: boolean } {
	const one = singleMember.get(id);
	if (one) return { href: one.href, label: `${one.label} → ${one.name}`, single: true };
	return { href: `/categories/${encodeURIComponent(id)}/`, label: labels.get(id) ?? id, single: false };
}
export function categoryLinkHref(id: string) { return categoryLink(id).href; }
