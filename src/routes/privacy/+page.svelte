<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { getAssetUrl } from '$lib/assets';
	import Prose from '$lib/components/Prose.svelte';
	import { getAbout, getPrivacy } from '$lib/content/load';

	const about = getAbout().metadata;
	const { metadata: privacy, component: PrivacyContent } = getPrivacy();

	const siteUrl = $derived((env.PUBLIC_SITE_URL ?? 'https://ricezero.fun').replace(/\/$/, ''));
	const canonicalUrl = $derived(`${siteUrl}/privacy`);
	const ogImageUrl = $derived(getAssetUrl('ogp/default-ogp.png') ?? `${siteUrl}/ogp.png`);
	const pageTitle = $derived(`${privacy.title} — ${about.handle}`);
	const pageDescription = 'アクセス解析ツールの利用および個人情報の取り扱い方針';
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

<article class="privacy-page">
	<p class="top-nav">
		<a class="back-link" href="/"><span aria-hidden="true">←</span> トップページへ戻る</a>
	</p>

	<h1>{privacy.title}</h1>
	<p class="dates">
		制定日: <code>{privacy.enactedAt}</code> / 最終改定日: <code>{privacy.updatedAt}</code>
	</p>

	<Prose>
		<PrivacyContent />
	</Prose>

	<p class="bottom-nav">
		<a class="back-link" href="/"><span aria-hidden="true">←</span> トップページへ戻る</a>
	</p>
</article>

<style>
	.privacy-page {
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

	.dates {
		margin-top: 8px;
		font-family: var(--font-mono);
		font-size: 0.76rem;
		color: var(--muted);
	}

	.bottom-nav {
		margin-top: 48px;
	}
</style>
