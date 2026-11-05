<script lang="ts">
	import type { Creature } from './additionProblem';
	import CountingGroup from './CountingGroup.svelte';

	let {
		answer,
		creature,
		departing,
		focused,
		focusVersion,
		onselect
	}: {
		answer: number;
		creature: Creature;
		departing: boolean;
		focused: boolean;
		focusVersion: number;
		onselect: () => void;
	} = $props();

	const BURST_PARTICLE_COUNT = 12;
	const burstIndexes = [...Array(BURST_PARTICLE_COUNT).keys()];

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

<div class="finale" class:departing class:focused>
	<div class="parade">
		<div class="followers">
			{#key focusVersion}
				<CountingGroup value={answer} {creature} placement="result" {focused} {onselect} />
			{/key}
		</div>
		<div class="leader">
			<button
				type="button"
				class="giant"
				onpointerdown={handlePointerDown}
				onclick={handleClick}
				aria-label={`大きな${creature.label}、${answer}を聞く`}
			>
				<span aria-hidden="true">{creature.symbol}</span>
			</button>
			{#if focused}
				{#key focusVersion}
					<div class="burst" aria-hidden="true">
						{#each burstIndexes as index (index)}
							<span style:--angle={`${index * 30}deg`} style:--hue={`${index * 30}deg`}
								>{answer}</span
							>
						{/each}
					</div>
				{/key}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	$entrance-duration: 1.6s;
	$dance-duration: 1.2s;
	$departure-duration: 2.8s;
	$burst-duration: 1s;
	$child-hop-duration: 720ms;
	$child-hop-stagger: 95ms;
	$child-spin-duration: $child-hop-duration * 2;

	.finale {
		position: absolute;
		z-index: 6;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	.parade {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: clamp(0.25rem, 1vw, 1rem);
		width: 100%;
	}

	.followers {
		pointer-events: auto;
		animation: dance $dance-duration ease-in-out -400ms infinite alternate;

		:global(.counting-group:not(.focused) .number),
		:global(.counting-group:not(.focused) .number-digit) {
			animation: none;
		}

		:global(.counting-group:not(.focused) .creature) {
			animation: happy-hop $child-hop-duration ease-in-out
				calc(var(--creature-index) * -#{$child-hop-stagger}) infinite;
		}

		:global(.counting-group:not(.focused) .creature span) {
			transform-origin: center;
			animation: child-spin $child-spin-duration linear
				calc(var(--creature-index) * -#{$child-hop-stagger}) infinite;
		}

		:global(.creature:nth-child(even) span) {
			animation-direction: reverse;
		}

		:global(.creatures) {
			width: min(44vw, 25rem);
			max-width: 44vw;
		}
	}

	.leader {
		position: relative;
		animation: rise-from-below $entrance-duration cubic-bezier(0.18, 0.7, 0.25, 1) both;
	}

	.giant {
		display: block;
		padding: 0;
		border: 0;
		background: transparent;
		font: inherit;
		font-size: clamp(8rem, 43vmin, 26rem);
		line-height: 1;
		pointer-events: auto;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		filter: drop-shadow(0 0 1rem #fff8) drop-shadow(0 0.6rem 0 #7557e82b);

		&:focus-visible {
			outline: 5px solid #67c7bf;
			border-radius: 2rem;
		}
		span {
			display: block;
			animation: dance $dance-duration ease-in-out $entrance-duration infinite alternate;
		}
	}

	.departing .parade {
		animation: depart $departure-duration cubic-bezier(0.4, 0, 0.6, 1) forwards;
	}
	.focused .parade {
		animation-play-state: paused;
	}

	.burst {
		position: absolute;
		inset: 50% auto auto 50%;
		span {
			position: absolute;
			color: hsl(var(--hue) 85% 62%);
			font-size: clamp(3rem, 8vmin, 6rem);
			font-weight: 900;
			text-shadow: 0 2px #fff;
			animation: burst $burst-duration ease-out both;
		}
	}

	@keyframes burst {
		from {
			opacity: 1;
			transform: rotate(var(--angle)) translateX(0) rotate(calc(-1 * var(--angle))) scale(0.3);
		}
		to {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(30vmin) rotate(calc(-1 * var(--angle))) scale(1.2);
		}
	}

	@keyframes rise-from-below {
		from {
			transform: translate(2vw, 100dvh);
		}
		to {
			transform: translate(0, 0);
		}
	}

	@keyframes dance {
		from {
			transform: translateY(0.15rem) rotate(-2deg);
		}
		to {
			transform: translateY(-0.35rem) rotate(2deg);
		}
	}

	@keyframes child-spin {
		from {
			rotate: 0deg;
		}
		to {
			rotate: 360deg;
		}
	}

	@keyframes happy-hop {
		0%,
		100% {
			transform: translateY(0) rotate(-6deg) scale(1.08, 0.92);
		}
		20% {
			transform: translateY(-0.6rem) rotate(4deg) scale(0.94, 1.08);
		}
		45% {
			transform: translateY(-2rem) rotate(12deg) scale(1.05);
		}
		70% {
			transform: translateY(-0.4rem) rotate(-8deg) scale(0.98, 1.04);
		}
		85% {
			transform: translateY(0.15rem) rotate(-4deg) scale(1.12, 0.88);
		}
	}

	@keyframes depart {
		0%,
		8% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(110vw);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.followers :global(.counting-group:not(.focused) .creature),
		.followers :global(.counting-group:not(.focused) .creature span) {
			animation: none;
		}
		.leader,
		.giant,
		.giant span,
		.followers,
		.burst span {
			animation: none;
		}
		.burst {
			display: none;
		}
		.departing .parade {
			animation: none;
			opacity: 0;
		}
	}
</style>
