import { describe, expect, it } from 'vitest';
import { CREATURES, createAdditionProblem, createAnswerOptions } from './additionProblem';

describe('createAdditionProblem', () => {
	it('左右の数に0を含まず、答えを10以下にする', () => {
		for (let index = 0; index < 100; index += 1) {
			const problem = createAdditionProblem(null, () => index / 100);

			expect(problem.left).toBeGreaterThanOrEqual(1);
			expect(problem.right).toBeGreaterThanOrEqual(1);
			expect(problem.total).toBeLessThanOrEqual(10);
			expect(problem.left + problem.right).toBe(problem.total);
		}
	});

	it('答えの2から10までを同じ確率で選べる', () => {
		const totals = Array.from(
			{ length: 9 },
			(_, index) => createAdditionProblem(null, () => index / 9).total
		);

		expect(totals).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	it('直前と同じ式を連続させない', () => {
		const previous = createAdditionProblem(null, () => 0);
		const next = createAdditionProblem(previous, () => 0);

		expect([next.left, next.right]).not.toEqual([previous.left, previous.right]);
		expect(next.left + next.right).toBe(next.total);
	});

	it('登録した絵文字をすべて選べる', () => {
		const selectedCreatures = CREATURES.map((_, index) =>
			createAdditionProblem(null, () => (index + 0.5) / CREATURES.length)
		).map((problem) => problem.creature);

		expect(selectedCreatures).toEqual(CREATURES);
	});
});

describe('createAnswerOptions', () => {
	it('正解と、1から10までの正解ではない数字を1つずつ作る', () => {
		for (let correctAnswer = 2; correctAnswer <= 10; correctAnswer += 1) {
			const options = createAnswerOptions(correctAnswer, () => 0);

			expect(options).toHaveLength(2);
			expect(options).toContain(correctAnswer);
			expect(new Set(options).size).toBe(2);
			expect(options.every((answer) => answer >= 1 && answer <= 10)).toBe(true);
		}
	});

	it('正解を左右どちらにも配置できる', () => {
		const randomValues = [0, 0.25];
		const correctFirst = createAnswerOptions(5, () => randomValues.shift() ?? 0);
		const incorrectFirst = createAnswerOptions(5, () => 0.75);

		expect(correctFirst[0]).toBe(5);
		expect(incorrectFirst[1]).toBe(5);
	});
});
