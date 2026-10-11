/**
 * Markdown export cases for Batch 4 (guide kit): FunctionSignature, Param, Params, Returns (CodeGroup,
 * StateFlow and EventFlow are deferred). Owned by the guide batch agent.
 *   <FunctionSignature returns="float" name="F">         ->  ```lsl
 *   <Param type="float" name="t">Pos.</Param>         float F(
 *   <Returns>The value.</Returns>                         float t
 *   </FunctionSignature>                                      )
 *                                                     ```
 *                                                     - `float t`: Pos.
 *                                                     - **Returns** `float`: The value.
 *   Standalone: <Param type="key" name="target">Avatar.</Param>  ->  - `key target`: Avatar.
 *               <Returns type="integer">TRUE if found.</Returns> ->  **Returns** `integer`: TRUE if found.
 * Inside a FunctionSignature, Param and Returns emit marked records (\u0001decl\u0002text\u0003; an empty
 * decl is the Returns) that the FunctionSignature case turns into the code block and the list.
 */
import { code, indent } from './util';
import type { CaseFile } from './types';

const truthy = (v: unknown) => v === true || v === '' || v === 'true';
const inSignature = (parents: string[]) => parents.at(-1) === 'FunctionSignature';
const record = (decl: string, text: string) => `\u0001${decl}\u0002${text.trim()}\u0003`;

export default {
	transform: {
		FunctionSignature: (children, a) => {
			const items = [...children.matchAll(/\u0001([^\u0002]*)\u0002([\s\S]*?)\u0003/g)];
			const params = items.filter(m => m[1]);
			const ret = items.find(m => !m[1]);
			const head = `${a.returns && a.returns !== 'void' ? `${a.returns} ` : ''}${a.name}(`;
			const sig = params.length
				? `${head}\n${params.map((m, i) => `    ${m[1].replace(/^~|~$/g, '')}${i < params.length - 1 ? ',' : ''}`).join('\n')}\n)`
				: `${head})`;
			const list = params.map(m => {
				const dep = m[1].startsWith('~');
				const decl = m[1].replace(/^~|~$/g, '');
				return `- ${dep ? `~~${code(decl)}~~ (deprecated)` : code(decl)}: ${indent(m[2], 2)}`;
			});
			if (ret) list.push(`- **Returns**${a.returns ? ` ${code(a.returns)}` : ''}: ${indent(ret[2], 2)}`);
			return `\n\n\`\`\`lsl\n${sig}\n\`\`\`\n\n${list.join('\n')}\n\n`;
		},
		/** Block children (a second paragraph, a fence, a nested Details) are indented under the item. */
		Param: (children, a, _page, ctx) => {
			const decl = `${a.type} ${a.name}`;
			if (inSignature(ctx.parents)) return record(truthy(a.deprecated) ? `~${decl}~` : decl, children);
			const name = truthy(a.deprecated) ? `~~${code(decl)}~~ (deprecated)` : code(decl);
			return `- ${name}: ${indent(children.trim(), 2)}`;
		},
		Returns: (children, a, _page, ctx) => {
			if (inSignature(ctx.parents)) return record('', children);
			return `\n\n**Returns**${a.type ? ` ${code(a.type)}` : ''}: ${children.trim()}\n\n`;
		},
	},
	paired: {
		Params: (a) => [a.title ? `\n\n${a.title}:\n` : '\n\n', '\n\n'],
	},
} satisfies CaseFile;
