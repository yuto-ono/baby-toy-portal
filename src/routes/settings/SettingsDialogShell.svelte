<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { Snippet } from 'svelte';

	let {
		labelledBy,
		variant,
		onClose,
		children
	}: {
		labelledBy: string;
		variant: 'setup' | 'gate';
		onClose: () => void;
		children: Snippet;
	} = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#fff8e7" />
</svelte:head>

<main>
	<button
		class="backdrop"
		type="button"
		tabindex="-1"
		aria-label="設定を閉じて戻る"
		onclick={onClose}
	></button>

	<a class="home-link" href={resolve('/')}>
		<ArrowLeft size={26} strokeWidth={3} aria-hidden="true" />
		<span>戻る</span>
	</a>

	<div class={['dialog', `dialog-${variant}`]} role="dialog" aria-labelledby={labelledBy}>
		{@render children()}
	</div>
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	main {
		position: relative;
		display: flex;
		min-height: 100dvh;
		align-items: center;
		flex-direction: column;
		padding: 1rem;
		background:
			linear-gradient(rgba($ink, 0.55), rgba($ink, 0.55)),
			radial-gradient(circle at 10% 14%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 90% 86%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}

	.backdrop {
		position: absolute;
		z-index: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.home-link {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-self: flex-start;
		align-items: center;
		gap: 0.4rem;
		min-height: 3rem;
		padding: 0.65rem 1rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-yellow;
		color: inherit;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 3px;
		}
	}

	.dialog {
		position: relative;
		z-index: 1;
		margin: auto 0;
	}

	.dialog-setup {
		width: min(100%, 34rem);
	}

	.dialog-setup :global(section) {
		width: 100%;
		margin: 0;
		box-shadow: 8px 8px 0 $accent-pink;
	}

	.dialog-gate {
		width: min(100%, 28rem);
		padding: clamp(1.5rem, 6vw, 2.5rem);
		border: 3px solid $ink;
		border-radius: 2rem;
		background: #fff;
		text-align: center;
		box-shadow: 8px 8px 0 $accent-pink;
		cursor: auto;
	}

	@media (orientation: landscape) and (min-width: 44rem) {
		main {
			padding: 0.75rem;
		}

		.home-link {
			position: absolute;
			top: 0.75rem;
			left: 0.75rem;
		}

		.dialog-setup {
			width: min(calc(100% - 2rem), 48rem);
		}

		.dialog-gate {
			display: grid;
			width: min(calc(100% - 2rem), 46rem);
			padding: 1.5rem 2rem;
			grid-template-columns: minmax(13rem, 0.8fr) minmax(19rem, 1.2fr);
			align-items: center;
			gap: 1.5rem;
		}
	}
</style>
