/**
 * Markdown export cases for Batch 4 (guide kit): Param, Params, Returns (CodeGroup, StateFlow and
 * EventFlow are deferred). Owned by the guide batch agent.
 *   <Param name="target" type="key" required>Avatar to follow.</Param>  ->  - `target` (key, required): Avatar to follow.
 *   <Returns type="integer">TRUE if found.</Returns>                    ->  **Returns** (integer): TRUE if found.
 */
import { code } from './util';
import type { CaseFile } from './types';

const truthy = (v: unknown) => v === true || v === '' || v === 'true';

export default {
	paired: {
		Param: (a) => {
			const facts = [a.type, truthy(a.required) && 'required', a.default !== undefined && `default ${code(String(a.default))}`, truthy(a.deprecated) && 'deprecated'].filter(Boolean);
			const name = truthy(a.deprecated) ? `~~${code(a.name)}~~` : code(a.name);
			return [`- ${name} (${facts.join(', ')}): `, ''];
		},
		Returns: (a) => [`\n\n**Returns** (${a.type}): `, '\n\n'],
		Params: (a) => [a.title ? `\n\n${a.title}:\n` : '\n\n', '\n\n'],
	},
} satisfies CaseFile;
