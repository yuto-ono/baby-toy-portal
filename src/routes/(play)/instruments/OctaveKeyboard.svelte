<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
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
	const pointerNotes = new SvelteMap<number, number>();
	const activeNotes = $derived([...new Set(pointerNotes.values())]);

	let { volume }: { volume: number } = $props();

	function playNote(noteIndex: number) {
		tonePlayer.play(notes[noteIndex].frequency, volume);
	}

	function getNoteIndexAtPoint(clientX: number, clientY: number) {
		const key = document
			.elementFromPoint(clientX, clientY)
			?.closest<HTMLButtonElement>('button[data-note-index]');

		if (!key || !key.closest('.note-grid')) {
			return null;
		}

		const noteIndex = Number(key.dataset.noteIndex);
		return Number.isInteger(noteIndex) && noteIndex >= 0 && noteIndex < notes.length
			? noteIndex
			: null;
	}

	function handlePointerDown(event: PointerEvent) {
		const noteIndex = getNoteIndexAtPoint(event.clientX, event.clientY);
		if (noteIndex === null) {
			return;
		}

		pointerNotes.set(event.pointerId, noteIndex);
		(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
		playNote(noteIndex);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!pointerNotes.has(event.pointerId)) {
			return;
		}

		const noteIndex = getNoteIndexAtPoint(event.clientX, event.clientY);
		if (noteIndex === null || noteIndex === pointerNotes.get(event.pointerId)) {
			return;
		}

		pointerNotes.set(event.pointerId, noteIndex);
		playNote(noteIndex);
	}

	function finishPointer(event: PointerEvent) {
		pointerNotes.delete(event.pointerId);
	}

	onMount(() => {
		function cleanupSession() {
			pointerNotes.clear();
			tonePlayer.destroy();
		}

		function handleVisibilityChange() {
			if (document.visibilityState === 'hidden') {
				cleanupSession();
			}
		}

		window.addEventListener('pagehide', cleanupSession);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			window.removeEventListener('pagehide', cleanupSession);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			cleanupSession();
		};
	});
</script>

<section class="instrument">
	<div
		class="note-grid"
		role="group"
		aria-label="1オクターブの鍵盤"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={finishPointer}
		onpointercancel={finishPointer}
		onlostpointercapture={finishPointer}
	>
		{#each notes as note, index (note.frequency)}
			<!-- NOTE: 音名は視覚表示せず、色と音で自由に遊ぶ体験を優先する。支援技術向けの音名は aria-label で提供する。 -->
			<button
				type="button"
				class:active={activeNotes.includes(index)}
				style:--note-color={note.color}
				aria-label={`${note.solfege}、${note.name}`}
				data-note-index={index}
			></button>
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
		touch-action: none;
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
