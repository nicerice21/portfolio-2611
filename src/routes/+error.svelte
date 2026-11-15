<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — ricezero</title>
</svelte:head>

<section class="error-page" aria-labelledby="error-title">
	<p class="mono status"><code>{page.status}</code></p>
	<h1 id="error-title">
		{#if page.status === 404}
			ページが見つかりませんでした
		{:else}
			エラーが発生しました
		{/if}
	</h1>
	<p class="lede">
		{page.error?.message || '指定されたURLは存在しないか、移動した可能性があります。'}
	</p>
	<p class="back">
		<a class="back-link" href="/"><span aria-hidden="true">←</span> トップページへ戻る</a>
	</p>
</section>

<style>
	.error-page {
		margin-top: 40px;
	}

	.status {
		color: var(--muted);
	}

	h1 {
		margin-top: 8px;
		font-size: clamp(1.3rem, 3.5vw, 1.6rem);
		font-weight: 800;
		line-height: 1.4;
	}

	.lede {
		margin-top: 12px;
	}

	.back {
		margin-top: 28px;
	}
</style>
