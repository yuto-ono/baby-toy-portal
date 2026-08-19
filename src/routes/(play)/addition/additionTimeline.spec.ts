import { describe, expect, it } from 'vitest';
import { createAdditionProblem } from './additionProblem';
import {
	ADDITION_STEP_DURATION_MS,
	ADDITION_STEPS,
	getAdditionAnnouncement
} from './additionTimeline';

describe('ADDITION_STEPS', () => {
	it('1秒ごとの10拍で一問を進める', () => {
		expect(ADDITION_STEP_DURATION_MS).toBe(1_000);
		expect(ADDITION_STEPS).toHaveLength(10);
	});

	it('2 + 4を指定した順番で読み上げる', () => {
		const problem = { ...createAdditionProblem(), left: 2, right: 4, total: 6 };
		const announcements = ADDITION_STEPS.map((phase) => getAdditionAnnouncement(problem, phase));

		expect(announcements).toEqual([
			{ type: 'number', value: 2 },
			{ type: 'number', value: 4 },
			{ type: 'number', value: 2 },
			{ type: 'number', value: 4 },
			{ type: 'equation', left: 2, right: 4 },
			{ type: 'magic' },
			{ type: 'number', value: 6 },
			{ type: 'number', value: 6 },
			{ type: 'number', value: 6 },
			null
		]);
	});
});
