<script lang="ts">
	import { PageNavigation } from '$lib';
	import OctaveKeyboard from './OctaveKeyboard.svelte';
</script>

<svelte:head>
	<title>楽器で遊ぼう | Baby Toy Portal</title>
	<meta
		name="description"
		content="ドレミのボタンをタップして、1オクターブの音を鳴らして遊べる子ども向けページです。"
	/>
</svelte:head>

<main>
	<PageNavigation title="楽器で遊ぼう" />
	<OctaveKeyboard />
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;

	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: $page-background;
		color: $ink;
		font-family:
			'Helvetica Neue', 'Hiragino Maru Gothic ProN', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
	}

	main {
		position: fixed;
		inset: 0;
		display: grid;
		height: 100dvh;
		grid-template-rows: auto 1fr;
		place-items: start center;
		padding: 0;
		overflow: hidden;
		overscroll-behavior: none;
		background:
			radial-gradient(circle at 12% 18%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
		user-select: none;
		-webkit-user-select: none;
	}
</style>
