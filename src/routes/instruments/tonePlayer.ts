const FULL_VOLUME_PEAK_GAIN = 0.3;
const SILENCE_GAIN = 0.0001;
const VOLUME_CURVE_LINEAR_WEIGHT = 0.45;
const ATTACK_DURATION_SECONDS = 0.015;
const TONE_DURATION_SECONDS = 2;

export function getTonePeakGain(volume: number) {
	if (!Number.isFinite(volume)) {
		return 0;
	}

	const clampedVolume = Math.min(Math.max(volume, 0), 1);
	return (
		FULL_VOLUME_PEAK_GAIN *
		clampedVolume *
		(VOLUME_CURVE_LINEAR_WEIGHT + (1 - VOLUME_CURVE_LINEAR_WEIGHT) * clampedVolume)
	);
}

export function createTonePlayer() {
	let audioContext: AudioContext | null = null;
	let resetVersion = 0;

	function getAudioContextState(context: AudioContext) {
		return context.state as AudioContextState;
	}

	function getAudioContext() {
		if (audioContext && getAudioContextState(audioContext) === 'closed') {
			audioContext = null;
		}

		audioContext ??= new AudioContext();
		return audioContext;
	}

	async function resumeContext(context: AudioContext) {
		if (getAudioContextState(context) === 'running') {
			return true;
		}

		if (getAudioContextState(context) === 'closed') {
			return false;
		}

		try {
			await context.resume();
		} catch {
			return false;
		}

		return getAudioContextState(context) === 'running';
	}

	function closeAudioContext(context: AudioContext) {
		if (getAudioContextState(context) !== 'closed') {
			void context.close().catch(() => {});
		}
	}

	function scheduleTone(context: AudioContext, frequency: number, peakGain: number) {
		const now = context.currentTime;
		const oscillator = context.createOscillator();
		const gain = context.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, now);
		gain.gain.setValueAtTime(SILENCE_GAIN, now);
		gain.gain.exponentialRampToValueAtTime(peakGain, now + ATTACK_DURATION_SECONDS);
		gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + TONE_DURATION_SECONDS);

		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(now);
		oscillator.stop(now + TONE_DURATION_SECONDS);
	}

	async function getReadyAudioContext(playVersion: number) {
		let context = getAudioContext();

		if (getAudioContextState(context) !== 'running') {
			const resumed = await resumeContext(context);

			if (playVersion !== resetVersion || context !== audioContext) {
				return null;
			}

			if (!resumed) {
				closeAudioContext(context);
				audioContext = null;
				context = getAudioContext();

				if (getAudioContextState(context) !== 'running') {
					const recreatedContextResumed = await resumeContext(context);

					if (
						playVersion !== resetVersion ||
						context !== audioContext ||
						!recreatedContextResumed
					) {
						return null;
					}
				}
			}
		}

		return context;
	}

	async function play(frequency: number, volume = 1) {
		const peakGain = getTonePeakGain(volume);
		if (peakGain <= 0) {
			return;
		}

		const playVersion = resetVersion;
		const context = await getReadyAudioContext(playVersion);

		if (context === null || playVersion !== resetVersion || context !== audioContext) {
			return;
		}

		scheduleTone(context, frequency, peakGain);
	}

	function destroy() {
		const context = audioContext;

		audioContext = null;
		resetVersion += 1;

		if (context) {
			closeAudioContext(context);
		}
	}

	return { play, destroy };
}
