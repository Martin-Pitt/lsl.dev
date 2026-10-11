/**
 * Markdown export cases for Batch 1 (API hover cards): NoCard. Links export as plain links, so most of this batch needs no case.
 * Owned by the hovercards batch agent. Each component gets a case here; see ./types.ts and
 * docs/design/components-plan.md for the agreed Markdown form of each component.
 */
import type { CaseFile } from './types';

export default {
	selfClosing: {},
	paired: {},
	passthrough: [],
} satisfies CaseFile;
