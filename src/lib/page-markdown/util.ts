/** Small helpers shared by the page-markdown case files. Integrator-owned. */
export const SITE = 'https://lsl.dev';
export const pageHref = (id: string) => (id === 'index' ? '/' : `/${id}/`);
/** Inline code that survives backticks in the content. */
export const code = (s: string) => (s.includes('`') ? `\`\` ${s} \`\`` : `\`${s}\``);
/** Throws a build error naming the missing thing, so a typo in a page fails loudly. */
export const need = <T>(v: T, what: string): NonNullable<T> => { if (!v) throw new Error(`page-markdown: unknown ${what}`); return v as NonNullable<T>; };
