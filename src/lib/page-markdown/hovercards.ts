/**
 * Markdown export cases for Batch 1 (API hover cards). The export reads the MDX source, where the
 * cards don't exist (rehype adds them to the HTML only), so links export as plain links and no
 * card text can leak. <NoCard> keeps its children and adds nothing.
 */
import type { CaseFile } from './types';

export default {
	selfClosing: {},
	paired: {},
	passthrough: ['NoCard'],
} satisfies CaseFile;
