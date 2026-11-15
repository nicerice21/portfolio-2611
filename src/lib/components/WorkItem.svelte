<script lang="ts">
	import { getAssetUrl } from '$lib/assets';
	import type { Work } from '$lib/content/schemas';

	let { work }: { work: Work } = $props();

	const thumbUrl = $derived(getAssetUrl(work.thumbnail));
</script>

<article class="work">
	<a class="work__thumb" href={`/works/${work.slug}`} aria-hidden="true" tabindex="-1">
		{#if thumbUrl}
			<img
				src={thumbUrl}
				alt={work.title}
				width="296"
				height="222"
				loading="lazy"
				decoding="async"
			/>
		{:else}
			<span>THUMBNAIL</span>
		{/if}
	</a>
	<div class="work__body">
		<h3><a href={`/works/${work.slug}`}>{work.title}</a></h3>
		<p>{work.summary}</p>
		<p class="meta-line">
			{#each work.techStack as tech (tech)}
				<code>{tech}</code>
			{/each}
			<a href={`/works/${work.slug}`}>View case <span aria-hidden="true">→</span></a>
		</p>
	</div>
</article>

<style>
	.work {
		display: flex;
		gap: 16px;
		padding: 18px 0;
		border-top: 1px solid var(--line);
	}

	.work:last-child {
		border-bottom: 1px solid var(--line);
	}

	.work__thumb {
		flex: 0 0 148px;
		aspect-ratio: 4 / 3;
		align-self: flex-start;
		display: grid;
		place-items: center;
		overflow: hidden;
		background: var(--code);
		border: 1px solid var(--line);
		border-radius: 2px;
		font-family: var(--font-mono);
		font-size: 0.55rem;
		letter-spacing: 0.08em;
		color: var(--faint);
		text-decoration: none;
	}

	.work__thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		text-align: center;
		line-height: 1.4;
		padding: 4px;
	}

	.work__body {
		min-width: 0;
		flex: 1;
	}

	.work h3 {
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.6;
	}

	.work h3 a {
		text-decoration: none;
	}

	.work h3 a:hover {
		text-decoration: underline;
	}

	.work p {
		margin-top: 4px;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.work .meta-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 10px;
		margin-top: 6px;
		font-size: 0.75rem;
	}

	.work .meta-line code {
		font-size: 0.72rem;
	}

	.work .meta-line a {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.02em;
	}

	@media (max-width: 560px) {
		.work {
			flex-direction: column;
		}

		.work__thumb {
			flex: none;
			width: 200px;
			max-width: 100%;
		}
	}
</style>
