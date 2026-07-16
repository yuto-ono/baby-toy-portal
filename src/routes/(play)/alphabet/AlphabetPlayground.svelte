<script lang="ts">
	import { onMount } from 'svelte';
	import {
		LETTER_SPAWN_INTERVAL_MS,
		LETTER_TRAVEL_DURATION_MS,
		createBurstMotions,
		createLetterMotion,
		type LetterMotion
	} from './alphabetMotion';
	import { createTwinklePlayer } from './twinklePlayer';

	type BurstParticle = ReturnType<typeof createBurstMotions>[number] & { x: number; y: number };

	const twinklePlayer = createTwinklePlayer();
	let letters = $state<LetterMotion[]>([]);
	let particles = $state<BurstParticle[]>([]);
	let nextId = 0;

	function addLetter() {
		const motion = createLetterMotion(nextId);
		nextId += 1;
		letters = [...letters, motion];
		setTimeout(() => {
			letters = letters.filter((letter) => letter.id !== motion.id);
		}, LETTER_TRAVEL_DURATION_MS);
	}

	function speak(letter: string) {
		if (!('speechSynthesis' in window)) {
			return;
		}

		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(letter);
		utterance.lang = 'en-US';
		utterance.rate = 0.78;
		utterance.pitch = 1.25;
		window.speechSynthesis.speak(utterance);
	}

	function popLetter(event: MouseEvent, letter: LetterMotion) {
		void twinklePlayer.start();
		speak(letter.letter);
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
		}, 900);
	}

	function startMusic() {
		void twinklePlayer.start();
	}

	onMount(() => {
		addLetter();
		const spawnTimer = window.setInterval(addLetter, LETTER_SPAWN_INTERVAL_MS);

		return () => {
			window.clearInterval(spawnTimer);
			twinklePlayer.destroy();
			window.speechSynthesis?.cancel();
		};
	});
</script>

<section class="playground" aria-label="アルファベットで遊ぶ場所" onpointerdown={startMusic}>
	<p class="hint">ながれてくる もじを タップしてね</p>

	{#each letters as letter (letter.id)}
		<button
			type="button"
			class:from-left={letter.direction === 'from-left'}
			class:from-bottom={letter.direction === 'from-bottom'}
			class="letter"
			style:--letter-color={letter.color}
			style:--letter-rotation={`${letter.rotation}deg`}
			onclick={(event) => popLetter(event, letter)}
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
			style:--particle-angle={`${particle.angle}deg`}
			style:--particle-distance={`${particle.distance}rem`}
			style:--particle-rotation={`${particle.rotation}deg`}
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
		touch-action: manipulation;
	}

	.hint {
		position: absolute;
		top: clamp(1rem, 4vw, 2rem);
		left: 50%;
		z-index: 1;
		margin: 0;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: rgba(#fff, 0.88);
		color: $ink;
		font-size: clamp(1rem, 3.5vw, 1.35rem);
		font-weight: 800;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.letter {
		--travel: max(100vw, 100dvh);

		position: absolute;
		z-index: 2;
		display: grid;
		width: clamp(5.5rem, 16vw, 9rem);
		aspect-ratio: 1;
		place-items: center;
		padding: 0;
		border: clamp(3px, 0.6vw, 5px) solid $ink;
		border-radius: 50%;
		background: var(--letter-color);
		box-shadow: 0 0.45rem 0 rgba($ink, 0.78);
		color: $ink;
		cursor: pointer;
		font: inherit;
		font-size: clamp(3.3rem, 11vw, 6rem);
		font-weight: 900;
		line-height: 1;
		-webkit-tap-highlight-color: transparent;

		&:focus-visible {
			outline: 5px solid #fff;
			outline-offset: 5px;
		}
	}

	.from-left {
		top: clamp(5rem, 38%, 45%);
		left: -10rem;
		animation: travel-from-left #{LETTER_TRAVEL_DURATION_MS}ms linear forwards;
	}

	.from-bottom {
		bottom: -10rem;
		left: clamp(1rem, 30%, 55%);
		animation: travel-from-bottom #{LETTER_TRAVEL_DURATION_MS}ms linear forwards;
	}

	.particle {
		position: fixed;
		z-index: 5;
		left: var(--particle-x);
		top: var(--particle-y);
		color: var(--particle-color);
		font-size: clamp(1.75rem, 6vw, 3.5rem);
		font-weight: 900;
		line-height: 1;
		pointer-events: none;
		animation: scatter 850ms cubic-bezier(0.16, 0.72, 0.22, 1) forwards;
	}

	@keyframes travel-from-left {
		from {
			transform: translate(0, 0) rotate(var(--letter-rotation));
		}

		to {
			transform: translate(var(--travel), calc(var(--travel) * -0.28))
				rotate(calc(var(--letter-rotation) + 180deg));
		}
	}

	@keyframes travel-from-bottom {
		from {
			transform: translate(0, 0) rotate(var(--letter-rotation));
		}

		to {
			transform: translate(calc(var(--travel) * 0.28), calc(var(--travel) * -1))
				rotate(calc(var(--letter-rotation) - 180deg));
		}
	}

	@keyframes scatter {
		from {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(0);
		}

		to {
			opacity: 0;
			transform: translate(
					calc(-50% + cos(var(--particle-angle)) * var(--particle-distance)),
					calc(-50% + sin(var(--particle-angle)) * var(--particle-distance))
				)
				rotate(var(--particle-rotation));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.letter {
			animation-duration: calc(#{LETTER_TRAVEL_DURATION_MS}ms * 2);
		}

		.particle {
			animation-duration: 1.5s;
		}
	}
</style>
