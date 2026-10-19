/** Experimental features: shared by <Experimental>, ApiHeader and the Markdown export (src/lib/page-markdown). */

/** Categories whose APIs Linden Lab may still change, with the feature name used in the callout. */
export const experimentalCategories: Record<string, string> = { game_control: 'Game control' };

/** The feature name of the first experimental category among `categories`, if any. */
export const experimentalFeature = (categories: string[] = []) => categories.map(c => experimentalCategories[c]).find(Boolean);

/** The callout's default sentence. */
export const experimentalText = (feature?: string) => `${feature ? `${feature} is` : 'This feature is'} experimental. Linden Lab may still change its behaviour, functions and constants, so scripts written against it today may need updating.`;
