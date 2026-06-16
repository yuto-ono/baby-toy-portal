<script lang="ts">
	import { PageNavigation } from '$lib';
	import OctaveKeyboard from './OctaveKeyboard.svelte';
	import VolumeControl from './VolumeControl.svelte';

	let volume = $state(0.55);
</script>

<svelte:head>
	<title>楽器で あそぼう | Baby Toy Portal</title>
	<meta
		name="description"
		content="ドレミのボタンをタップして、1オクターブの音を鳴らして遊べる子ども向けページです。"
	/>
</svelte:head>

<main>
	{#snippet volumeAction()}
		<VolumeControl bind:value={volume} />
	{/snippet}

	<PageNavigation title="楽器で あそぼう" actions={volumeAction} />
	<OctaveKeyboard {volume} />
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
		font-family: 'Hiragino Maru Gothic ProN', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
	}

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
		place-items: start center;
		padding: 0;
		overflow: hidden;
		overscroll-behavior: none;
		background:
			radial-gradient(circle at 12% 18%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}
</style>
