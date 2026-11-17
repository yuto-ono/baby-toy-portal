<script lang="ts">
	import { PageNavigation } from '$lib';
	import DrawingBoard from './DrawingBoard.svelte';
</script>

<svelte:head>
	<title>おえかきで あそぼう | Baby Toy Portal</title>
	<meta name="description" content="好きな色をえらんで、指やマウスでお絵かきできるページです。" />
</svelte:head>

<main>
	<PageNavigation title="おえかきで あそぼう" />
	<DrawingBoard />
</main>

<style lang="scss">
	main {
		display: grid;
		min-height: 100dvh;
		grid-template-rows: auto 1fr;
		background: #fff8e7;
		user-select: none;
	}
</style>
