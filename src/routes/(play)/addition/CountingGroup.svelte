<script lang="ts">
	import type { Creature } from './additionProblem';

	let {
		value,
		creature,
		placement,
		focused = false,
		onselect
	}: {
		value: number;
		creature: Creature;
		placement: 'left' | 'right' | 'result';
		focused?: boolean;
		onselect: () => void;
	} = $props();

	function handlePointerDown(event: PointerEvent) {
		event.stopPropagation();
		onselect();
	}

	function handleClick(event: MouseEvent) {
		if (event.detail === 0) {
			event.stopPropagation();
			onselect();
		}
	}
</script>

<div
	class="counting-group"
	class:focused
	class:left={placement === 'left'}
	class:right={placement === 'right'}
	class:result={placement === 'result'}
>
	<button
		type="button"
		class="number"
		onpointerdown={handlePointerDown}
		onclick={handleClick}
		aria-label={`${value}を聞く`}
	>
		{value}
	</button>

	<div
		class="creatures"
		style:--creature-row-width={`${Math.min(value, 5) * 5}rem`}
		aria-label={`${creature.label}${value}こ`}
	>
		{#each Array.from({ length: value }).keys() as index (index)}
			<button
				type="button"
				class="creature"
				style:--creature-index={index}
				onpointerdown={handlePointerDown}
				onclick={handleClick}
				aria-label={`${creature.label}${index + 1}こめ、${value}を聞く`}
			>
				<span aria-hidden="true">{creature.symbol}</span>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	$ink: #333145;
	$slot-size: clamp(3.7rem, 6.4vw, 5rem);

	.counting-group {
		display: flex;
		align-items: center;
		gap: clamp(0.45rem, 1.3vw, 1rem);
		transform-origin: center;

		&.left {
			flex-direction: row-reverse;
		}

		&.result {
			flex-direction: column;
			gap: 0.3rem;
		}

		&.focused {
			animation: group-wiggle 1s ease-in-out;

			.number {
				animation: number-pop 1s ease-in-out;
			}

			.creatures {
				filter: drop-shadow(0 0 0.8rem #fff4a6);
			}

			.creature {
				animation: creature-hop 0.55s ease-in-out calc(var(--creature-index) * 35ms) 2 alternate;
			}
		}
	}

	.number,
	.creature {
		border: 0;
		font: inherit;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;

		&:focus-visible {
			outline: 5px solid #67c7bf;
			outline-offset: 3px;
		}
	}

	.number {
		display: grid;
		min-width: clamp(5rem, 9vw, 7rem);
		min-height: clamp(5rem, 9vw, 7rem);
		place-items: center;
		padding: 0.2rem 0.6rem;
		border: 4px solid $ink;
		border-radius: 50%;
		background: #fffef8;
		color: #ec6274;
		font-size: clamp(4rem, 8vw, 6.3rem);
		font-weight: 900;
		line-height: 1;
		box-shadow: 0.35rem 0.35rem 0 #ffd86f;
	}

	.result .number {
		min-width: clamp(6.4rem, 12vw, 9rem);
		min-height: clamp(6.4rem, 12vw, 9rem);
		background: #fff9c8;
		color: #e95370;
		font-size: clamp(5.3rem, 10vw, 8rem);
		box-shadow:
			0 0 1.5rem #ffe260,
			0.45rem 0.45rem 0 #ff91a4;
	}

	.creatures {
		display: flex;
		width: var(--creature-row-width);
		max-width: calc(100vw - 10rem);
		justify-content: center;
		flex-wrap: wrap;
		padding: 0.25rem;
		border-radius: 1.3rem;
		background: rgba(#fff, 0.62);
	}

	.creature {
		display: grid;
		width: $slot-size;
		height: $slot-size;
		place-items: center;
		padding: 0;
		background: transparent;

		span {
			display: block;
			font-size: clamp(2.9rem, 5.2vw, 4.2rem);
			line-height: 1;
			filter: drop-shadow(0 0.12rem 0 rgba($ink, 0.18));
		}
	}

	.result .creature span {
		font-size: clamp(3.3rem, 5.8vw, 4.8rem);
	}

	@keyframes number-pop {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
		}

		25% {
			transform: scale(1.16) rotate(-5deg);
		}

		55% {
			transform: scale(1.2) rotate(5deg);
		}
	}

	@keyframes group-wiggle {
		0%,
		100% {
			filter: saturate(1);
		}

		50% {
			filter: saturate(1.22) brightness(1.05);
		}
	}

	@keyframes creature-hop {
		from {
			transform: translateY(0) rotate(-4deg) scale(1);
		}

		to {
			transform: translateY(-0.7rem) rotate(5deg) scale(1.12);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.counting-group.focused,
		.counting-group.focused .number,
		.counting-group.focused .creature {
			animation-duration: 1ms;
			animation-iteration-count: 1;
		}
	}
</style>
