<script lang="ts">
	import { resolve } from '$app/paths';
	import Settings from '@lucide/svelte/icons/settings';
	import Music from '@lucide/svelte/icons/music';
	import PlayCard from './PlayCard.svelte';
</script>

<svelte:head>
	<title>Baby Toy Portal</title>
	<meta name="description" content="子どもが楽しく遊べる、やさしいおもちゃのポータルです。" />
</svelte:head>

<main>
	<a class="settings-link" href={resolve('/settings')} aria-label="保護者設定">
		<Settings size={24} strokeWidth={2.75} aria-hidden="true" />
	</a>

	<header class="page-heading">
		<p>Baby Toy Portal</p>
		<h1>なにして あそぶ？</h1>
	</header>

	<nav aria-label="遊びを選ぶ">
		{#snippet musicIcon()}
			<Music size={52} strokeWidth={2.75} />
		{/snippet}

		<PlayCard href="/instruments" label="楽器で あそぼう" icon={musicIcon} />
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
		position: relative;
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

	.settings-link {
		position: absolute;
		top: max(1rem, env(safe-area-inset-top));
		right: max(1rem, env(safe-area-inset-right));
		display: grid;
		width: 3rem;
		height: 3rem;
		place-items: center;
		border: 2px solid $ink;
		border-radius: 999px;
		background: #fff;
		color: inherit;
		font-size: 0.9rem;
		font-weight: 800;
		text-decoration: none;
		box-shadow: 3px 3px 0 #ffd86f;

		&:focus-visible {
			outline: 4px solid #67c7bf;
			outline-offset: 3px;
		}
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
