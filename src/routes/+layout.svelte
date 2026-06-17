<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<style lang="scss">
	$ink: #333145;
	$app-background: #fff;

	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: $app-background;
		color: $ink;
		font-family: 'Hiragino Maru Gothic ProN', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
	}
</style>
