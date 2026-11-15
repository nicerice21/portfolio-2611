<script lang="ts">
	let {
		id,
		title,
		lead
	}: {
		id: string;
		title: string;
		lead?: string;
	} = $props();
</script>

<h2 class="h2" {id}><span class="hash" aria-hidden="true">##</span>{title}</h2>
{#if lead}
	<p class="lede">{lead}</p>
{/if}
