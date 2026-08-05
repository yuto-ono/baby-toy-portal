import { describe, expect, it } from 'vitest';
import { ALPHABET, LETTER_TRAVEL_DURATION_MS } from './alphabetMotion';
import { createTimedLetter, getAlphabetSpawnStep, LANE_COUNT } from './alphabetTimeline';
import { TWINKLE_LOOP_DURATION_MS, TWINKLE_STEP_DURATION_MS } from './twinkleMelody';

describe('alphabet timeline', () => {
	it('1曲につきAからZを一度ずつ順番に出す', () => {
		const letters = Array.from({ length: ALPHABET.length }, (_, index) =>
			createTimedLetter(index, getAlphabetSpawnStep(index), [], () => 0)
		);

		expect(letters.map((letter) => letter?.letter).join('')).toBe(ALPHABET.join(''));
	});

	it('Zが曲の終わりまでに画面を通過し終える', () => {
		const zStartTime = getAlphabetSpawnStep(ALPHABET.length - 1) * TWINKLE_STEP_DURATION_MS;

		expect(zStartTime + LETTER_TRAVEL_DURATION_MS).toBeLessThanOrEqual(TWINKLE_LOOP_DURATION_MS);
	});

	it('冒頭のド・ド・ソ・ソとA・B・C・Dを対応させる', () => {
		expect(ALPHABET.slice(0, 4).map((_, index) => getAlphabetSpawnStep(index))).toEqual([
			0, 1, 2, 3
		]);
	});

	it('次のループもAから始める', () => {
		const firstLetter = createTimedLetter(0, 0, [], () => 0);

		expect(firstLetter?.letter).toBe('A');
	});

	it('有効なレーンから選び、直前と同じレーンを避ける', () => {
		const letter = createTimedLetter(0, 0, [0], () => 0);

		expect(letter?.lane).toBeGreaterThanOrEqual(0);
		expect(letter?.lane).toBeLessThan(LANE_COUNT);
		expect(letter?.lane).not.toBe(0);
	});

	it('移動中の3レーンを避ける', () => {
		const letter = createTimedLetter(0, 0, [0, 1, 2], () => 0);

		expect(letter?.lane).toBe(3);
	});
});
