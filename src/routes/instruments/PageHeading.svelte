<script lang="ts">
	import { resolve } from '$app/paths';
	import House from '@lucide/svelte/icons/house';

	let { eyebrow, title }: { eyebrow: string; title: string } = $props();
</script>

<section class="page-heading" aria-labelledby="page-title">
	<p class="eyebrow">{eyebrow}</p>
	<h1 id="page-title">{title}</h1>
	<a href={resolve('/')} class="home-link" aria-label="トップページに戻る">
		<House size={24} strokeWidth={3} aria-hidden="true" />
		トップページに戻る
	</a>
</section>

<style lang="scss">
	$ink: #333145;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.page-heading {
		position: relative;
		width: min(100%, 44rem);
		padding: clamp(2.5rem, 8vw, 5rem) clamp(1.5rem, 7vw, 4rem);
		border: 4px solid $ink;
		border-radius: 2.5rem;
		background: #fff;
		box-shadow: 10px 10px 0 $accent-pink;
		text-align: center;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: #df5b69;
		font-size: clamp(0.7rem, 2vw, 0.85rem);
		font-weight: 800;
		letter-spacing: 0.18em;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.25rem, 9vw, 5rem);
		line-height: 1.2;
		letter-spacing: 0.04em;
	}

	.home-link {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: clamp(2rem, 7vw, 3rem);
		padding: 0.9rem 1.25rem;
		border: 3px solid $ink;
		border-radius: 999px;
		background: $accent-yellow;
		color: inherit;
		font-size: 1rem;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 4px 4px 0 $ink;
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;

		&:hover {
			transform: translate(2px, 2px);
			box-shadow: 2px 2px 0 $ink;
		}

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 4px;
		}
	}

	@media (max-width: 480px) {
		.page-heading {
			border-width: 3px;
			border-radius: 2rem;
			box-shadow: 7px 7px 0 $accent-pink;
		}
	}
</style>
