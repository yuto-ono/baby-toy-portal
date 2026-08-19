<script lang="ts">
	import { onMount } from 'svelte';
	import { createAdditionAudioPlayer } from './additionAudioPlayer';
	import { createAdditionProblem } from './additionProblem';
	import {
		ADDITION_STEP_DURATION_MS,
		ADDITION_STEPS,
		getAdditionAnnouncement,
		type AdditionPhase
	} from './additionTimeline';
	import CountingGroup from './CountingGroup.svelte';

	type FocusedGroup = 'left' | 'right' | 'result';

	const TAP_PAUSE_DURATION_MS = 1_000;
	const MAGIC_PARTICLES = ['★', '●', '✦', '★', '●', '✦', '★', '●'] as const;

	let started = $state(false);
	let problem = $state(createAdditionProblem());
	let stepIndex = $state(0);
	let focusedGroup = $state<FocusedGroup | null>(null);
	let focusVersion = $state(0);
	let stepTimer: ReturnType<typeof setTimeout> | null = null;
	let focusTimer: ReturnType<typeof setTimeout> | null = null;
	let stepDeadline = 0;
	let remainingStepMs = ADDITION_STEP_DURATION_MS;

	const phase = $derived(ADDITION_STEPS[stepIndex]);
	const additionAudioPlayer = createAdditionAudioPlayer();

	function clearStepTimer() {
		if (stepTimer !== null) {
			clearTimeout(stepTimer);
			stepTimer = null;
		}
	}

	function playPhase(activeProblem = problem, activePhase: AdditionPhase = phase) {
		void additionAudioPlayer.play(getAdditionAnnouncement(activeProblem, activePhase));
	}

	function scheduleNextStep(delay = ADDITION_STEP_DURATION_MS) {
		clearStepTimer();
		remainingStepMs = delay;
		stepDeadline = performance.now() + delay;
		stepTimer = setTimeout(() => {
			stepTimer = null;
			const nextStepIndex = stepIndex + 1;

			if (nextStepIndex < ADDITION_STEPS.length) {
				stepIndex = nextStepIndex;
				playPhase(problem, ADDITION_STEPS[nextStepIndex]);
			} else {
				const nextProblem = createAdditionProblem(problem);
				problem = nextProblem;
				stepIndex = 0;
				void additionAudioPlayer.prepare(nextProblem);
				playPhase(nextProblem, ADDITION_STEPS[0]);
			}

			scheduleNextStep();
		}, delay);
	}

	function start() {
		if (started) {
			return;
		}

		started = true;
		void additionAudioPlayer.prepare(problem);
		playPhase(problem, ADDITION_STEPS[0]);
		scheduleNextStep();
	}

	function handleStartPointerDown(event: PointerEvent) {
		event.stopPropagation();
		start();
	}

	function handleStartClick(event: MouseEvent) {
		if (event.detail === 0) {
			start();
		}
	}

	function focus(group: FocusedGroup, value: number) {
		if (focusedGroup === null) {
			remainingStepMs = Math.max(0, stepDeadline - performance.now());
			clearStepTimer();
		}

		if (focusTimer !== null) {
			clearTimeout(focusTimer);
		}

		focusedGroup = group;
		focusVersion += 1;
		void additionAudioPlayer.play({ type: 'number', value }, true);
		focusTimer = setTimeout(() => {
			focusTimer = null;
			focusedGroup = null;
			scheduleNextStep(remainingStepMs);
		}, TAP_PAUSE_DURATION_MS);
	}

	onMount(() => {
		return () => {
			clearStepTimer();
			if (focusTimer !== null) {
				clearTimeout(focusTimer);
			}
			additionAudioPlayer.destroy();
		};
	});
</script>

<section
	class="playground phase-{phase}"
	class:started
	class:paused={focusedGroup !== null}
	aria-label="足し算で遊ぶ場所"
>
	<div class="sky-decoration decoration-one" aria-hidden="true">☁</div>
	<div class="sky-decoration decoration-two" aria-hidden="true">☁</div>

	{#if !started}
		<button
			type="button"
			class="start-button"
			onpointerdown={handleStartPointerDown}
			onclick={handleStartClick}
		>
			<span class="start-symbols" aria-hidden="true">
				<span>🐰</span><span>🍎</span><span>🐤</span>
			</span>
			<span class="start-label">タップで はじめる</span>
			<span class="start-hand" aria-hidden="true">👆</span>
		</button>
	{:else}
		<div class="equation" aria-live="polite">
			<span>{problem.left}</span>
			<span class="operator">+</span>
			<span>{problem.right}</span>
		</div>

		{#if stepIndex <= 5}
			<div class="traveler left-traveler">
				{#key focusedGroup === 'left' ? focusVersion : 0}
					<CountingGroup
						value={problem.left}
						creature={problem.creature}
						placement="left"
						focused={focusedGroup === 'left'}
						onselect={() => focus('left', problem.left)}
					/>
				{/key}
			</div>
		{/if}

		{#if stepIndex >= 1 && stepIndex <= 5}
			<div class="traveler right-traveler">
				{#key focusedGroup === 'right' ? focusVersion : 0}
					<CountingGroup
						value={problem.right}
						creature={problem.creature}
						placement="right"
						focused={focusedGroup === 'right'}
						onselect={() => focus('right', problem.right)}
					/>
				{/key}
			</div>
		{/if}

		{#if phase === 'magic'}
			<div class="magic-cloud" aria-hidden="true">
				<span class="magic-word">わ〜！</span>
				{#each MAGIC_PARTICLES as particle, index (index)}
					<span class="magic-particle particle-{index}">{particle}</span>
				{/each}
			</div>
		{/if}

		{#if stepIndex >= 6}
			<div class="result-group">
				<span class="sparkle sparkle-one" aria-hidden="true">✦</span>
				<span class="sparkle sparkle-two" aria-hidden="true">★</span>
				<span class="sparkle sparkle-three" aria-hidden="true">✦</span>
				{#key focusedGroup === 'result' ? focusVersion : 0}
					<CountingGroup
						value={problem.total}
						creature={problem.creature}
						placement="result"
						focused={focusedGroup === 'result'}
						onselect={() => focus('result', problem.total)}
					/>
				{/key}
			</div>
		{/if}
	{/if}
</section>

<style lang="scss">
	$ink: #333145;
	$step-duration: 1s;

	.playground {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background:
			radial-gradient(circle at 50% 115%, rgba(#8dd9a5, 0.8) 0 34%, transparent 34.2%),
			linear-gradient(#c9efff 0 68%, #fff8d6 68% 100%);
		touch-action: manipulation;
	}

	.sky-decoration {
		position: absolute;
		color: rgba(#fff, 0.88);
		font-size: clamp(5rem, 10vw, 8rem);
		line-height: 1;
		pointer-events: none;
	}

	.decoration-one {
		top: 5%;
		left: 8%;
	}

	.decoration-two {
		top: 18%;
		right: 7%;
		transform: scale(0.72);
	}

	.start-button {
		position: absolute;
		z-index: 10;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;
		padding: 2rem;
		border: 0;
		background: rgba(#fff8e7, 0.32);
		color: $ink;
		font: inherit;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;

		&:focus-visible {
			outline: 0.5rem solid #67c7bf;
			outline-offset: -0.75rem;
		}
	}

	.start-symbols {
		display: flex;
		align-items: end;
		gap: clamp(1rem, 4vw, 3rem);
		font-size: clamp(5rem, 11vw, 9rem);
		filter: drop-shadow(0 0.35rem 0 rgba($ink, 0.15));
		animation: start-bob 1.5s ease-in-out infinite alternate;

		span:nth-child(2) {
			transform: translateY(-1.25rem) rotate(5deg);
		}
	}

	.start-label {
		padding: 0.75rem 1.5rem;
		border: 4px solid $ink;
		border-radius: 999px;
		background: #fff;
		font-size: clamp(1.8rem, 4vw, 3rem);
		font-weight: 900;
		box-shadow: 0.45rem 0.45rem 0 #ffd86f;
	}

	.start-hand {
		font-size: clamp(3rem, 6vw, 5rem);
		animation: tap-hint 0.9s ease-in-out infinite;
	}

	.equation {
		position: absolute;
		top: 7%;
		left: 50%;
		z-index: 4;
		display: flex;
		align-items: center;
		gap: clamp(0.65rem, 2vw, 1.4rem);
		padding: 0.35rem 1.4rem;
		border: 4px solid $ink;
		border-radius: 999px;
		background: rgba(#fff, 0.95);
		font-size: clamp(3.5rem, 7vw, 5.5rem);
		font-weight: 900;
		line-height: 1;
		opacity: 0;
		transform: translateX(-50%) scale(0.5);
		box-shadow: 0.35rem 0.35rem 0 #ffd86f;
		pointer-events: none;
	}

	.operator {
		color: #ef6578;
	}

	.phase-equation .equation,
	.phase-magic .equation {
		opacity: 1;
		transform: translateX(-50%) scale(1);
		transition:
			opacity 180ms ease,
			transform 500ms cubic-bezier(0.18, 0.9, 0.28, 1.35);
	}

	.phase-magic .equation {
		animation: equation-vanish $step-duration ease-in forwards;
	}

	.traveler {
		position: absolute;
		z-index: 3;
		top: 54%;
		animation-duration: $step-duration;
		animation-fill-mode: both;
		animation-timing-function: ease-out;
	}

	.left-traveler {
		left: 4%;
	}

	.right-traveler {
		right: 4%;
	}

	.phase-left-arrives .left-traveler {
		animation-name: left-enter;
	}

	.phase-right-arrives .right-traveler {
		animation-name: right-enter;
	}

	.phase-left-moves .left-traveler {
		animation-name: left-move;
	}

	.phase-left-moves .right-traveler,
	.phase-right-moves .right-traveler,
	.phase-equation .right-traveler {
		right: 4%;
	}

	.phase-right-moves .left-traveler,
	.phase-equation .left-traveler {
		left: 16%;
	}

	.phase-right-moves .right-traveler {
		animation-name: right-move;
	}

	.phase-equation .left-traveler,
	.phase-equation .right-traveler {
		opacity: 0.78;
		transform: translateY(-50%) scale(0.84);
		transition:
			opacity 350ms ease,
			transform 350ms ease;
	}

	.phase-magic .left-traveler {
		animation-name: merge-left;
	}

	.phase-magic .right-traveler {
		animation-name: merge-right;
	}

	.paused .traveler,
	.paused .equation,
	.paused .result-group {
		animation-play-state: paused;
	}

	.magic-cloud {
		position: absolute;
		z-index: 6;
		top: 54%;
		left: 50%;
		display: grid;
		width: clamp(12rem, 24vw, 19rem);
		aspect-ratio: 1;
		place-items: center;
		border-radius: 50%;
		background: rgba(#fff, 0.92);
		color: #ef6578;
		transform: translate(-50%, -50%);
		box-shadow:
			-5rem 1rem 0 -2rem rgba(#fff, 0.88),
			5rem 1.5rem 0 -2.2rem rgba(#fff, 0.88),
			0 0 2rem #ffe67a;
		animation: magic-pop $step-duration cubic-bezier(0.2, 0.85, 0.3, 1.2) both;
	}

	.magic-word {
		font-size: clamp(3rem, 6vw, 5rem);
		font-weight: 900;
	}

	.magic-particle {
		position: absolute;
		color: #ffc52e;
		font-size: clamp(1.4rem, 3vw, 2.4rem);
		animation: particle-fly $step-duration ease-out both;
	}

	@for $index from 0 through 7 {
		.particle-#{$index} {
			--particle-angle: #{$index * 45deg};
			animation-delay: #{$index * 25ms};
		}
	}

	.result-group {
		position: absolute;
		z-index: 5;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation-duration: $step-duration;
		animation-fill-mode: both;
	}

	.phase-result-one .result-group {
		animation-name: result-pop;
		animation-timing-function: cubic-bezier(0.18, 0.9, 0.28, 1.28);
	}

	.phase-result-two .result-group {
		animation-name: result-bounce;
	}

	.phase-result-three .result-group {
		animation-name: result-shine;
	}

	.phase-clear .result-group {
		animation-name: result-clear;
		animation-timing-function: ease-in;
	}

	.sparkle {
		position: absolute;
		z-index: 7;
		color: #ffc928;
		font-size: clamp(2rem, 5vw, 4rem);
		text-shadow: 0 0 0.6rem #fff;
		animation: sparkle 700ms ease-in-out infinite alternate;
		pointer-events: none;
	}

	.sparkle-one {
		top: -5%;
		left: -12%;
	}

	.sparkle-two {
		top: 18%;
		right: -15%;
		animation-delay: 180ms;
	}

	.sparkle-three {
		right: 8%;
		bottom: 4%;
		animation-delay: 340ms;
	}

	@keyframes left-enter {
		from {
			left: -48%;
			transform: translateY(-50%);
		}
		to {
			left: 4%;
			transform: translateY(-50%);
		}
	}

	@keyframes right-enter {
		from {
			right: -48%;
			transform: translateY(-50%);
		}
		to {
			right: 4%;
			transform: translateY(-50%);
		}
	}

	@keyframes left-move {
		from {
			left: 4%;
			transform: translateY(-50%);
		}
		to {
			left: 16%;
			transform: translateY(-50%);
		}
	}

	@keyframes right-move {
		from {
			right: 4%;
			transform: translateY(-50%);
		}
		to {
			right: 16%;
			transform: translateY(-50%);
		}
	}

	@keyframes merge-left {
		from {
			left: 16%;
			opacity: 0.78;
			transform: translateY(-50%) scale(0.84);
		}
		to {
			left: 50%;
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.45) rotate(12deg);
		}
	}

	@keyframes merge-right {
		from {
			right: 16%;
			opacity: 0.78;
			transform: translateY(-50%) scale(0.84);
		}
		to {
			right: 50%;
			opacity: 0;
			transform: translate(50%, -50%) scale(0.45) rotate(-12deg);
		}
	}

	@keyframes equation-vanish {
		to {
			opacity: 0;
			transform: translateX(-50%) scale(0.65);
		}
	}

	@keyframes magic-pop {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.15) rotate(-12deg);
		}
		45% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.12) rotate(4deg);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.35) rotate(0deg);
		}
	}

	@keyframes particle-fly {
		from {
			opacity: 1;
			transform: rotate(var(--particle-angle)) translateX(1rem) scale(0.4);
		}
		to {
			opacity: 0;
			transform: rotate(var(--particle-angle)) translateX(9rem) scale(1.25);
		}
	}

	@keyframes result-pop {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.18) rotate(-7deg);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
	}

	@keyframes result-bounce {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -54%) scale(1.06);
		}
	}

	@keyframes result-shine {
		0%,
		100% {
			filter: brightness(1);
			transform: translate(-50%, -50%) rotate(0deg);
		}
		30% {
			filter: brightness(1.12);
			transform: translate(-50%, -50%) rotate(-2deg);
		}
		70% {
			transform: translate(-50%, -50%) rotate(2deg);
		}
	}

	@keyframes result-clear {
		from {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -54%) scale(0.72);
		}
	}

	@keyframes sparkle {
		from {
			opacity: 0.45;
			transform: scale(0.7) rotate(-12deg);
		}
		to {
			opacity: 1;
			transform: scale(1.25) rotate(12deg);
		}
	}

	@keyframes start-bob {
		from {
			transform: translateY(0) rotate(-1deg);
		}
		to {
			transform: translateY(-0.8rem) rotate(1deg);
		}
	}

	@keyframes tap-hint {
		0%,
		100% {
			transform: translateY(0) scale(1);
		}
		50% {
			transform: translateY(-0.65rem) scale(1.1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.start-symbols,
		.start-hand,
		.traveler,
		.equation,
		.magic-cloud,
		.magic-particle,
		.result-group,
		.sparkle {
			animation-duration: 1ms;
			animation-iteration-count: 1;
		}
	}
</style>
