<script lang="ts">
	import { onMount } from 'svelte';

	let {
		options,
		correctAnswer,
		oncorrect
	}: {
		options: readonly [number, number];
		correctAnswer: number;
		oncorrect: () => void;
	} = $props();

	const WRONG_ANSWER_EXIT_DURATION_MS = 280;

	let removedAnswers = $state<number[]>([]);
	let disappearingAnswer = $state<number | null>(null);
	let selectedCorrectAnswer = $state<number | null>(null);
	let removalTimer: ReturnType<typeof setTimeout> | null = null;
	let visibleOptions = $derived(options.filter((option) => !removedAnswers.includes(option)));

	function select(answer: number) {
		if (disappearingAnswer === answer || selectedCorrectAnswer !== null) {
			return;
		}

		if (answer === correctAnswer) {
			selectedCorrectAnswer = answer;
			oncorrect();
			return;
		}

		disappearingAnswer = answer;
		removalTimer = setTimeout(() => {
			removedAnswers = [...removedAnswers, answer];
			disappearingAnswer = null;
			removalTimer = null;
		}, WRONG_ANSWER_EXIT_DURATION_MS);
	}

	function handlePointerDown(event: PointerEvent, answer: number) {
		event.stopPropagation();
		select(answer);
	}

	function handleClick(event: MouseEvent, answer: number) {
		if (event.detail === 0) {
			event.stopPropagation();
			select(answer);
		}
	}

	onMount(() => {
		return () => {
			if (removalTimer !== null) {
				clearTimeout(removalTimer);
			}
		};
	});
</script>

<div
	class="answer-choices"
	aria-label={selectedCorrectAnswer === null ? 'こたえを えらんでね' : undefined}
>
	{#if selectedCorrectAnswer !== null}
		<div class="answer-complete" role="status" aria-label={`${selectedCorrectAnswer}、せいかい`}>
			<span class="complete-number" aria-hidden="true">{selectedCorrectAnswer}</span>
			<span class="complete-label" aria-hidden="true">せいかい！</span>
		</div>
	{:else}
		{#each visibleOptions as option (option)}
			<button
				type="button"
				class:disappearing={disappearingAnswer === option}
				disabled={disappearingAnswer === option}
				onpointerdown={(event) => handlePointerDown(event, option)}
				onclick={(event) => handleClick(event, option)}
				aria-label={`${option}`}
			>
				{option}
			</button>
		{/each}
	{/if}
</div>

<style lang="scss">
	$ink: #333145;

	.answer-choices {
		position: absolute;
		z-index: 8;
		bottom: clamp(1rem, 4vh, 2.5rem);
		left: 50%;
		display: flex;
		width: min(34rem, calc(100% - 2rem));
		justify-content: center;
		gap: clamp(1rem, 4vw, 2.5rem);
		transform: translateX(-50%);
	}

	button {
		position: relative;
		display: grid;
		width: clamp(7rem, 18vw, 10rem);
		aspect-ratio: 1.35;
		place-items: center;
		padding: 0;
		border: 0.35rem solid #fff;
		border-radius: 2rem;
		background: linear-gradient(145deg, #fff 0 45%, #fff0a8 100%);
		color: #7557e8;
		font: inherit;
		font-size: clamp(4rem, 9vw, 6.5rem);
		font-weight: 900;
		line-height: 1;
		box-shadow:
			0 0.55rem 0 #ffc756,
			0 0.8rem 1.2rem rgba($ink, 0.18);
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		animation: choice-arrives 480ms cubic-bezier(0.18, 0.9, 0.28, 1.25) both;

		&:nth-child(2) {
			color: #ef6578;
			animation-delay: 90ms;
		}

		&:focus-visible {
			outline: 0.4rem solid #67c7bf;
			outline-offset: 0.25rem;
		}

		&.disappearing {
			pointer-events: none;
			animation: wrong-answer-leaves 280ms ease-in forwards;
		}
	}

	.answer-complete {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		min-width: clamp(10rem, 24vw, 14rem);
		color: #ec5478;
		pointer-events: none;
		animation: correct-answer-party 800ms cubic-bezier(0.16, 0.86, 0.24, 1.22) both;

		&::after {
			position: absolute;
			inset: 42% auto auto 50%;
			width: 180%;
			color: #ffc928;
			font-size: clamp(1.7rem, 4vw, 3rem);
			line-height: 1;
			text-align: center;
			text-shadow: 0 0 0.45rem #fff;
			content: '★  ✦  ★';
			animation: correct-answer-sparkles 800ms ease-out both;
		}
	}

	.complete-number {
		font-size: clamp(4.5rem, 10vw, 7rem);
		font-weight: 900;
		line-height: 0.85;
		filter: drop-shadow(0.16rem 0.2rem 0 #fff) drop-shadow(0.28rem 0.34rem 0 #ffd642);
	}

	.complete-label {
		margin-top: 0.5rem;
		padding: 0.22rem 0.85rem;
		border-radius: 999px;
		background: rgba(#fff, 0.82);
		color: $ink;
		font-size: clamp(1rem, 2.5vw, 1.45rem);
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	@keyframes choice-arrives {
		from {
			opacity: 0;
			transform: translateY(3rem) scale(0.55) rotate(-8deg);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1) rotate(0deg);
		}
	}

	@keyframes wrong-answer-leaves {
		to {
			opacity: 0;
			transform: translateY(2rem) scale(0.1) rotate(16deg);
			box-shadow: none;
		}
	}

	@keyframes correct-answer-party {
		0% {
			transform: scale(1) rotate(0deg);
		}
		45% {
			transform: translateY(-1rem) scale(1.28) rotate(-7deg);
			box-shadow:
				0 0.7rem 0 #ffbe3e,
				0 0 2rem #fff36b;
		}
		75% {
			transform: scale(0.95) rotate(4deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}

	@keyframes correct-answer-sparkles {
		from {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.2) rotate(-12deg);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.45) rotate(10deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button,
		button.disappearing,
		.answer-complete,
		.answer-complete::after {
			animation-duration: 1ms;
		}
	}
</style>
