<script lang="ts">
	import { PageNavigation } from '$lib';
	import AlphabetPlayground from './AlphabetPlayground.svelte';
</script>

<svelte:head>
	<title>アルファベットで あそぼう | Baby Toy Portal</title>
	<meta
		name="description"
		content="きらきら星のメロディーと一緒に流れるアルファベットをタップして遊べる子ども向けページです。"
	/>
</svelte:head>

<main>
	<PageNavigation title="アルファベットで あそぼう" />
	<AlphabetPlayground />
</main>

<style lang="scss">
	$page-background: #fff8e7;

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
		background:
			radial-gradient(circle at 12% 18%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}
</style>
