import { describe, expect, it } from 'vitest';
import { createAdditionProblem } from './additionProblem';

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
});
