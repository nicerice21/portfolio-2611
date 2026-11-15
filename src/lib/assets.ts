import { env } from '$env/dynamic/public';

export function getAssetUrl(path?: string): string | undefined {
	if (!path) return undefined;
	if (/^https?:\/\//.test(path)) return path;
	const base = (env.PUBLIC_ASSETS_BASE_URL ?? '').trim().replace(/\/$/, '');
	const cleanPath = path.replace(/^\//, '');
	return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}
