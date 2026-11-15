<script lang="ts">
	import { env } from '$env/dynamic/public';

	const gaId = env.PUBLIC_GA_MEASUREMENT_ID?.trim();
	const cfToken = env.PUBLIC_CF_BEACON_TOKEN?.trim();

	const gaInlineScript = gaId
		? `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', ${JSON.stringify(gaId)});`
		: '';
</script>

<svelte:head>
	{#if gaId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}></script>
		{@html `<script>${gaInlineScript}</script>`}
	{/if}

	{#if cfToken}
		<script
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
			data-cf-beacon={JSON.stringify({ token: cfToken })}
		></script>
	{/if}
</svelte:head>
