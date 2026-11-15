import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const siteUrl = (env.PUBLIC_SITE_URL ?? 'https://ricezero.fun').trim().replace(/\/$/, '');
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8'
		}
	});
};
