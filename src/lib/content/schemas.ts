import { z } from 'zod';

export const aboutSchema = z.object({
	name: z.string().min(1),
	handle: z.string().min(1),
	role: z.string().min(1),
	lead: z.string().optional(),
	affiliation: z.string().min(1),
	location: z.string().optional(),
	status: z.string().optional(),
	avatar: z.string().optional(),
	interests: z.array(z.string()).default([])
});

export const skillsSchema = z.object({
	lead: z.string().optional(),
	categories: z.array(
		z.object({
			name: z.string().min(1),
			items: z.array(
				z.object({
					name: z.string().min(1),
					years: z.number().optional(),
					description: z.string().min(1)
				})
			)
		})
	)
});

export const experienceSchema = z.object({
	items: z.array(
		z.object({
			period: z.string().min(1),
			title: z.string().min(1),
			role: z.string().min(1),
			description: z.string().min(1),
			url: z.string().url().optional()
		})
	)
});

export const linksSchema = z.object({
	lead: z.string().optional(),
	items: z.array(
		z.object({
			label: z.string().min(1),
			handle: z.string().min(1),
			url: z.string().url()
		})
	)
});

export const privacySchema = z.object({
	title: z.string().min(1),
	enactedAt: z.string().min(1),
	updatedAt: z.string().min(1)
});

export const workSchema = z.object({
	title: z.string().min(1),
	summary: z.string().min(1),
	date: z.string().regex(/^\d{4}-\d{2}$/),
	order: z.number().int().default(0),
	published: z.boolean().default(true),
	thumbnail: z.string().min(1),
	images: z.array(z.string()).default([]),
	techStack: z.array(z.string()).default([]),
	role: z.string().min(1),
	githubUrl: z.string().url().optional(),
	demoUrl: z.string().url().optional()
});

export type About = z.infer<typeof aboutSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Links = z.infer<typeof linksSchema>;
export type Privacy = z.infer<typeof privacySchema>;
export type Work = z.infer<typeof workSchema> & { slug: string };
