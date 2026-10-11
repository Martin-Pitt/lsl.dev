/**
 * Markdown export cases for Batch 2 (recipe kit): RecipeMeta, Steps/BuildStep, Linkset, ScriptFile, Requires.
 * Owned by the recipe batch agent. Each component gets a case here; see ./types.ts and
 * docs/design/components-plan.md for the agreed Markdown form of each component.
 */
import type { CaseFile } from './types';

export default {
	selfClosing: {},
	paired: {},
	passthrough: ['Steps'], // Starlight Steps; the recipe kit wraps it
} satisfies CaseFile;
