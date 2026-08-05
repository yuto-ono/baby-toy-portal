import { describe, expect, it } from 'vitest';
import { ALPHABET, LETTER_TRAVEL_DURATION_MS } from './alphabetMotion';
import {
	BARRAGE_END_STEP,
	BARRAGE_LETTERS_PER_STEP,
	BARRAGE_START_STEP,
	createBarrageLetters,
	createBarrageOrder,
	createTimedLetter,
	getAlphabetSpawnStep,
	LANE_COUNT
} from './alphabetTimeline';
import { TWINKLE_LOOP_DURATION_MS, TWINKLE_NOTES, TWINKLE_STEP_DURATION_MS } from './twinkleMelody';

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

	it('Zの後と弾幕の後に準備・クールダウン時間を置く', () => {
		const zStep = getAlphabetSpawnStep(ALPHABET.length - 1);

		expect(BARRAGE_START_STEP - zStep).toBeGreaterThanOrEqual(3);
		expect(TWINKLE_NOTES.length - 1 - BARRAGE_END_STEP).toBeGreaterThanOrEqual(3);
	});

	it('弾幕ではAからZをランダム順で2回ずつ流す', () => {
		const order = createBarrageOrder(() => 0);

		expect(order).toHaveLength(ALPHABET.length * 2);
		for (const letter of ALPHABET) {
			expect(order.filter((item) => item === letter)).toHaveLength(2);
		}
		expect(order.slice(0, ALPHABET.length)).not.toEqual(ALPHABET);
	});

	it('最終フレーズの各ステップで4文字ずつ弾幕を作る', () => {
		const order = createBarrageOrder(() => 0);
		const letters = createBarrageLetters(100, BARRAGE_START_STEP, order, [], () => 0);

		expect(letters).toHaveLength(BARRAGE_LETTERS_PER_STEP);
		expect(letters.every((letter) => letter.kind === 'barrage')).toBe(true);
		expect(new Set(letters.map((letter) => letter.lane)).size).toBe(letters.length);
		expect(createBarrageLetters(100, BARRAGE_START_STEP - 1, order, [], () => 0)).toEqual([]);
	});
});
