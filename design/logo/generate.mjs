// Generates the lsl.dev logo: an S with blue L terminals (reading L-S-L) cut out of a page with an
// upper-left fold, plus the "lsl.dev" lettering. Chosen from the logo prototype rounds as "33 Left
// Fold" (mark) with the lettering of "18 Continuous Scroll". Run from the repo root:
//
//   bun design/logo/generate.mjs
//
// Writes design/logo/assets/* and the copies the site uses: src/assets/logo.{light,dark}.svg (hero
// mark), src/assets/wordmark.{light,dark}.svg (header lockup), public/favicon.svg and
// public/apple-touch-icon.png.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const out = path.join(here, 'assets');

// Palette: navy, accent blue, light tint. "light"/"dark" name the background the asset sits on.
const N = '#16254D', B = '#3366FF', T = '#C4D2FF';
const palette = {
	light: { page: N, fold: '#0C1836' },
	dark: { page: T, fold: '#A5B4E0' },
};

// Geometry on a 16-unit grid. The S contour; its two ends are the blue L terminals.
const S = 'M7 3H13V7H11V5H7C4.33 5 4.33 7 7 7H9C14.33 7 14.33 13 9 13H3V9H5V11H9C11.67 11 11.67 9 9 9H7C1.67 9 1.67 3 7 3Z';
const TERMINALS = 'M9 3H13V7H11V5H9Z M3 9H5V11H7V13H3Z';
const page = { left: 1, right: 15, top: 1, bottom: 15, radius: 0.35, fold: 2 };

// Lettering paths of "lsl.dev" (custom l feet, flowing s, round dot), drawn in navy.
const lettering = fs.readFileSync(path.join(here, 'lettering.svg.txt'), 'utf8').trim();

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const svg = (w, h, label, body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">\n<title>${esc(label)}</title>\n${body}\n</svg>\n`;
const pathEl = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;

function pageShape() {
	const { left: l, right: r, top: t, bottom: b, radius: q, fold: f } = page;
	const outer = `M${l + f} ${t} H${r - q} Q${r} ${t} ${r} ${t + q} V${b - q} Q${r} ${b} ${r - q} ${b} H${l + q} Q${l} ${b} ${l} ${b - q} V${t + f} L${l + f} ${t} Z`;
	const fold = `M${l + f} ${t}V${t + f}H${l}Z`;
	return { outer, fold };
}

/** The mark on the 16-unit grid. `small` drops the blue terminals (16 px favicon). */
function mark(theme, key, small = false) {
	const c = palette[theme];
	const { outer, fold } = pageShape();
	const id = `cut-${theme}-${key}`;
	return (
		`<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16"><rect width="16" height="16" fill="white"/>${pathEl(S, 'black')}</mask></defs>` +
		pathEl(outer, c.page, `mask="url(#${id})"`) + pathEl(fold, c.fold) + (small ? '' : pathEl(TERMINALS, B))
	);
}

fs.mkdirSync(out, { recursive: true });
const write = (file, content) => fs.writeFileSync(path.join(out, file), content);

for (const theme of ['light', 'dark']) {
	const m = `<g transform="scale(4)">${mark(theme, 'mark')}</g>`;
	write(`mark-${theme}.svg`, svg(64, 64, 'lsl.dev', m));
	write(`wordmark-${theme}.svg`, svg(276, 64, 'lsl.dev', `<g transform="translate(4 0)">${m}</g>${lettering.replaceAll(N, palette[theme].page)}`));
}
for (const n of [16, 32]) {
	write(`favicon-${n}.svg`, svg(n, n, 'lsl.dev', `<rect width="${n}" height="${n}" rx="${n / 4}" fill="${N}"/><g transform="scale(${n / 16})">${mark('dark', `fav${n}`, n === 16)}</g>`));
}
write('icon-180.svg', svg(180, 180, 'lsl.dev', `<rect width="180" height="180" fill="${N}"/><g transform="translate(26 26) scale(8)">${mark('dark', 'app')}</g>`));
write('icon-180.png', await sharp(path.join(out, 'icon-180.svg'), { density: 300 }).resize(180, 180).png().toBuffer());

// Copies used by the site.
const copy = (from, to) => fs.copyFileSync(path.join(out, from), path.join(repo, to));
copy('mark-light.svg', 'src/assets/logo.light.svg');
copy('mark-dark.svg', 'src/assets/logo.dark.svg');
copy('wordmark-light.svg', 'src/assets/wordmark.light.svg');
copy('wordmark-dark.svg', 'src/assets/wordmark.dark.svg');
copy('favicon-32.svg', 'public/favicon.svg');
copy('icon-180.png', 'public/apple-touch-icon.png');
console.log('lsl.dev logo written to design/logo/assets and the site assets');
