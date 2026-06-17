<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#fff" />
</svelte:head>

{@render children()}
