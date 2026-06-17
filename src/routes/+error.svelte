<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import House from '@lucide/svelte/icons/house';

	const isNotFound = $derived(page.status === 404);
	const message = $derived(isNotFound ? 'ページが見つかりません' : 'エラーが発生しました');
</script>

<svelte:head>
	<title>{message} | Baby Toy Portal</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<section aria-labelledby="error-heading">
		<p class="status">{page.status}{isNotFound ? ' Not Found' : ''}</p>
		<h1 id="error-heading">{message}</h1>
		{#if isNotFound}
			<p class="description">お探しのページは、移動または削除された可能性があります。</p>
		{/if}
		<a href={resolve('/')}>
			<House size={20} strokeWidth={2.75} aria-hidden="true" />
			ホーム画面へ戻る
		</a>
	</section>
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$accent-pink: #ff8d8d;
	$accent-mint: #67c7bf;

	main {
		display: grid;
		min-height: 100dvh;
		place-items: center;
		padding: 2rem 1.5rem;
		background:
			radial-gradient(circle at 12% 18%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}

	section {
		width: min(100%, 36rem);
		padding: clamp(2.5rem, 8vw, 4rem) clamp(1.5rem, 7vw, 3.5rem);
		border: 4px solid $ink;
		border-radius: 2.5rem;
		background: #fff;
		text-align: center;
		box-shadow: 10px 10px 0 $accent-pink;
	}

	.status {
		margin: 0;
		color: #df5b69;
		font-size: clamp(1.5rem, 5vw, 2rem);
		font-weight: 800;
		line-height: 1;
	}

	h1 {
		margin: 1rem 0 0;
		font-size: clamp(1.75rem, 6vw, 2.5rem);
		line-height: 1.3;
	}

	.description {
		margin: 1rem 0 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.8;
	}

	a {
		display: inline-flex;
		min-height: 3.5rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 2rem;
		padding: 0.75rem 1.75rem;
		border: 3px solid $ink;
		border-radius: 999px;
		background: #fff;
		color: inherit;
		font-size: 1rem;
		font-weight: 800;
		text-decoration: none;
		box-shadow: 5px 5px 0 $accent-mint;
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;

		&:hover {
			transform: translate(2px, 2px);
			box-shadow: 3px 3px 0 $accent-mint;
		}

		&:focus-visible {
			outline: 5px solid $accent-mint;
			outline-offset: 5px;
		}
	}

	@media (max-width: 480px) {
		section {
			border-width: 3px;
			border-radius: 2rem;
			box-shadow: 7px 7px 0 $accent-pink;
		}
	}
</style>
