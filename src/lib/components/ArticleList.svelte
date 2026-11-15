<script lang="ts">
	import type { Article } from '$lib/feeds';

	let {
		articles = [],
		qiitaUrl = 'https://qiita.com/ricezero',
		hatenaUrl = 'https://blog.ricezero.fun'
	}: {
		articles: Article[];
		qiitaUrl?: string;
		hatenaUrl?: string;
	} = $props();
</script>

{#if articles.length > 0}
	<ul class="articles">
		{#each articles as article (article.url)}
			<li>
				<code class="date">{article.publishedAt}</code><a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer">{article.title}</a
				><span class="src">{article.source === 'qiita' ? 'Qiita' : 'Hatena'}</span><span
					class="arrow"
					aria-hidden="true">↗</span
				>
			</li>
		{/each}
	</ul>
{:else}
	<p class="fallback">
		最新の記事一覧を取得できませんでした。各プラットフォームから直接ご覧ください。
	</p>
{/if}

<p class="more">
	<a href={qiitaUrl} target="_blank" rel="noopener noreferrer"
		>More on Qiita <span aria-hidden="true">↗</span></a
	><a href={hatenaUrl} target="_blank" rel="noopener noreferrer"
		>More on Hatena <span aria-hidden="true">↗</span></a
	>
</p>

<style>
	.articles {
		margin-top: 12px;
	}

	.articles li {
		padding: 8px 0;
		font-size: 0.92rem;
	}

	.articles .date {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		color: var(--faint);
		margin-right: 8px;
	}

	.articles .src {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--muted);
		margin-left: 8px;
		white-space: nowrap;
	}

	.articles .src::before {
		content: "· ";
		color: var(--line);
	}

	.articles .arrow {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--faint);
		margin-left: 4px;
	}

	.fallback {
		margin-top: 12px;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.more {
		margin-top: 14px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
	}

	.more a {
		display: inline-block;
		padding: 4px 0;
		margin-right: 18px;
	}
</style>
