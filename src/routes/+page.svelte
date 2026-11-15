<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { getAssetUrl } from '$lib/assets';
	import ArticleList from '$lib/components/ArticleList.svelte';
	import Prose from '$lib/components/Prose.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import WorkItem from '$lib/components/WorkItem.svelte';
	import { getAbout } from '$lib/content/load';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const AboutContent = getAbout().component;

	const siteUrl = $derived((env.PUBLIC_SITE_URL ?? 'https://ricezero.fun').replace(/\/$/, ''));
	const canonicalUrl = $derived(`${siteUrl}/`);
	const ogImageUrl = $derived(getAssetUrl('ogp/default-ogp.png') ?? `${siteUrl}/ogp.png`);
	const pageTitle = $derived(`${data.about.handle} — ${data.about.name}`);
	const pageDescription = $derived(
		data.about.lead ?? `${data.about.name} (${data.about.handle}) のポートフォリオサイト`
	);

	const qiitaLink = $derived(
		data.links.items.find((i) => i.label.toLowerCase().includes('qiita'))?.url ??
			'https://qiita.com/ricezero'
	);
	const hatenaLink = $derived(
		data.links.items.find((i) => i.label.toLowerCase().includes('hatena'))?.url ??
			'https://blog.ricezero.fun'
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImageUrl} />
</svelte:head>

<div class="intro">
	<h1>{data.about.name}</h1>
	<p class="intro__role">{data.about.role}</p>
	{#if data.about.lead}
		<blockquote>{data.about.lead}</blockquote>
	{/if}
	<dl class="meta">
		<div>
			<dt>affiliation</dt>
			<dd>{data.about.affiliation}</dd>
		</div>
		{#if data.about.location}
			<div>
				<dt>location</dt>
				<dd>{data.about.location}</dd>
			</div>
		{/if}
		{#if data.about.status}
			<div>
				<dt>status</dt>
				<dd>{data.about.status}</dd>
			</div>
		{/if}
	</dl>
</div>

<section id="about" aria-labelledby="about-title">
	<SectionHeading id="about-title" title="About" />
	<Prose>
		<AboutContent />
	</Prose>
	{#if data.about.interests.length > 0}
		<h3 class="h3">興味のある領域</h3>
		<ul class="list">
			{#each data.about.interests as interest (interest)}
				<li>{interest}</li>
			{/each}
		</ul>
	{/if}
</section>

<section id="skills" aria-labelledby="skills-title">
	<SectionHeading id="skills-title" title="Skills" lead={data.skills.lead} />
	{#each data.skills.categories as category (category.name)}
		<h3 class="h3">{category.name}</h3>
		<ul class="list">
			{#each category.items as item (item.name)}
				<li>
					<strong>{item.name}</strong>{#if item.years}
						({item.years}y){/if} — {item.description}
				</li>
			{/each}
		</ul>
	{/each}
</section>

<section id="experience" aria-labelledby="experience-title">
	<SectionHeading id="experience-title" title="Experience" />
	{#each data.experience.items as item (item.title + item.period)}
		<h3 class="h3">
			{#if item.url}
				<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
			{:else}
				{item.title}
			{/if}
		</h3>
		<p class="lede"><code>{item.period}</code> {item.role}</p>
		<p class="exp-desc">{item.description}</p>
	{/each}
</section>

<section id="works" aria-labelledby="works-title">
	<SectionHeading
		id="works-title"
		title="Works"
		lead="設計の意図と、詰まったところは詳細ページに書いています。"
	/>
	<div class="works">
		{#each data.works as work (work.slug)}
			<WorkItem {work} />
		{/each}
	</div>
</section>

<section id="articles" aria-labelledby="articles-title">
	<SectionHeading
		id="articles-title"
		title="Articles"
		lead="Qiita とはてなブログに書いた記事です。"
	/>
	<ArticleList articles={data.articles} qiitaUrl={qiitaLink} hatenaUrl={hatenaLink} />
</section>

<section id="links" aria-labelledby="links-title">
	<SectionHeading id="links-title" title="Links" lead={data.links.lead} />
	<ul class="links">
		{#each data.links.items as item (item.label)}
			<li>
				<a
					class="label"
					href={item.url}
					target={item.url.startsWith('http') ? '_blank' : undefined}
					rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}>{item.label}</a
				><span class="handle">{item.handle}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.intro {
		margin-top: 40px;
	}

	.intro h1 {
		font-size: clamp(1.5rem, 4vw, 1.9rem);
		font-weight: 800;
		line-height: 1.4;
		letter-spacing: 0.01em;
	}

	.intro__role {
		margin-top: 2px;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
	}

	.intro blockquote {
		margin: 24px 0 0;
		padding: 2px 0 2px 16px;
		border-left: 2px solid var(--line);
		color: var(--muted);
		font-size: 0.95rem;
	}

	.exp-desc {
		margin-top: 8px;
	}

	.works {
		margin-top: 20px;
	}

	.links {
		margin-top: 12px;
	}

	.links li {
		padding: 6px 0;
		font-size: 0.92rem;
	}

	.links .label {
		font-weight: 600;
	}

	.links .handle {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		color: var(--muted);
		margin-left: 10px;
	}
</style>
