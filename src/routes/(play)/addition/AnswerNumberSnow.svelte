<script lang="ts">
	let { answer }: { answer: number } = $props();

	const NUMBER_FLAKE_COUNT = 28;
	const flakeIndexes = [...Array(NUMBER_FLAKE_COUNT).keys()];
</script>

<div class="number-snow" aria-hidden="true">
	{#each flakeIndexes as index (index)}
		<span
			class="flake"
			style:--left={`${(index * 37 + 5) % 100}%`}
			style:--duration={`${5 + (index % 4)}s`}
			style:--delay={`${-index * 0.43}s`}
			style:--size={`${0.8 + (index % 3) * 0.2}`}
			style:--hue={`${(index % 7) * 50}deg`}><span>{answer}</span></span
		>
	{/each}
</div>

<style lang="scss">
	$sway-duration: 2s;

	.number-snow {
		position: absolute;
		z-index: 2;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.flake {
		position: absolute;
		top: -6rem;
		left: var(--left);
		color: hsl(var(--hue) 85% 62%);
		font-size: calc(clamp(2.5rem, 6vmin, 4.5rem) * var(--size));
		font-weight: 900;
		line-height: 1;
		text-shadow:
			0 2px 0 #fff,
			0 0 0.35rem #fff;
		animation: snowfall var(--duration) linear var(--delay) infinite;

		span {
			display: block;
			animation: sway $sway-duration ease-in-out var(--delay) infinite alternate;
		}
	}

	@keyframes snowfall {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(calc(100dvh + 12rem));
		}
	}

	@keyframes sway {
		from {
			transform: translateX(-1rem) rotate(-18deg);
		}
		to {
			transform: translateX(1rem) rotate(18deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flake {
			top: 15%;
			animation: none;
		}
		.flake:nth-child(even) {
			top: 75%;
		}
		.flake span {
			animation: none;
		}
	}
</style>
