import { describe, expect, it } from 'vitest';
import {
	ALPHABET,
	LETTER_BURST_COUNT,
	LETTER_TRAVEL_DURATION_MS,
	createBurstMotions,
	createLetterMotion
} from './alphabetMotion';

describe('createLetterMotion', () => {
	it('AからZの文字を作る', () => {
		const motion = createLetterMotion(1, 'A', () => 0);

		expect(ALPHABET).toContain(motion.letter);
		expect(motion.id).toBe(1);
	});

	it('すべての文字に共通の移動時間を使う', () => {
		expect(LETTER_TRAVEL_DURATION_MS).toBeGreaterThan(0);
	});
});

describe('createBurstMotions', () => {
	it('タップした文字と同じ文字を複数作る', () => {
		const source = createLetterMotion(2, 'H', () => 0.3);

		const burst = createBurstMotions(source, () => 0.5);

		expect(burst).toHaveLength(LETTER_BURST_COUNT);
		expect(burst.every((particle) => particle.letter === source.letter)).toBe(true);
	});
});
