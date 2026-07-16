const NOTE_DURATION_SECONDS = 0.32;
const NOTE_INTERVAL_MS = 360;
const PEAK_GAIN = 0.11;
const SILENCE_GAIN = 0.0001;

const twinkleNotes = [
	261.63, 261.63, 392, 392, 440, 440, 392, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63,
	392, 392, 349.23, 349.23, 329.63, 329.63, 293.66, 392, 392, 349.23, 349.23, 329.63, 329.63,
	293.66, 261.63, 261.63, 392, 392, 440, 440, 392, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66,
	261.63
];

export function createTwinklePlayer() {
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

		const now = context.currentTime;
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = 'triangle';
		oscillator.frequency.setValueAtTime(twinkleNotes[noteIndex], now);
		gain.gain.setValueAtTime(SILENCE_GAIN, now);
		gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, now + 0.015);
		gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + NOTE_DURATION_SECONDS);
		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(now);
		oscillator.stop(now + NOTE_DURATION_SECONDS);
		noteIndex = (noteIndex + 1) % twinkleNotes.length;
		timer = setTimeout(playNote, NOTE_INTERVAL_MS);
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
