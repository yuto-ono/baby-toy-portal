import { base } from '$app/paths';
import type { Letter } from './alphabetMotion';
import { getLetterAudioPath } from './letterAudio';
import {
	TWINKLE_NOTE_DURATION_SECONDS,
	TWINKLE_NOTES,
	TWINKLE_STEP_DURATION_MS
} from './twinkleMelody';

const PEAK_GAIN = 0.11;
const LETTER_AUDIO_GAIN = PEAK_GAIN / 2;
const SILENCE_GAIN = 0.0001;

type TwinklePlayerOptions = {
	onStep?: (step: number) => void;
};

export function createTwinklePlayer({ onStep }: TwinklePlayerOptions = {}) {
	let context: AudioContext | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let noteIndex = 0;
	let activeLetterSource: AudioBufferSourceNode | null = null;
	let letterPlayVersion = 0;
	const letterBufferRequests = new Map<Letter, Promise<AudioBuffer | null>>();

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

	async function getReadyContext() {
		context ??= new AudioContext();
		const activeContext = context;
		try {
			await activeContext.resume();
		} catch {
			return null;
		}

		return activeContext === context && activeContext.state === 'running' ? activeContext : null;
	}

	function decodeAudioData(activeContext: AudioContext, data: ArrayBuffer) {
		return new Promise<AudioBuffer>((resolve, reject) => {
			activeContext.decodeAudioData(data, resolve, reject);
		});
	}

	function loadLetterBuffer(activeContext: AudioContext, letter: Letter) {
		const existingRequest = letterBufferRequests.get(letter);
		if (existingRequest) {
			return existingRequest;
		}

		const request = fetch(getLetterAudioPath(letter, base))
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to load letter audio: ${response.status}`);
				}
				return response.arrayBuffer();
			})
			.then((data) => decodeAudioData(activeContext, data))
			.catch(() => {
				letterBufferRequests.delete(letter);
				return null;
			});
		letterBufferRequests.set(letter, request);
		return request;
	}

	async function start() {
		if (timer !== null) {
			return;
		}

		const activeContext = await getReadyContext();
		if (activeContext === null) {
			return;
		}

		if (activeContext === context && timer === null) {
			playNote();
		}
	}

	async function playLetter(letter: Letter) {
		const playVersion = ++letterPlayVersion;
		const activeContext = await getReadyContext();
		if (activeContext === null) {
			return;
		}

		const buffer = await loadLetterBuffer(activeContext, letter);
		if (
			buffer === null ||
			playVersion !== letterPlayVersion ||
			activeContext !== context ||
			activeContext.state !== 'running'
		) {
			return;
		}

		try {
			activeLetterSource?.stop();
		} catch {
			// すでに終了した音源は停止済みとして扱う。
		}

		const source = activeContext.createBufferSource();
		const gain = activeContext.createGain();
		source.buffer = buffer;
		gain.gain.setValueAtTime(LETTER_AUDIO_GAIN, activeContext.currentTime);
		source.connect(gain);
		gain.connect(activeContext.destination);
		source.onended = () => {
			if (activeLetterSource === source) {
				activeLetterSource = null;
			}
		};
		activeLetterSource = source;
		source.start();
	}

	function destroy() {
		stop();
		letterPlayVersion += 1;
		letterBufferRequests.clear();
		try {
			activeLetterSource?.stop();
		} catch {
			// すでに終了した音源は停止済みとして扱う。
		}
		activeLetterSource = null;
		const activeContext = context;
		context = null;
		if (activeContext?.state !== 'closed') {
			void activeContext?.close().catch(() => {});
		}
	}

	return { start, stop, playLetter, destroy };
}
