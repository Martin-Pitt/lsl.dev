/**
 * NEW / U badges for reference lists, from lsl-definitions git history
 * (data/sources/definitions-history.json, merged into catalog entries by the importer).
 *
 * entry.added   — 'YYYY-MM-DD' the API first appeared upstream, or null if it existed at the
 *                 baseline import (catalog.meta.definitionsHistory.baseline), i.e. not new.
 * entry.updated — 'YYYY-MM-DD' of the newest behaviour change (arguments/types, return, sleep,
 *                 energy, permissions/experience flags, deprecated, value...), never wording.
 *
 * recentBadges() returns 'new' when added is within RECENT_MONTHS of `now` (the build date by
 * default), else 'updated' when updated is, else null. NEW wins over U.
 */
import { catalog } from './catalog';

export const RECENT_MONTHS = 12;
/** Evaluated once per build, so a static site's badges age with each rebuild. */
export const buildDate = new Date();
export const definitionsHistory = (catalog.meta as { definitionsHistory?: { commit: string; commitDate: string; baseline: { commit: string; date: string } } }).definitionsHistory;

export type RecentBadge = 'new' | 'updated';
export type RecentInfo = { badge: RecentBadge | null; added: string | null; updated: string | null };

function cutoff(now: Date, months = RECENT_MONTHS) {
	const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, now.getUTCDate()));
	return d.toISOString().slice(0, 10);
}

export function recentBadges(entry: { added?: string | null; updated?: string | null }, now: Date = buildDate): RecentInfo {
	const added = entry.added ?? null;
	const updated = entry.updated ?? null;
	const since = cutoff(now);
	const baseline = definitionsHistory?.baseline.date;
	const badge: RecentBadge | null =
		added && added >= since ? 'new'
		: updated && updated >= since && updated !== baseline ? 'updated'
		: null;
	return { badge, added, updated };
}
