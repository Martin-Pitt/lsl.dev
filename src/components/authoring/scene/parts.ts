/**
 * Build-side rules of the scene batch: prop validation for <Prim> and <Model>, the encoded marker
 * each part writes for its <Scene>, and local asset resolution (.glb models, texture images).
 * Units and axes are Second Life's: metres, Z up, Euler degrees applied in LSL order (X, then Y,
 * then Z, as llEuler2Rot does). Every malformed prop fails the build with the part's name in it.
 */
import type { ImageMetadata } from 'astro';

export const SHAPES = ['box', 'cylinder', 'sphere', 'torus', 'prism'] as const;
export type Shape = (typeof SHAPES)[number];
export type Vec3 = [number, number, number];

/** One part as the viewer and the prim list see it. */
export type Part = {
	kind: 'prim' | 'model';
	name: string;
	root: boolean;
	shape?: Shape;
	size: Vec3;
	pos: Vec3;
	rot: Vec3;
	color?: string;
	alpha?: number;
	texture?: string;
	src?: string;
	note?: string;
	inventory?: string;
};

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);
export const vecText = (v: Vec3) => v.map(fmt).join(', ');

export function onlyProps(props: object, allowed: string[], who: string) {
	const extra = Object.keys(props).filter(k => !allowed.includes(k));
	if (extra.length) throw new Error(`<${who}>: unknown prop${extra.length > 1 ? 's' : ''} ${extra.join(', ')} (allowed: ${allowed.join(', ')})`);
}

/** "1, 2, 3" or "<1, 2, 3>" to three finite numbers. */
export function vec(v: unknown, prop: string, who: string, fallback?: Vec3): Vec3 {
	if (v === undefined && fallback) return fallback;
	const parts = String(v ?? '').trim().replace(/^<|>$/g, '').split(',').map(s => s.trim());
	const nums = parts.map(Number);
	if (parts.length !== 3 || parts.some(s => s === '') || nums.some(n => !Number.isFinite(n)))
		throw new Error(`<${who}>: ${prop}="${v ?? ''}" is not a vector; write three numbers like ${prop}="0.5, 0.5, 0.5"`);
	return nums as Vec3;
}

export function sizeVec(v: unknown, who: string, fallback?: Vec3): Vec3 {
	const s = vec(v, 'size', who, fallback);
	if (s.some(n => n < 0.01 || n > 64)) throw new Error(`<${who}>: size="${v}" is out of range; each axis is 0.01 to 64 metres, as in Second Life`);
	return s;
}

export function colour(v: unknown, who: string): string | undefined {
	if (v === undefined) return undefined;
	if (typeof v !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) throw new Error(`<${who}>: color="${v}" must be a hex colour like #8a6 or #88aa66`);
	return v;
}

export function alphaNum(v: unknown, who: string): number | undefined {
	if (v === undefined) return undefined;
	const n = Number(v);
	if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error(`<${who}>: alpha="${v}" must be a number from 0 (clear) to 1 (opaque)`);
	return n;
}

const isRemote = (s: string) => /^([a-z]+:)?\/\//i.test(s);
const images = import.meta.glob<{ default: ImageMetadata }>('/src/**/*.{png,jpg,jpeg,webp}');
const models = import.meta.glob<string>('/src/**/*.glb', { query: '?url', import: 'default' });

/** A local texture image under src/ to its built URL. */
export async function textureUrl(src: unknown, who: string): Promise<string | undefined> {
	if (src === undefined) return undefined;
	if (typeof src !== 'string') throw new Error(`<${who}>: texture must be a path string like ~/assets/wood.png`);
	if (isRemote(src)) throw new Error(`<${who}>: remote textures are not allowed (${src}); add the image to the repository`);
	const load = images[src.replace(/^~\//, '/src/')];
	if (!load) throw new Error(`<${who}>: no texture image at ${src} (a path under src/ like ~/assets/wood.png; png, jpg or webp)`);
	return (await load()).default.src;
}

/** A local .glb under src/ to its built URL. */
export async function modelUrl(src: unknown, who: string): Promise<string> {
	if (typeof src !== 'string' || !src) throw new Error(`<${who}>: src is required, a path to a local .glb like ~/assets/part.glb`);
	if (isRemote(src)) throw new Error(`<${who}>: remote models are not allowed (${src}); add the .glb to the repository`);
	if (!/\.glb$/i.test(src)) throw new Error(`<${who}>: src="${src}" must be a binary glTF (.glb) file`);
	const load = models[src.replace(/^~\//, '/src/')];
	if (!load) throw new Error(`<${who}>: no model at ${src} (a path under src/ like ~/assets/part.glb)`);
	return load();
}

/** Each part writes this comment; <Scene> collects them (an HTML comment survives MDX rendering untouched). */
export const encodePart = (p: Part) => `<!--au-part:${encodeURIComponent(JSON.stringify(p))}-->`;
export const decodeParts = (html: string): Part[] =>
	[...html.matchAll(/<!--au-part:([^>]*?)-->/g)].map(m => JSON.parse(decodeURIComponent(m[1])) as Part);

/** Anchor id of an <Inventory id>. */
export const inventoryId = (id: string) => `inv-${id}`;
