<script lang="ts">
	import type { Creature } from './additionProblem';

	let { answer, creature, departing }: { answer: number; creature: Creature; departing: boolean } =
		$props();
</script>

<div
	class="finale"
	class:departing
	role="status"
	aria-label={`${answer}、せいかい！${creature.label}が大きくなったよ！`}
>
	<div class="giant" aria-hidden="true"><span>{creature.symbol}</span></div>
</div>

<style lang="scss">
	$entrance-duration: 350ms;
	$dance-duration: 500ms;
	$departure-duration: 1s;

	.finale {
		position: absolute;
		z-index: 6;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	.giant {
		font-size: clamp(9rem, 28vmin, 18rem);
		line-height: 1;
		filter: drop-shadow(0 0 1rem #fff8) drop-shadow(0 0.6rem 0 #7557e82b);
		animation: grow $entrance-duration cubic-bezier(0.2, 0.9, 0.3, 1.3) both;

		span {
			display: block;
			animation: dance $dance-duration ease-in-out infinite alternate;
		}
	}

	.departing .giant {
		animation: depart $departure-duration ease-in forwards;
	}

	@keyframes grow {
		from {
			opacity: 0;
			transform: scale(0.1);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes dance {
		from {
			transform: translateY(0.3rem) rotate(-14deg) scale(1.05, 0.95);
		}
		to {
			transform: translateY(-1.6rem) rotate(14deg) scale(0.95, 1.05);
		}
	}

	@keyframes depart {
		0% {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
		30% {
			opacity: 1;
			transform: translateX(-8vw) scale(1.08);
		}
		100% {
			opacity: 0;
			transform: translateX(85vw) scale(0.7);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.giant,
		.giant span {
			animation: none;
		}
		.departing .giant {
			animation: none;
			opacity: 0;
		}
	}
</style>
