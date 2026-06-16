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

	function scheduleTone(context: AudioContext, frequency: number) {
		const now = context.currentTime;
		const oscillator = context.createOscillator();
		const gain = context.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, now);
		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(now);
		oscillator.stop(now + 0.8);
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

	async function play(frequency: number) {
		const playVersion = resetVersion;
		const context = await getReadyAudioContext(playVersion);

		if (context === null || playVersion !== resetVersion || context !== audioContext) {
			return;
		}

		scheduleTone(context, frequency);
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
