<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createTonePlayer } from './tonePlayer';

	const notes = [
		{ solfege: 'ド', name: 'C', frequency: 261.63, color: '#ff8f91' },
		{ solfege: 'レ', name: 'D', frequency: 293.66, color: '#ffb66e' },
		{ solfege: 'ミ', name: 'E', frequency: 329.63, color: '#ffd866' },
		{ solfege: 'ファ', name: 'F', frequency: 349.23, color: '#a9dc76' },
		{ solfege: 'ソ', name: 'G', frequency: 392.0, color: '#68d4c4' },
		{ solfege: 'ラ', name: 'A', frequency: 440.0, color: '#72b9f4' },
		{ solfege: 'シ', name: 'B', frequency: 493.88, color: '#a99bea' },
		{ solfege: 'ド', name: 'C', frequency: 523.25, color: '#ef91ca' }
	];

	const tonePlayer = createTonePlayer();
	let activeNote = $state<number | null>(null);
	let activeNoteTimer: ReturnType<typeof setTimeout> | undefined;

	function playNote(noteIndex: number) {
		tonePlayer.play(notes[noteIndex].frequency);

		activeNote = noteIndex;
		clearTimeout(activeNoteTimer);
		activeNoteTimer = setTimeout(() => {
			activeNote = null;
		}, 400);
	}

	onDestroy(() => {
		clearTimeout(activeNoteTimer);
		tonePlayer.destroy();
	});
</script>

<section class="instrument" aria-label="1オクターブの鍵盤">
	<div class="note-grid">
		{#each notes as note, index (note.frequency)}
			<button
				type="button"
				class:active={activeNote === index}
				style:--note-color={note.color}
				aria-label={`${note.solfege}、${note.name}`}
				onpointerdown={() => playNote(index)}
			>
				<span class="solfege">{note.solfege}</span>
				<span class="note-name">{note.name}</span>
			</button>
		{/each}
	</div>
</section>

<style lang="scss">
	$ink: #333145;

	.instrument {
		width: min(100%, 72rem);
		align-self: center;
		padding: clamp(1rem, 3vw, 2rem) clamp(0.5rem, 2vw, 1.5rem);
	}

	.note-grid {
		display: grid;
		height: clamp(10rem, 55dvh, 30rem);
		grid-template-columns: repeat(8, minmax(0, 1fr));
		gap: clamp(0.2rem, 1vw, 0.75rem);
	}

	button {
		--note-color: #fff;

		display: flex;
		min-width: 0;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: clamp(0.05rem, 0.5vw, 0.15rem);
		padding: clamp(0.15rem, 1vw, 0.5rem);
		border: clamp(2px, 0.4vw, 4px) solid $ink;
		border-radius: clamp(0.65rem, 2vw, 1.75rem);
		background: var(--note-color);
		box-shadow: 0 clamp(0.3rem, 1vw, 0.55rem) 0 $ink;
		color: $ink;
		cursor: pointer;
		font: inherit;
		touch-action: manipulation;
		transition:
			transform 80ms ease,
			box-shadow 80ms ease,
			filter 120ms ease;
		-webkit-tap-highlight-color: transparent;

		&:hover {
			filter: brightness(1.04);
		}

		&:active,
		&.active {
			transform: translateY(clamp(0.25rem, 0.8vw, 0.45rem));
			box-shadow: 0 0.1rem 0 $ink;
			filter: brightness(1.08);
		}

		&:focus-visible {
			outline: 4px solid #fff;
			outline-offset: -8px;
		}
	}

	.solfege {
		font-size: clamp(1rem, 4vw, 3.25rem);
		font-weight: 900;
		line-height: 1.05;
	}

	.note-name {
		font-size: clamp(0.65rem, 1.8vw, 1.35rem);
		font-weight: 900;
		line-height: 1;
		opacity: 0.75;
	}

	@media (max-height: 620px) and (orientation: landscape) {
		.instrument {
			padding-block: 0.75rem 1rem;
		}

		.note-grid {
			height: min(50dvh, 14rem);
			column-gap: 0.6rem;
		}
	}
</style>
