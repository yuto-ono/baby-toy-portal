<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import type { Snippet } from 'svelte';

	let {
		href,
		label,
		description,
		icon
	}: {
		href: RouteId;
		label: string;
		description: string;
		icon: Snippet;
	} = $props();
</script>

<a class="play-card" href={resolve(href)}>
	<span class="icon" aria-hidden="true">
		{@render icon()}
	</span>
	<span class="label">{label}</span>
	<span class="description">{description}</span>
</a>

<style lang="scss">
	$ink: #333145;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.play-card {
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: clamp(2rem, 8vw, 3.5rem) 1.5rem;
		border: 4px solid $ink;
		border-radius: 2.5rem;
		background: #fff;
		color: inherit;
		text-align: center;
		text-decoration: none;
		box-shadow: 10px 10px 0 $accent-pink;
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;

		&:hover {
			transform: translate(3px, 3px);
			box-shadow: 7px 7px 0 $accent-pink;
		}

		&:focus-visible {
			outline: 5px solid $accent-mint;
			outline-offset: 5px;
		}
	}

	.icon {
		display: grid;
		width: 6.5rem;
		height: 6.5rem;
		place-items: center;
		border: 3px solid $ink;
		border-radius: 50%;
		background: $accent-yellow;
	}

	.label {
		margin-top: 1.5rem;
		font-size: clamp(1.75rem, 7vw, 2.5rem);
		font-weight: 800;
		line-height: 1.25;
	}

	.description {
		margin-top: 0.6rem;
		font-size: 1rem;
		font-weight: 700;
	}

	@media (max-width: 480px) {
		.play-card {
			border-width: 3px;
			border-radius: 2rem;
			box-shadow: 7px 7px 0 $accent-pink;

			&:hover {
				box-shadow: 4px 4px 0 $accent-pink;
			}
		}
	}
</style>
