import { XMLParser } from 'fast-xml-parser';
import type { Article } from './index';
import { formatDateYmd } from './qiita';

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

function extractLink(linkField: unknown): string {
	if (typeof linkField === 'string' && /^https?:\/\//.test(linkField.trim())) {
		return linkField.trim();
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
	return '';
}

export function parseHatenaFeed(xml: string): Article[] {
	const doc = parser.parse(xml) as Record<string, unknown>;
	const rssChannel = (doc?.rss as Record<string, unknown> | undefined)?.channel as
		| Record<string, unknown>
		| undefined;
	const rssItems = toArray(
		rssChannel?.item as Record<string, unknown> | Record<string, unknown>[]
	);

	const atomFeed = doc?.feed as Record<string, unknown> | undefined;
	const atomEntries = toArray(
		atomFeed?.entry as Record<string, unknown> | Record<string, unknown>[]
	);

	const rawItems = rssItems.length > 0 ? rssItems : atomEntries;
	const articles: Article[] = [];

	for (const item of rawItems) {
		if (!item || typeof item !== 'object') continue;
		const title = extractText(item.title);
		const url = extractLink(item.link);
		const publishedAt = formatDateYmd(item.pubDate ?? item.published ?? item.updated);
		if (title && url && publishedAt) {
			articles.push({
				title,
				url,
				publishedAt,
				source: 'hatena'
			});
		}
	}

	return articles;
}
