<script lang="ts">
	let { handle = 'ricezero' }: { handle?: string } = $props();
</script>

<header>
	<p class="site-title"><a href="/">{handle}</a></p>
	<nav class="nav" aria-label="セクション">
		<ul>
			<li><a href="/#about">About</a></li>
			<li><a href="/#skills">Skills</a></li>
			<li><a href="/#experience">Experience</a></li>
			<li><a href="/#works">Works</a></li>
			<li><a href="/#articles">Articles</a></li>
			<li><a href="/#links">Links</a></li>
		</ul>
	</nav>
</header>

<hr />

<style>
	.site-title {
		display: flex;
		align-items: baseline;
		gap: 10px;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.site-title a {
		text-decoration: none;
	}

	.site-title a:hover {
		color: var(--ink);
	}

	.site-title::after {
		content: "";
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
	}

	.nav {
		margin-top: 14px;
	}

	.nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
	}

	.nav a {
		display: inline-block;
		padding: 4px 0;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.02em;
		color: var(--muted);
		text-decoration: none;
	}

	.nav a:hover {
		color: var(--accent-ink);
		text-decoration: underline;
	}
</style>
