export function createTonePlayer() {
	let audioContext: AudioContext | null = null;

	function play(frequency: number) {
		audioContext ??= new AudioContext();

		if (audioContext.state === 'suspended') {
			void audioContext.resume();
		}

		const now = audioContext.currentTime;
		const oscillator = audioContext.createOscillator();
		const gain = audioContext.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, now);
		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

		oscillator.connect(gain);
		gain.connect(audioContext.destination);
		oscillator.start(now);
		oscillator.stop(now + 0.8);
	}

	function destroy() {
		void audioContext?.close();
		audioContext = null;
	}

	return { play, destroy };
}
