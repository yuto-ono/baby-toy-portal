<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	let {
		title,
		backHref = '/',
		backLabel = '戻る'
	}: {
		title: string;
		backHref?: RouteId;
		backLabel?: string;
	} = $props();
</script>

<header class="page-navigation">
	<a href={resolve(backHref)} class="back-link">
		<ArrowLeft size={24} strokeWidth={3} aria-hidden="true" />
		<span>{backLabel}</span>
	</a>
	<h1>{title}</h1>
</header>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.page-navigation {
		display: flex;
		width: 100%;
		align-items: center;
		gap: clamp(1rem, 4vw, 2rem);
		padding: 0.8rem clamp(1rem, 4vw, 1.5rem);
		background: #fff;
		box-shadow: 0 4px 12px rgba($ink, 0.12);
	}

	.back-link {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.35rem;
		padding: 0.65rem 0.9rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-yellow;
		color: inherit;
		font-size: 1rem;
		font-weight: 800;
		line-height: 1;
		text-decoration: none;
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 3px 0 $ink;
		}

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 3px;
		}
	}

	h1 {
		min-width: 0;
		margin: 0;
		font-size: clamp(1.25rem, 5vw, 2rem);
		line-height: 1.25;
		letter-spacing: 0.03em;
	}

	@media (max-width: 480px) {
		.page-navigation {
			gap: 0.8rem;
			padding: 0.7rem;
		}

		.back-link {
			padding: 0.6rem 0.75rem;
		}
	}
</style>
