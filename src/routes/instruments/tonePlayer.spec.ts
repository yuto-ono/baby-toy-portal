import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTonePlayer, getTonePeakGain } from './tonePlayer';

const currentTime = 10;

function createAudioContextMock(initialState: AudioContextState = 'running') {
	let state = initialState;
	const frequency = {
		setValueAtTime: vi.fn()
	};
	const gainParam = {
		setValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn()
	};
	const gain = {
		gain: gainParam,
		connect: vi.fn()
	};
	const oscillator = {
		type: 'square',
		frequency,
		connect: vi.fn(),
		start: vi.fn(),
		stop: vi.fn()
	};
	const context = {
		get state() {
			return state;
		},
		currentTime,
		destination: {},
		createOscillator: vi.fn(() => oscillator),
		createGain: vi.fn(() => gain),
		resume: vi.fn(async () => {
			state = 'running';
		}),
		close: vi.fn(async () => {
			state = 'closed';
		})
	};

	return {
		context,
		oscillator,
		gain,
		frequency,
		gainParam,
		setState(nextState: AudioContextState) {
			state = nextState;
		}
	};
}

describe('getTonePeakGain', () => {
	it('converts volume to an increasing peak gain', () => {
		expect(getTonePeakGain(0)).toBe(0);
		expect(getTonePeakGain(0.25)).toBeGreaterThan(0);
		expect(getTonePeakGain(0.55)).toBeGreaterThan(getTonePeakGain(0.25));
		expect(getTonePeakGain(1)).toBeGreaterThan(getTonePeakGain(0.55));
	});

	it('clamps invalid or out-of-range volume values', () => {
		expect(getTonePeakGain(-1)).toBe(0);
		expect(getTonePeakGain(2)).toBe(getTonePeakGain(1));
		expect(getTonePeakGain(Number.NaN)).toBe(0);
	});
});

describe('createTonePlayer', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'AudioContext',
			vi.fn(function AudioContextMock() {})
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('lazily creates and reuses an audio context', async () => {
		const first = createAudioContextMock();
		vi.mocked(AudioContext).mockImplementation(function AudioContextMock() {
			return first.context as unknown as AudioContext;
		});
		const player = createTonePlayer();

		expect(AudioContext).not.toHaveBeenCalled();

		await player.play(440);
		await player.play(880);

		expect(AudioContext).toHaveBeenCalledTimes(1);
		expect(first.context.createOscillator).toHaveBeenCalledTimes(2);
	});

	it('schedules a sine tone with a short attack and release', async () => {
		const audio = createAudioContextMock();
		vi.mocked(AudioContext).mockImplementation(function AudioContextMock() {
			return audio.context as unknown as AudioContext;
		});
		const player = createTonePlayer();

		await player.play(440);

		expect(audio.oscillator.type).toBe('sine');
		expect(audio.frequency.setValueAtTime).toHaveBeenCalledWith(440, currentTime);

		const [[initialGain, initialTime]] = audio.gainParam.setValueAtTime.mock.calls;
		const [[peakGain, attackTime], [releaseGain, releaseTime]] =
			audio.gainParam.exponentialRampToValueAtTime.mock.calls;
		const [[stopTime]] = audio.oscillator.stop.mock.calls;

		expect(initialGain).toBeGreaterThan(0);
		expect(initialTime).toBe(currentTime);
		expect(peakGain).toBe(getTonePeakGain(1));
		expect(attackTime).toBeGreaterThan(currentTime);
		expect(attackTime).toBeLessThan(releaseTime);
		expect(releaseGain).toBe(initialGain);
		expect(releaseTime).toBe(stopTime);
		expect(audio.oscillator.connect).toHaveBeenCalledWith(audio.gain);
		expect(audio.gain.connect).toHaveBeenCalledWith(audio.context.destination);
		expect(audio.oscillator.start).toHaveBeenCalledWith(currentTime);
		expect(stopTime).toBeGreaterThan(attackTime);
	});

	it('uses the requested volume when scheduling a tone', async () => {
		const audio = createAudioContextMock();
		vi.mocked(AudioContext).mockImplementation(function AudioContextMock() {
			return audio.context as unknown as AudioContext;
		});
		const player = createTonePlayer();

		await player.play(440, 0.25);

		const [[peakGain, attackTime]] = audio.gainParam.exponentialRampToValueAtTime.mock.calls;

		expect(peakGain).toBe(getTonePeakGain(0.25));
		expect(attackTime).toBeGreaterThan(currentTime);
	});

	it('does not create an audio context when muted', async () => {
		const player = createTonePlayer();

		await player.play(440, 0);

		expect(AudioContext).not.toHaveBeenCalled();
	});

	it('resumes a suspended context before playing', async () => {
		const audio = createAudioContextMock('suspended');
		vi.mocked(AudioContext).mockImplementation(function AudioContextMock() {
			return audio.context as unknown as AudioContext;
		});
		const player = createTonePlayer();

		await player.play(440);

		expect(audio.context.resume).toHaveBeenCalledOnce();
		expect(audio.frequency.setValueAtTime).toHaveBeenCalledWith(440, currentTime);
	});

	it('waits for a suspended context to resume before scheduling a tone', async () => {
		let resolveResume: (() => void) | undefined;
		const audio = createAudioContextMock('suspended');
		audio.context.resume.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					resolveResume = () => {
						audio.setState('running');
						resolve();
					};
				})
		);
		vi.mocked(AudioContext).mockImplementation(function AudioContextMock() {
			return audio.context as unknown as AudioContext;
		});
		const player = createTonePlayer();

		const playPromise = player.play(440);

		expect(audio.context.resume).toHaveBeenCalledOnce();
		expect(audio.context.createOscillator).not.toHaveBeenCalled();

		resolveResume?.();
		await playPromise;

		expect(audio.context.createOscillator).toHaveBeenCalledOnce();
		expect(audio.frequency.setValueAtTime).toHaveBeenCalledWith(440, currentTime);
	});

	it('recreates the context when resuming fails', async () => {
		const first = createAudioContextMock('suspended');
		const second = createAudioContextMock();
		first.context.resume.mockRejectedValueOnce(new Error('Could not resume audio'));
		vi.mocked(AudioContext)
			.mockImplementationOnce(function AudioContextMock() {
				return first.context as unknown as AudioContext;
			})
			.mockImplementationOnce(function AudioContextMock() {
				return second.context as unknown as AudioContext;
			});
		const player = createTonePlayer();

		await player.play(880);

		expect(first.context.close).toHaveBeenCalledOnce();
		expect(AudioContext).toHaveBeenCalledTimes(2);
		expect(second.frequency.setValueAtTime).toHaveBeenCalledWith(880, currentTime);
	});

	it('closes the context and creates a fresh one after destroy', async () => {
		const first = createAudioContextMock();
		const second = createAudioContextMock();
		vi.mocked(AudioContext)
			.mockImplementationOnce(function AudioContextMock() {
				return first.context as unknown as AudioContext;
			})
			.mockImplementationOnce(function AudioContextMock() {
				return second.context as unknown as AudioContext;
			});
		const player = createTonePlayer();

		await player.play(440);
		player.destroy();
		await player.play(880);

		expect(first.context.close).toHaveBeenCalledOnce();
		expect(AudioContext).toHaveBeenCalledTimes(2);
		expect(second.frequency.setValueAtTime).toHaveBeenCalledWith(880, currentTime);
	});
});
