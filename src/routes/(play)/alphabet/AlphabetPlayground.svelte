<script lang="ts">
	import { onMount } from 'svelte';
	import { LETTER_TRAVEL_DURATION_MS, createBurstMotions } from './alphabetMotion';
	import {
		BARRAGE_START_STEP,
		LANE_TOP_PERCENTAGES,
		createBarrageLetters,
		createBarrageOrder,
		createTimedLetter,
		type TimedLetter
	} from './alphabetTimeline';
	import { createTwinklePlayer } from './twinklePlayer';

	type BurstParticle = ReturnType<typeof createBurstMotions>[number] & { x: number; y: number };

	let letters = $state<TimedLetter[]>([]);
	let particles = $state<BurstParticle[]>([]);
	let nextId = 0;
	let recentLanes = $state<number[]>([]);
	let barrageOrder = createBarrageOrder();

	const twinklePlayer = createTwinklePlayer({
		onStep(step) {
			if (step === BARRAGE_START_STEP) {
				barrageOrder = createBarrageOrder();
			}

			const regularLetter = createTimedLetter(nextId, step, recentLanes);
			const barrageLetters = createBarrageLetters(
				nextId + (regularLetter ? 1 : 0),
				step,
				barrageOrder,
				recentLanes
			);
			const newLetters = regularLetter ? [regularLetter, ...barrageLetters] : barrageLetters;
			if (newLetters.length === 0) {
				return;
			}
			if (regularLetter) {
				void twinklePlayer.playLetter(regularLetter.letter);
			}

			nextId += newLetters.length;
			recentLanes = [...recentLanes, ...newLetters.map((letter) => letter.lane)].slice(
				-(LANE_TOP_PERCENTAGES.length - 1)
			);
			letters = [...letters, ...newLetters];
			for (const letter of newLetters) {
				setTimeout(() => {
					letters = letters.filter((item) => item.id !== letter.id);
				}, LETTER_TRAVEL_DURATION_MS);
			}
		}
	});

	function popLetter(event: MouseEvent | PointerEvent, letter: TimedLetter) {
		void twinklePlayer.start();
		void twinklePlayer.playLetter(letter.letter);
		letters = letters.filter((item) => item.id !== letter.id);
		const burst = createBurstMotions(letter).map((particle) => ({
			...particle,
			x: event.clientX,
			y: event.clientY
		}));
		particles = [...particles, ...burst];
		setTimeout(() => {
			const burstIds = new Set(burst.map((particle) => particle.id));
			particles = particles.filter((particle) => !burstIds.has(particle.id));
		}, 1_150);
	}

	function startMusic() {
		void twinklePlayer.start();
	}

	function handleLetterPointerDown(event: PointerEvent, letter: TimedLetter) {
		event.stopPropagation();
		popLetter(event, letter);
	}

	function handleLetterClick(event: MouseEvent, letter: TimedLetter) {
		if (event.detail === 0) {
			popLetter(event, letter);
		}
	}

	onMount(() => {
		return () => {
			twinklePlayer.destroy();
		};
	});
</script>

<section class="playground" aria-label="アルファベットで遊ぶ場所" onpointerdown={startMusic}>
	<p class="hint">ながれてくる もじを タップしてね</p>

	{#each letters as letter (letter.id)}
		<button
			type="button"
			class="letter"
			class:barrage={letter.kind === 'barrage'}
			style:--letter-color={letter.color}
			style:--lane-top={`${LANE_TOP_PERCENTAGES[letter.lane]}%`}
			style:--letter-travel-duration={`${LETTER_TRAVEL_DURATION_MS}ms`}
			style:--reduced-letter-travel-duration={`${LETTER_TRAVEL_DURATION_MS * 2}ms`}
			onpointerdown={(event) => handleLetterPointerDown(event, letter)}
			onclick={(event) => handleLetterClick(event, letter)}
			aria-label={`${letter.letter}を聞く`}
		>
			{letter.letter}
		</button>
	{/each}

	{#each particles as particle (particle.id)}
		<span
			class="particle"
			style:--particle-color={particle.color}
			style:--particle-x={`${particle.x}px`}
			style:--particle-y={`${particle.y}px`}
			style:--particle-offset-x={`${particle.offsetX}rem`}
			style:--particle-offset-y={`${particle.offsetY}rem`}
			style:--particle-scale={particle.scale}
			aria-hidden="true"
		>
			{particle.letter}
		</span>
	{/each}
</section>

<style lang="scss">
	$ink: #333145;

	.playground {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-image:
			radial-gradient(circle, rgba(#ff9eaa, 0.24) 0 0.35rem, transparent 0.4rem),
			radial-gradient(circle, rgba(#65c8bd, 0.2) 0 0.28rem, transparent 0.33rem);
		background-position:
			0 0,
			2.7rem 2.7rem;
		background-size: 5.4rem 5.4rem;
		touch-action: manipulation;
	}

	.hint {
		position: absolute;
		top: clamp(1rem, 4vw, 2rem);
		left: 50%;
		z-index: 1;
		margin: 0;
		padding: 0.55rem 1.15rem;
		border: 3px solid rgba(#ff9eaa, 0.65);
		border-radius: 999px;
		background: rgba(#fffafc, 0.94);
		box-shadow:
			0 0.3rem 0 rgba(#ff9eaa, 0.3),
			0 0.45rem 1rem rgba($ink, 0.08);
		color: $ink;
		font-size: clamp(1rem, 3.5vw, 1.35rem);
		font-weight: 800;
		transform: translateX(-50%);
		white-space: nowrap;

		&::before,
		&::after {
			color: #f2aa18;
			content: '✦';
		}

		&::before {
			margin-right: 0.55rem;
		}

		&::after {
			margin-left: 0.55rem;
		}
	}

	.letter {
		position: absolute;
		top: var(--lane-top);
		left: 0.75rem;
		z-index: 2;
		display: grid;
		width: clamp(6.75rem, 18vw, 10rem);
		aspect-ratio: 1;
		place-items: center;
		padding: 0;
		border: clamp(3px, 0.5vw, 4px) solid var(--letter-color);
		border-radius: 46% 54% 50% 50%;
		background: linear-gradient(145deg, #fff 0 38%, #fff4dc 100%);
		box-shadow:
			inset 0.45rem 0.55rem 0 rgba(#fff, 0.75),
			0 0.4rem 0 color-mix(in srgb, var(--letter-color) 35%, transparent),
			0 0.65rem 1rem rgba($ink, 0.12);
		color: $ink;
		cursor: pointer;
		font: inherit;
		font-size: clamp(5.5rem, 15vw, 8.5rem);
		font-weight: 900;
		line-height: 1;
		text-shadow: none;
		-webkit-tap-highlight-color: transparent;
		animation: travel-from-left var(--letter-travel-duration) linear forwards;

		&:focus-visible {
			outline: 5px solid #fff;
			outline-offset: 5px;
		}

		&.barrage {
			width: clamp(4.5rem, 12vw, 7rem);
			font-size: clamp(3.5rem, 10vw, 5.75rem);
		}
	}

	.particle {
		position: fixed;
		z-index: 5;
		left: var(--particle-x);
		top: var(--particle-y);
		color: var(--particle-color);
		font-size: clamp(2.4rem, 8vw, 5rem);
		font-weight: 900;
		line-height: 1;
		text-shadow: 0 0.08em 0 #fff;
		pointer-events: none;
		animation: scatter 1.1s cubic-bezier(0.12, 0.78, 0.21, 1) forwards;
	}

	@keyframes travel-from-left {
		from {
			transform: translateX(0);
		}

		to {
			transform: translateX(110vw);
		}
	}

	@keyframes scatter {
		from {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.35);
		}

		35% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.25);
		}

		to {
			opacity: 0;
			transform: translate(
					calc(-50% + var(--particle-offset-x)),
					calc(-50% + var(--particle-offset-y))
				)
				scale(var(--particle-scale));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.letter {
			animation-duration: var(--reduced-letter-travel-duration);
		}

		.particle {
			animation-duration: 1.5s;
		}
	}
</style>
