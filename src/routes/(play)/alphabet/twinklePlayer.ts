import {
	TWINKLE_NOTE_DURATION_SECONDS,
	TWINKLE_NOTES,
	TWINKLE_STEP_DURATION_MS
} from './twinkleMelody';

const PEAK_GAIN = 0.11;
const SILENCE_GAIN = 0.0001;

type TwinklePlayerOptions = {
	onStep?: (step: number) => void;
};

export function createTwinklePlayer({ onStep }: TwinklePlayerOptions = {}) {
	let context: AudioContext | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let noteIndex = 0;

	function stop() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function playNote() {
		if (!context || context.state !== 'running') {
			return;
		}

		onStep?.(noteIndex);
		const frequency = TWINKLE_NOTES[noteIndex];
		if (frequency !== null) {
			const now = context.currentTime;
			const oscillator = context.createOscillator();
			const gain = context.createGain();
			oscillator.type = 'triangle';
			oscillator.frequency.setValueAtTime(frequency, now);
			gain.gain.setValueAtTime(SILENCE_GAIN, now);
			gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, now + 0.015);
			gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + TWINKLE_NOTE_DURATION_SECONDS);
			oscillator.connect(gain);
			gain.connect(context.destination);
			oscillator.start(now);
			oscillator.stop(now + TWINKLE_NOTE_DURATION_SECONDS);
		}

		noteIndex = (noteIndex + 1) % TWINKLE_NOTES.length;
		timer = setTimeout(playNote, TWINKLE_STEP_DURATION_MS);
	}

	async function start() {
		if (timer !== null) {
			return;
		}

		context ??= new AudioContext();
		try {
			await context.resume();
		} catch {
			return;
		}

		if (context.state === 'running' && timer === null) {
			playNote();
		}
	}

	function destroy() {
		stop();
		const activeContext = context;
		context = null;
		if (activeContext?.state !== 'closed') {
			void activeContext?.close().catch(() => {});
		}
	}

	return { start, stop, destroy };
}
