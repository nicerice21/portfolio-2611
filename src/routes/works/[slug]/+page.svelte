<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { getAssetUrl } from '$lib/assets';
	import Prose from '$lib/components/Prose.svelte';
	import { getAbout, getWorkComponent } from '$lib/content/load';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const about = getAbout().metadata;
	const WorkContent = $derived(getWorkComponent(data.work.slug));

	const siteUrl = $derived((env.PUBLIC_SITE_URL ?? 'https://ricezero.fun').replace(/\/$/, ''));
	const canonicalUrl = $derived(`${siteUrl}/works/${data.work.slug}`);
	const ogImageUrl = $derived(
		getAssetUrl(data.work.thumbnail) ?? getAssetUrl('ogp/default-ogp.png') ?? `${siteUrl}/ogp.png`
	);
	const pageTitle = $derived(`${data.work.title} — ${about.handle}`);
	const galleryUrls = $derived(
		data.work.images.map((img, i) => ({
			url: getAssetUrl(img),
			alt: `${data.work.title} スクリーンショット ${i + 1}`
		}))
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={data.work.summary} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={data.work.summary} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={data.work.summary} />
	<meta name="twitter:image" content={ogImageUrl} />
</svelte:head>

<article class="work-detail">
	<p class="top-nav">
		<a class="back-link" href="/#works"><span aria-hidden="true">←</span> Works 一覧へ戻る</a>
	</p>

	<h1>{data.work.title}</h1>
	<p class="lede summary">{data.work.summary}</p>

	<dl class="meta">
		<div>
			<dt>role</dt>
			<dd>{data.work.role}</dd>
		</div>
		<div>
			<dt>period</dt>
			<dd><code>{data.work.date}</code></dd>
		</div>
		{#if data.work.techStack.length > 0}
			<div>
				<dt>stack</dt>
				<dd class="stack-list">
					{#each data.work.techStack as tech (tech)}
						<code>{tech}</code>
					{/each}
				</dd>
			</div>
		{/if}
		{#if data.work.demoUrl || data.work.githubUrl}
			<div>
				<dt>links</dt>
				<dd class="link-list">
					{#if data.work.demoUrl}
						<a href={data.work.demoUrl} target="_blank" rel="noopener noreferrer"
							>Demo <span aria-hidden="true">↗</span></a
						>
					{/if}
					{#if data.work.githubUrl}
						<a href={data.work.githubUrl} target="_blank" rel="noopener noreferrer"
							>GitHub <span aria-hidden="true">↗</span></a
						>
					{/if}
				</dd>
			</div>
		{/if}
	</dl>

	{#if galleryUrls.length > 0}
		<div class="gallery">
			{#each galleryUrls as item (item.url)}
				{#if item.url}
					<figure class="shot">
						<img
							src={item.url}
							alt={item.alt}
							width="960"
							height="540"
							loading="lazy"
							decoding="async"
						/>
					</figure>
				{/if}
			{/each}
		</div>
	{/if}

	{#if WorkContent}
		<Prose>
			<WorkContent />
		</Prose>
	{/if}

	<p class="bottom-nav">
		<a class="back-link" href="/#works"><span aria-hidden="true">←</span> Works 一覧へ戻る</a>
	</p>
</article>

<style>
	.work-detail {
		margin-top: 32px;
	}

	.top-nav {
		margin-bottom: 20px;
	}

	h1 {
		font-size: clamp(1.5rem, 4vw, 1.9rem);
		font-weight: 800;
		line-height: 1.4;
		letter-spacing: 0.01em;
	}

	.summary {
		margin-top: 8px;
	}

	.stack-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.link-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	.gallery {
		display: grid;
		gap: 16px;
		margin-top: 28px;
	}

	.shot {
		aspect-ratio: 16 / 9;
		display: grid;
		place-items: center;
		overflow: hidden;
		background: var(--code);
		border: 1px solid var(--line);
		border-radius: 2px;
	}

	.shot img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		padding: 8px;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--faint);
	}

	.bottom-nav {
		margin-top: 48px;
	}
</style>
