import { env } from '$env/dynamic/private';
import { parseHatenaFeed } from './hatena';
import { parseQiitaFeed } from './qiita';

export type Article = {
	title: string;
	url: string;
	publishedAt: string; // YYYY-MM-DD
	source: 'qiita' | 'hatena';
};

const TTL_SECONDS = 3600;
const TIMEOUT_MS = 3000;
const MAX_ARTICLES = 8;

const memoryCache = new Map<string, { expiresAt: number; data: unknown }>();

async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
	const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
	const cacheKey = new Request(`https://internal.invalid/${encodeURIComponent(key)}`);

	if (cache) {
		try {
			const hit = await cache.match(cacheKey);
			if (hit) {
				return (await hit.json()) as T;
			}
		} catch {
			// Fall through to memory cache / network fetch
		}
	} else {
		const entry = memoryCache.get(key);
		if (entry && entry.expiresAt > Date.now()) {
			return entry.data as T;
		}
	}

	const data = await fetcher();

	if (cache) {
		try {
			await cache.put(
				cacheKey,
				new Response(JSON.stringify(data), {
					headers: {
						'content-type': 'application/json',
						'cache-control': `max-age=${TTL_SECONDS}`
					}
				})
			);
		} catch {
			// Ignore cache write errors
		}
	} else {
		memoryCache.set(key, {
			expiresAt: Date.now() + TTL_SECONDS * 1000,
			data
		});
	}

	return data;
}

function isValidFeedUrl(url?: string): url is string {
	if (!url) return false;
	const trimmed = url.trim();
	if (!trimmed || trimmed.includes('<') || trimmed.includes('>')) return false;
	try {
		const parsed = new URL(trimmed);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

async function fetchXml(url: string): Promise<string> {
	const res = await fetch(url, {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: {
			'user-agent': 'portfolio-bot/1.0',
			accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
		}
	});
	if (!res.ok) {
		throw new Error(`Feed request failed with status ${res.status}`);
	}
	return await res.text();
}

async function fetchQiitaArticles(url?: string): Promise<Article[]> {
	if (!isValidFeedUrl(url)) {
		throw new Error('QIITA_FEED_URL is not configured or invalid');
	}
	return withCache(`feeds:qiita:${url}`, async () => {
		const xml = await fetchXml(url);
		return parseQiitaFeed(xml);
	});
}

async function fetchHatenaArticles(url?: string): Promise<Article[]> {
	if (!isValidFeedUrl(url)) {
		throw new Error('HATENA_FEED_URL is not configured or invalid');
	}
	return withCache(`feeds:hatena:${url}`, async () => {
		const xml = await fetchXml(url);
		return parseHatenaFeed(xml);
	});
}

export async function getArticles(options?: {
	qiitaFeedUrl?: string;
	hatenaFeedUrl?: string;
}): Promise<Article[]> {
	const qiitaUrl = options?.qiitaFeedUrl ?? env.QIITA_FEED_URL;
	const hatenaUrl = options?.hatenaFeedUrl ?? env.HATENA_FEED_URL;

	const results = await Promise.allSettled([
		fetchQiitaArticles(qiitaUrl),
		fetchHatenaArticles(hatenaUrl)
	]);

	const merged: Article[] = [];
	for (const result of results) {
		if (result.status === 'fulfilled') {
			merged.push(...result.value);
		}
	}

	return merged
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
		.slice(0, MAX_ARTICLES);
}
