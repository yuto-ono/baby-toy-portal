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

	const TAP_BURST_PARTICLES = [
		'number',
		'creature',
		'star',
		'number',
		'creature',
		'dot',
		'number',
		'creature',
		'star',
		'number',
		'creature',
		'dot',
		'number',
		'creature',
		'star',
		'dot'
	] as const;

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
		<span class="number-digits" aria-hidden="true">
			{#each String(value) as digit, index (`${digit}-${index}`)}
				<span class="number-digit" style:--digit-index={index}>{digit}</span>
			{/each}
		</span>
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

	{#if focused}
		<div class="tap-burst" aria-hidden="true">
			{#each TAP_BURST_PARTICLES as particle, index (index)}
				<span class="tap-particle tap-particle-{index}">
					{#if particle === 'number'}
						{value}
					{:else if particle === 'creature'}
						{creature.symbol}
					{:else if particle === 'star'}
						★
					{:else}
						●
					{/if}
				</span>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	$ink: #333145;
	$slot-size: clamp(3.7rem, 6.4vw, 5rem);

	.counting-group {
		position: relative;
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
			z-index: 10;
			animation: group-wiggle 1s cubic-bezier(0.16, 0.86, 0.24, 1.22);

			.number {
				animation: number-pop 1s cubic-bezier(0.16, 0.86, 0.24, 1.22);
			}

			.creatures {
				filter: drop-shadow(0 0 1.2rem #fff36b);
			}

			.creature {
				animation: creature-party 0.82s cubic-bezier(0.16, 0.86, 0.24, 1.2)
					calc(var(--creature-index) * 28ms) both;
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
		display: block;
		min-width: clamp(4.5rem, 8vw, 6.4rem);
		padding: 0.25rem 0.4rem;
		background: transparent;
		color: #ec6274;
		font-size: clamp(4rem, 8vw, 6.3rem);
		font-weight: 900;
		line-height: 1;
		filter: drop-shadow(0.16rem 0.2rem 0 #fff) drop-shadow(0.28rem 0.34rem 0 #ffd642);
		animation: number-arrives 820ms cubic-bezier(0.16, 0.86, 0.24, 1.3) both;
	}

	.number-digits {
		display: flex;
		justify-content: center;
	}

	.number-digit {
		display: inline-block;
		transform-origin: 50% 85%;
		animation: digit-dance 760ms ease-in-out calc(180ms + var(--digit-index) * 100ms) both;
	}

	.result .number {
		min-width: clamp(5.8rem, 11vw, 8.4rem);
		color: #e95370;
		font-size: clamp(5.3rem, 10vw, 8rem);
		filter: drop-shadow(0 0 0.7rem #fff) drop-shadow(0 0 1.4rem #ffe260)
			drop-shadow(0.35rem 0.42rem 0 #ff91a4);
	}

	.creatures {
		display: flex;
		width: var(--creature-row-width);
		max-width: calc(100vw - 10rem);
		justify-content: center;
		flex-wrap: wrap;
	}

	.creature {
		display: grid;
		width: $slot-size;
		height: $slot-size;
		place-items: center;
		padding: 0;
		background: transparent;
		animation: creature-arrives 720ms cubic-bezier(0.16, 0.86, 0.24, 1.22)
			calc(var(--creature-index) * 70ms) both;

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

	.tap-burst {
		position: absolute;
		z-index: 20;
		top: 50%;
		left: 50%;
		width: 1px;
		height: 1px;
		pointer-events: none;

		&::before,
		&::after {
			position: absolute;
			top: 0;
			left: 0;
			width: clamp(5rem, 10vw, 8rem);
			aspect-ratio: 1;
			border: clamp(0.45rem, 0.8vw, 0.7rem) solid #fff45d;
			border-radius: 50%;
			content: '';
			transform: translate(-50%, -50%) scale(0.1);
			animation: tap-shockwave 920ms ease-out both;
		}

		&::after {
			border-color: #ff6d9a;
			animation-delay: 100ms;
		}
	}

	.tap-particle {
		position: absolute;
		color: #ff4e79;
		font-size: clamp(2.5rem, 5.8vw, 4.8rem);
		font-weight: 900;
		line-height: 1;
		text-shadow:
			0 0.14rem 0 #fff,
			0 0 0.5rem #ffe45e;
		filter: drop-shadow(0 0 0.35rem #fff);
		animation: tap-particle-fly 980ms cubic-bezier(0.12, 0.7, 0.24, 1) both;
	}

	@for $index from 0 through 15 {
		.tap-particle-#{$index} {
			--particle-angle: #{$index * 22.5deg - 90deg};
			--particle-counter-angle: #{90deg - $index * 22.5deg};
			--particle-end-angle: #{450deg - $index * 22.5deg};
			--particle-distance: #{10rem + ($index % 4) * 1.5rem};
			animation-delay: #{$index * 10ms};

			@if $index % 3 == 1 {
				color: #ffbd24;
			} @else if $index % 3 == 2 {
				color: #7557e8;
			}
		}
	}

	@keyframes number-arrives {
		0% {
			opacity: 0;
			transform: translateY(-4rem) scale(0.2) rotate(-22deg);
		}
		55% {
			opacity: 1;
			transform: translateY(0.5rem) scale(1.28) rotate(10deg);
		}
		75% {
			transform: translateY(-0.35rem) scale(0.92) rotate(-6deg);
		}
		100% {
			transform: translateY(0) scale(1) rotate(0deg);
		}
	}

	@keyframes digit-dance {
		0% {
			transform: translateY(-1.2rem) rotate(-15deg) scaleY(0.65);
		}
		35% {
			transform: translateY(0.25rem) rotate(12deg) scaleY(1.2);
		}
		65% {
			transform: translateY(-0.55rem) rotate(-8deg) scaleY(0.92);
		}
		100% {
			transform: translateY(0) rotate(0deg) scaleY(1);
		}
	}

	@keyframes creature-arrives {
		0% {
			opacity: 0;
			transform: translateY(3.5rem) scale(0.1) rotate(-35deg);
		}
		58% {
			opacity: 1;
			transform: translateY(-1rem) scale(1.35) rotate(14deg);
		}
		78% {
			transform: translateY(0.25rem) scale(0.9) rotate(-8deg);
		}
		100% {
			transform: translateY(0) scale(1) rotate(0deg);
		}
	}

	@keyframes number-pop {
		0% {
			transform: scale(1) rotate(0deg);
		}
		28% {
			transform: translateY(-1.2rem) scale(1.65) rotate(-14deg);
		}
		58% {
			transform: translateY(0.25rem) scale(1.25) rotate(12deg);
		}
		78% {
			transform: translateY(-0.35rem) scale(1.48) rotate(-6deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}

	@keyframes group-wiggle {
		0% {
			filter: saturate(1);
		}

		32% {
			filter: saturate(1.7) brightness(1.14);
			transform: scale(1.25) rotate(-3deg);
		}
		62% {
			transform: scale(1.12) rotate(3deg);
		}
		100% {
			filter: saturate(1);
			transform: scale(1) rotate(0deg);
		}
	}

	@keyframes creature-party {
		0% {
			transform: translateY(0) rotate(0deg) scale(1);
		}
		38% {
			transform: translateY(-2.2rem) rotate(calc(-18deg + var(--creature-index) * 5deg)) scale(1.55);
		}
		68% {
			transform: translateY(0.3rem) rotate(12deg) scale(1.22);
		}
		100% {
			transform: translateY(0) rotate(0deg) scale(1);
		}
	}

	@keyframes tap-particle-fly {
		0% {
			opacity: 1;
			transform: rotate(var(--particle-angle)) translateX(0) rotate(var(--particle-counter-angle))
				scale(0.15);
		}
		22% {
			opacity: 1;
			transform: rotate(var(--particle-angle)) translateX(3rem)
				rotate(var(--particle-counter-angle)) scale(1.45);
		}
		76% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: rotate(var(--particle-angle)) translateX(var(--particle-distance))
				rotate(var(--particle-end-angle)) scale(1.1);
		}
	}

	@keyframes tap-shockwave {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.1);
		}
		65% {
			opacity: 0.85;
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(3.8);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.counting-group.focused,
		.counting-group.focused .number,
		.counting-group.focused .creature,
		.number,
		.number-digit,
		.creature,
		.tap-particle,
		.tap-burst::before,
		.tap-burst::after {
			animation-duration: 1ms;
			animation-iteration-count: 1;
		}
	}
</style>
