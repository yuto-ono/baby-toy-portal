import { base } from '$app/paths';
import type { AdditionProblem } from './additionProblem';
import type { AdditionAnnouncement } from './additionTimeline';
import { getEquationAudioPath, getMagicAudioPath, getNumberAudioPath } from './additionAudio';

const AUTOMATIC_AUDIO_GAIN = 0.035;
const TAP_AUDIO_GAIN = 0.055;
const MAGIC_AUDIO_GAIN = 0.03;

export function createAdditionAudioPlayer() {
	let context: AudioContext | null = null;
	let activeSource: AudioBufferSourceNode | null = null;
	let playVersion = 0;
	const bufferRequests = new Map<string, Promise<AudioBuffer | null>>();

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

	function loadBuffer(activeContext: AudioContext, path: string) {
		const existingRequest = bufferRequests.get(path);
		if (existingRequest) {
			return existingRequest;
		}

		const request = fetch(path)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to load addition audio: ${response.status}`);
				}
				return response.arrayBuffer();
			})
			.then((data) => decodeAudioData(activeContext, data))
			.catch(() => {
				bufferRequests.delete(path);
				return null;
			});
		bufferRequests.set(path, request);
		return request;
	}

	function getAnnouncementPath(announcement: Exclude<AdditionAnnouncement, null>) {
		if (announcement.type === 'number') {
			return getNumberAudioPath(announcement.value, base);
		}
		if (announcement.type === 'equation') {
			return getEquationAudioPath(announcement.left, announcement.right, base);
		}
		return getMagicAudioPath(base);
	}

	async function prepare(problem: AdditionProblem) {
		const activeContext = await getReadyContext();
		if (activeContext === null) {
			return;
		}

		void Promise.all([
			loadBuffer(activeContext, getNumberAudioPath(problem.left, base)),
			loadBuffer(activeContext, getNumberAudioPath(problem.right, base)),
			loadBuffer(activeContext, getNumberAudioPath(problem.total, base)),
			loadBuffer(activeContext, getEquationAudioPath(problem.left, problem.right, base)),
			loadBuffer(activeContext, getMagicAudioPath(base))
		]);
	}

	async function play(announcement: AdditionAnnouncement, emphasized = false) {
		if (announcement === null) {
			return;
		}

		const currentPlayVersion = ++playVersion;
		const activeContext = await getReadyContext();
		if (activeContext === null) {
			return;
		}

		const buffer = await loadBuffer(activeContext, getAnnouncementPath(announcement));
		if (
			buffer === null ||
			currentPlayVersion !== playVersion ||
			activeContext !== context ||
			activeContext.state !== 'running'
		) {
			return;
		}

		try {
			activeSource?.stop();
		} catch {
			// 再生済みの音声は停止済みとして扱う。
		}

		const source = activeContext.createBufferSource();
		const gain = activeContext.createGain();
		source.buffer = buffer;
		gain.gain.setValueAtTime(
			announcement.type === 'magic'
				? MAGIC_AUDIO_GAIN
				: emphasized
					? TAP_AUDIO_GAIN
					: AUTOMATIC_AUDIO_GAIN,
			activeContext.currentTime
		);
		source.connect(gain);
		gain.connect(activeContext.destination);
		source.onended = () => {
			if (activeSource === source) {
				activeSource = null;
			}
		};
		activeSource = source;
		source.start();
	}

	function destroy() {
		playVersion += 1;
		bufferRequests.clear();
		try {
			activeSource?.stop();
		} catch {
			// 再生済みの音声は停止済みとして扱う。
		}
		activeSource = null;
		const activeContext = context;
		context = null;
		if (activeContext?.state !== 'closed') {
			void activeContext?.close().catch(() => {});
		}
	}

	return { prepare, play, destroy };
}
