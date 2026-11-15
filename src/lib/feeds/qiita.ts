import { XMLParser } from 'fast-xml-parser';
import type { Article } from './index';

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_'
});

function toArray<T>(val: T | T[] | undefined | null): T[] {
	if (val == null) return [];
	return Array.isArray(val) ? val : [val];
}

function extractText(val: unknown): string {
	if (typeof val === 'string') return val.trim();
	if (val && typeof val === 'object' && '#text' in val) {
		return String((val as Record<string, unknown>)['#text'] ?? '').trim();
	}
	return '';
}

function extractAtomLink(linkField: unknown, urlField?: unknown): string {
	if (typeof urlField === 'string' && /^https?:\/\//.test(urlField.trim())) {
		return urlField.trim();
	}
	const links = toArray(linkField);
	for (const link of links) {
		if (typeof link === 'string' && /^https?:\/\//.test(link.trim())) {
			return link.trim();
		}
		if (link && typeof link === 'object') {
			const rec = link as Record<string, unknown>;
			const href = typeof rec['@_href'] === 'string' ? rec['@_href'].trim() : '';
			const rel = typeof rec['@_rel'] === 'string' ? rec['@_rel'] : 'alternate';
			if (href && /^https?:\/\//.test(href) && (rel === 'alternate' || !rec['@_rel'])) {
				return href;
			}
		}
	}
	for (const link of links) {
		if (link && typeof link === 'object') {
			const href = (link as Record<string, unknown>)['@_href'];
			if (typeof href === 'string' && /^https?:\/\//.test(href.trim())) {
				return href.trim();
			}
		}
	}
	return '';
}

export function formatDateYmd(raw: unknown): string | null {
	const str = extractText(raw);
	if (!str) return null;
	const isoMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
	if (isoMatch) return isoMatch[1];
	const parsed = new Date(str);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toISOString().slice(0, 10);
}

export function parseQiitaFeed(xml: string): Article[] {
	const doc = parser.parse(xml) as Record<string, unknown>;
	const feed = doc?.feed as Record<string, unknown> | undefined;
	const entries = toArray(feed?.entry as Record<string, unknown> | Record<string, unknown>[]);

	const articles: Article[] = [];
	for (const entry of entries) {
		if (!entry || typeof entry !== 'object') continue;
		const title = extractText(entry.title);
		const url = extractAtomLink(entry.link, entry.url);
		const publishedAt = formatDateYmd(entry.published ?? entry.updated);
		if (title && url && publishedAt) {
			articles.push({
				title,
				url,
				publishedAt,
				source: 'qiita'
			});
		}
	}
	return articles;
}
