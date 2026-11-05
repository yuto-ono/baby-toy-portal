<script lang="ts">
	let { answer, firstTry }: { answer: number; firstTry: boolean } = $props();

	const BACKGROUND_NUMBER_COUNT = 35;
	const CONFETTI_NUMBER_COUNT = 72;
	const numberIndexes = [...Array(BACKGROUND_NUMBER_COUNT).keys()];
	const confettiIndexes = [...Array(CONFETTI_NUMBER_COUNT).keys()];
</script>

<div class="bonus-background" aria-hidden="true">
	<div class="celebration-rays"></div>
	<div class="celebration-ring"></div>
	<div class="celebration-ring second-ring"></div>
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
		animation: background-arrives 2s ease-out forwards;

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

	.celebration-rays {
		position: absolute;
		inset: -100%;
		background: repeating-conic-gradient(from 0deg, #ffe07830 0deg 12deg, transparent 12deg 30deg);
		animation: rays-turn 24s linear infinite;
	}

	.celebration-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		width: min(55vw, 32rem);
		aspect-ratio: 1;
		border: 1.5rem solid #ffe479;
		border-radius: 50%;
		box-shadow:
			0 0 0 1rem #ff9dc5,
			0 0 0 2rem #b8adff,
			0 0 3rem 2rem #fff8;
		animation: celebration-wave 1.6s ease-out both;
	}

	.second-ring {
		animation-delay: 350ms;
	}

	@keyframes rays-turn {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes celebration-wave {
		from {
			opacity: 0.85;
			transform: translate(-50%, -50%) scale(0.1);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(2.5);
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
		0% {
			opacity: 0;
			transform: scale(1.08);
		}
		15%,
		45% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1);
			visibility: hidden;
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
		.bonus-background span,
		.celebration-rays,
		.celebration-ring {
			animation-duration: 1ms;
			animation-iteration-count: 1;
		}

		.number-confetti span {
			animation-duration: 1ms;
		}
	}
</style>
