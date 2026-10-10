/**
 * HTTP_* options for llHTTPRequest and /constants/groups/HTTPRequestParam/. Every public
 * HTTPRequestParam member must appear exactly once. Shapes and defaults: the wiki's
 * Template:LSL_Constants/HTTP.
 */
import type { RuleSection } from './types';

export const httpRequestParams: RuleSection[] = [
	{ title: 'Request', id: 'request', rules: [
		{ rule: 'HTTP_METHOD', args: 'string method', note: '"GET" (default), "POST", "PUT" or "DELETE"' },
		{ rule: 'HTTP_MIMETYPE', args: 'string MIME_type', note: 'request body type; default "text/plain;charset=utf-8"' },
		{ rule: 'HTTP_CUSTOM_HEADER', args: 'string name, string value', note: 'up to 8 per request' },
		{ rule: 'HTTP_ACCEPT', args: 'string MIME_type', note: 'types for the Accept header; other responses give status 415' },
		{ rule: 'HTTP_USER_AGENT', args: 'string user agent value', note: 'appended to the default; no spaces' },
		{ rule: 'HTTP_PRAGMA_NO_CACHE', args: 'integer send_header', note: 'default TRUE' },
	] },
	{ title: 'Response', id: 'response', rules: [
		{ rule: 'HTTP_BODY_MAXLENGTH', args: 'integer length', note: 'bytes; default 2048, Mono up to 16384' },
		{ rule: 'HTTP_EXTENDED_ERROR', args: 'integer extended', note: 'errors arrive in http_response as RFC 7807 JSON' },
	] },
	{ title: 'Security and diagnostics', id: 'security-and-diagnostics', rules: [
		{ rule: 'HTTP_VERIFY_CERT', args: 'integer verify', note: 'default TRUE' },
		{ rule: 'HTTP_VERBOSE_THROTTLE', args: 'integer noisy', note: 'throttle errors on DEBUG_CHANNEL; default TRUE' },
	] },
];
