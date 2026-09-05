<script lang="ts">
	let { answer }: { answer: number } = $props();

	const BACKGROUND_NUMBER_COUNT = 35;
	const numberIndexes = [...Array(BACKGROUND_NUMBER_COUNT).keys()];
</script>

<div class="bonus-background" aria-hidden="true">
	{#each numberIndexes as index (index)}
		<span
			style:--bonus-angle={`${((index % 5) - 2) * 8}deg`}
			style:--bonus-delay={`${(index % 7) * 70}ms`}>{answer}</span
		>
	{/each}
</div>

<style lang="scss">
	.bonus-background {
		position: absolute;
		z-index: 1;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		grid-template-rows: repeat(5, 1fr);
		place-items: center;
		background:
			radial-gradient(circle at 18% 25%, rgba(#ff8fbc, 0.34), transparent 34%),
			radial-gradient(circle at 82% 28%, rgba(#8ddcff, 0.34), transparent 32%),
			radial-gradient(circle at 52% 78%, rgba(#ffe45e, 0.4), transparent 38%),
			linear-gradient(120deg, rgba(#ffd4eb, 0.9), rgba(#dbf7ff, 0.9), rgba(#fff0ae, 0.9));
		pointer-events: none;
		animation: background-arrives 1s ease-out both;

		span {
			color: rgba(#ef4f91, 0.2);
			font-size: clamp(3.2rem, 7vw, 6rem);
			font-weight: 900;
			line-height: 1;
			transform: rotate(var(--bonus-angle));
			animation: number-pulse 1.4s ease-in-out var(--bonus-delay) infinite alternate;

			&:nth-child(3n + 2) {
				color: rgba(#6757e8, 0.17);
			}

			&:nth-child(3n) {
				color: rgba(#f0a400, 0.2);
			}
		}
	}

	@keyframes background-arrives {
		from {
			opacity: 0;
			transform: scale(1.08);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes number-pulse {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
			transform: rotate(var(--bonus-angle)) scale(1.08);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bonus-background,
		.bonus-background span {
			animation-duration: 1ms;
			animation-iteration-count: 1;
		}
	}
</style>
