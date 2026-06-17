<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { Snippet } from 'svelte';

	let {
		title,
		backHref = '/',
		backLabel = '戻る',
		actions
	}: {
		title: string;
		backHref?: RouteId;
		backLabel?: string;
		actions?: Snippet;
	} = $props();
</script>

<header class="page-navigation">
	<a href={resolve(backHref)} class="back-link">
		<ArrowLeft size={24} strokeWidth={3} aria-hidden="true" />
		<span>{backLabel}</span>
	</a>
	<h1>{title}</h1>
	{#if actions}
		<div class="actions">
			{@render actions()}
		</div>
	{/if}
</header>

<style lang="scss">
	$ink: #333145;
	$navigation-background: #fff;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.page-navigation {
		display: grid;
		width: 100%;
		align-items: center;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: clamp(1rem, 4vw, 2rem);
		padding: 0.8rem clamp(1rem, 4vw, 1.5rem);
		background: $navigation-background;
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

	.actions {
		min-width: 0;
	}

	@media (max-width: 640px) {
		.page-navigation {
			gap: 0.5rem;
			padding: 0.7rem;
		}

		.back-link {
			gap: 0;
			padding: 0.6rem 0.65rem;

			span {
				position: absolute;
				width: 1px;
				height: 1px;
				overflow: hidden;
				clip: rect(0 0 0 0);
				white-space: nowrap;
			}
		}

		h1 {
			font-size: 1.1rem;
			line-height: 1.2;
			word-break: keep-all;
		}
	}
</style>
