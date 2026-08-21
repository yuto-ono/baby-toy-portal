<script lang="ts">
	import { PageNavigation } from '$lib';
	import AdditionPlayground from './AdditionPlayground.svelte';
</script>

<svelte:head>
	<title>足し算で あそぼう | Baby Toy Portal</title>
	<meta
		name="description"
		content="左右から集まるかわいい仲間たちと、10までの足し算を楽しめる子ども向けページです。"
	/>
</svelte:head>

<main>
	<PageNavigation title="足し算で あそぼう" />
	<AdditionPlayground />
</main>

<style lang="scss">
	main,
	main :global(*) {
		user-select: none;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
	}

	main {
		position: fixed;
		inset: 0;
		display: grid;
		height: 100dvh;
		grid-template-rows: auto 1fr;
		overflow: hidden;
		overscroll-behavior: none;
	}
</style>
