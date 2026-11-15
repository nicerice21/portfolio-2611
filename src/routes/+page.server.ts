import {
	getAbout,
	getExperience,
	getLinks,
	getSkills,
	getWorks
} from '$lib/content/load';
import { getArticles } from '$lib/feeds';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=0, s-maxage=3600'
	});

	const [works, articles] = await Promise.all([getWorks(), getArticles()]);

	return {
		about: getAbout().metadata,
		skills: getSkills(),
		experience: getExperience(),
		works,
		links: getLinks(),
		articles
	};
};
