import type { Component } from 'svelte';
import {
	aboutSchema,
	experienceSchema,
	linksSchema,
	privacySchema,
	skillsSchema,
	workSchema,
	type About,
	type Experience,
	type Links,
	type Privacy,
	type Skills,
	type Work
} from './schemas';

type MdsvexModule = {
	metadata?: unknown;
	default: Component;
};

const rootModules = import.meta.glob<MdsvexModule>('/src/content/*.md', { eager: true });
const workModules = import.meta.glob<MdsvexModule>('/src/content/works/*.md', { eager: true });

function getRootModule(filename: string): MdsvexModule {
	const key = `/src/content/${filename}`;
	const mod = rootModules[key];
	if (!mod) {
		throw new Error(`Missing required content file: ${key}`);
	}
	return mod;
}

const aboutMod = getRootModule('about.md');
const cachedAbout = {
	metadata: aboutSchema.parse(aboutMod.metadata),
	component: aboutMod.default
};

const cachedSkills = skillsSchema.parse(getRootModule('skills.md').metadata);
const cachedExperience = experienceSchema.parse(getRootModule('experience.md').metadata);
const cachedLinks = linksSchema.parse(getRootModule('links.md').metadata);

const privacyMod = getRootModule('privacy.md');
const cachedPrivacy = {
	metadata: privacySchema.parse(privacyMod.metadata),
	component: privacyMod.default
};

const cachedWorks: Array<Work & { component: Component }> = (() => {
	const seenSlugs = new Set<string>();
	const list = Object.entries(workModules).map(([path, mod]) => {
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		if (seenSlugs.has(slug)) {
			throw new Error(`Duplicate work slug detected: ${slug}`);
		}
		seenSlugs.add(slug);
		const parsed = workSchema.parse(mod.metadata);
		return {
			slug,
			...parsed,
			component: mod.default
		};
	});

	return list
		.filter((w) => w.published)
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ja'));
})();

export function getAbout(): { metadata: About; component: Component } {
	return cachedAbout;
}

export function getSkills(): Skills {
	return cachedSkills;
}

export function getExperience(): Experience {
	return cachedExperience;
}

export function getLinks(): Links {
	return cachedLinks;
}

export function getPrivacy(): { metadata: Privacy; component: Component } {
	return cachedPrivacy;
}

export function getAllWorksWithComponents(): Array<Work & { component: Component }> {
	return cachedWorks;
}

export async function getWorks(): Promise<Work[]> {
	return getAllWorksWithComponents().map(({ component: _component, ...work }) => work);
}

export async function getWork(slug: string): Promise<(Work & { component: Component }) | undefined> {
	return getAllWorksWithComponents().find((w) => w.slug === slug);
}

export function getWorkComponent(slug: string): Component | undefined {
	return getAllWorksWithComponents().find((w) => w.slug === slug)?.component;
}
