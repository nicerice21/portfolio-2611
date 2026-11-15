import { env } from '$env/dynamic/public';
import { getWorks } from '$lib/content/load';
import type { RequestHandler } from './$types';

export const prerender = true;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
	const siteUrl = (env.PUBLIC_SITE_URL ?? 'https://ricezero.fun').trim().replace(/\/$/, '');
	const works = await getWorks();

	const paths = ['/', ...works.map((w) => `/works/${w.slug}`), '/privacy'];

	const urlsXml = paths
		.map((path) => `  <url>\n    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>\n  </url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>\n`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8'
		}
	});
};
