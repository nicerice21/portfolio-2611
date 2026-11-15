import { error } from '@sveltejs/kit';
import { getWork, getWorks } from '$lib/content/load';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = async () => {
	const works = await getWorks();
	return works.map((w) => ({ slug: w.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const found = await getWork(params.slug);
	if (!found) {
		error(404, '制作物が見つかりませんでした');
	}
	const { component: _component, ...work } = found;
	return {
		work
	};
};
