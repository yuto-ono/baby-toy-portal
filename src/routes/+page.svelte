<script lang="ts">
	import Music from '@lucide/svelte/icons/music';
	import PlayCard from './PlayCard.svelte';
</script>

<svelte:head>
	<title>Baby Toy Portal</title>
	<meta name="description" content="子どもが楽しく遊べる、やさしいおもちゃのポータルです。" />
</svelte:head>

<main>
	<header class="page-heading">
		<p>Baby Toy Portal</p>
		<h1>なにして遊ぶ？</h1>
	</header>

	<nav aria-label="遊びを選ぶ">
		{#snippet musicIcon()}
			<Music size={52} strokeWidth={2.75} />
		{/snippet}

		<PlayCard
			href="/instruments"
			label="楽器で遊ぼう"
			description="音を鳴らして楽しもう！"
			icon={musicIcon}
		/>
	</nav>
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

	main {
		display: flex;
		min-height: 100dvh;
		align-items: center;
		flex-direction: column;
		padding: clamp(3rem, 10vw, 6rem) 1.5rem;
		overflow: hidden;
		background:
			radial-gradient(circle at 10% 14%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 90% 86%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}

	.page-heading {
		text-align: center;

		p {
			margin: 0 0 0.5rem;
			color: #df5b69;
			font-size: clamp(0.8rem, 2vw, 1rem);
			font-weight: 800;
			letter-spacing: 0.14em;
		}

		h1 {
			margin: 0;
			font-size: clamp(2.5rem, 9vw, 5rem);
			line-height: 1.2;
			letter-spacing: 0.04em;
		}
	}

	nav {
		width: min(100%, 28rem);
		margin-top: clamp(2.5rem, 8vw, 4rem);
	}
</style>
