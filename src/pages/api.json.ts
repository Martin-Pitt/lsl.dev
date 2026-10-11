/** /api.json: the public LSL API in one minified file (src/lib/llms.ts; docs/llms.md). */
import type { APIRoute } from 'astro';
import { buildApi } from '../lib/llms';

export const GET: APIRoute = () => new Response(JSON.stringify(buildApi()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
