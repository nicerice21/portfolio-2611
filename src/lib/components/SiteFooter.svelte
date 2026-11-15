<script lang="ts">
	let { handle = 'ricezero' }: { handle?: string } = $props();
</script>

<hr />

<footer>
	<div class="footer">
		<span>© 2026 {handle}</span>
		<nav aria-label="フッター">
			<a href="/privacy">Privacy</a>
			<a href="#top">Top</a>
		</nav>
	</div>
</footer>

<style>
	footer {
		margin-top: 56px;
	}

	.footer {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 20px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--muted);
	}

	.footer nav {
		display: flex;
		gap: 16px;
		margin-left: auto;
	}

	.footer a {
		display: inline-block;
		padding: 4px 0;
		text-decoration: none;
	}

	.footer a:hover {
		text-decoration: underline;
	}

	@media (max-width: 560px) {
		.footer nav {
			margin-left: 0;
			width: 100%;
		}
	}
</style>
