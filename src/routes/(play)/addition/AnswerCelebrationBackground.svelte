<script lang="ts">
	let { answer, firstTry }: { answer: number; firstTry: boolean } = $props();

	const BACKGROUND_NUMBER_COUNT = 35;
	const CONFETTI_NUMBER_COUNT = 72;
	const numberIndexes = [...Array(BACKGROUND_NUMBER_COUNT).keys()];
	const confettiIndexes = [...Array(CONFETTI_NUMBER_COUNT).keys()];
</script>

<div class="bonus-background" aria-hidden="true">
	{#each numberIndexes as index (index)}
		<span
			style:--bonus-angle={`${((index % 5) - 2) * 8}deg`}
			style:--bonus-delay={`${(index % 7) * 70}ms`}>{answer}</span
		>
	{/each}
	{#if firstTry}
		<div class="number-confetti" aria-hidden="true">
			{#each confettiIndexes as index (index)}
				<span
					style:--confetti-left={`${(index * 37) % 101}%`}
					style:--confetti-delay={`${(index % 12) * 75}ms`}
					style:--confetti-drift={`${((index % 7) - 3) * 2.2}rem`}
					style:--confetti-turn={`${(index % 2 === 0 ? 1 : -1) * (360 + (index % 4) * 90)}deg`}
					>{answer}</span
				>
			{/each}
		</div>
	{/if}
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

	.number-confetti {
		position: absolute;
		inset: 0;
		overflow: hidden;

		span {
			position: absolute;
			top: -12%;
			left: var(--confetti-left);
			color: #fff;
			font-size: clamp(1.8rem, 4.5vw, 3.8rem);
			font-weight: 900;
			line-height: 1;
			text-shadow:
				0 0.16rem 0 #ef4f91,
				0 0 0.75rem #fff;
			animation: number-confetti-falls 2.25s cubic-bezier(0.18, 0.72, 0.32, 1) var(--confetti-delay)
				both;
		}

		span:nth-child(3n + 2) {
			color: #ffe458;
			text-shadow:
				0 0.16rem 0 #e45a9e,
				0 0 0.75rem #fff;
		}

		span:nth-child(3n) {
			color: #9eeaff;
			text-shadow:
				0 0.16rem 0 #6757e8,
				0 0 0.75rem #fff;
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

	@keyframes number-confetti-falls {
		0% {
			opacity: 0;
			transform: translate(-50%, -4rem) rotate(0deg) scale(0.35);
		}
		12% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--confetti-drift)), 120vh) rotate(var(--confetti-turn))
				scale(1.2);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bonus-background,
		.bonus-background span {
			animation-duration: 1ms;
			animation-iteration-count: 1;
		}

		.number-confetti span {
			animation-duration: 1ms;
		}
	}
</style>
