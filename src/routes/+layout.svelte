<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { getAbout } from '$lib/content/load';

	let { children }: { children?: Snippet } = $props();

	const about = getAbout().metadata;
</script>

<Analytics />

<div class="bg" aria-hidden="true"></div>
<div class="doc">
	<SiteHeader handle={about.handle} />
	<main id="top">
		{@render children?.()}
	</main>
	<SiteFooter handle={about.handle} />
</div>
