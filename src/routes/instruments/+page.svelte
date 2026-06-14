<script lang="ts">
	import { PageNavigation } from '$lib';
</script>

<svelte:head>
	<title>楽器で遊ぼう | Baby Toy Portal</title>
	<meta
		name="description"
		content="いろいろな楽器を演奏して楽しめる、子ども向けのあそびページです。"
	/>
</svelte:head>

<main>
	<PageNavigation title="楽器で遊ぼう" />
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
		display: grid;
		min-height: 100dvh;
		place-items: start center;
		padding: 0;
		overflow: hidden;
		background:
			radial-gradient(circle at 12% 18%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}
</style>
