import type { AdditionProblem } from './additionProblem';

export const ADDITION_STEP_DURATION_MS = 1_000;

export const ADDITION_STEPS = [
	'left-arrives',
	'right-arrives',
	'left-moves',
	'right-moves',
	'equation',
	'magic',
	'result-one',
	'result-two',
	'result-three',
	'giant-dance',
	'clear'
] as const;

export type AdditionPhase = (typeof ADDITION_STEPS)[number];

export type AdditionAnnouncement =
	| { type: 'number'; value: number }
	| { type: 'equation'; left: number; right: number }
	| { type: 'magic' }
	| null;

const ANNOUNCEMENT_BY_PHASE = {
	'left-arrives': 'left',
	'right-arrives': 'right',
	'left-moves': 'left',
	'right-moves': 'right',
	equation: 'equation',
	magic: 'magic',
	'result-one': 'total',
	'result-two': 'total',
	'result-three': 'total',
	'giant-dance': null,
	clear: null
} as const satisfies Record<
	AdditionPhase,
	'left' | 'right' | 'total' | 'equation' | 'magic' | null
>;

export function getAdditionAnnouncement(
	problem: AdditionProblem,
	phase: AdditionPhase
): AdditionAnnouncement {
	const announcement = ANNOUNCEMENT_BY_PHASE[phase];

	if (announcement === null) {
		return null;
	}

	if (announcement === 'equation') {
		return { type: 'equation', left: problem.left, right: problem.right };
	}

	if (announcement === 'magic') {
		return { type: 'magic' };
	}

	return { type: 'number', value: problem[announcement] };
}

const PARENT_ARRIVAL_DURATION_MS = 2_600;
const FAMILY_DEPARTURE_DURATION_MS = 2_800;

export function getAdditionStepDuration(phase: AdditionPhase, correct: boolean): number {
	if (!correct) return ADDITION_STEP_DURATION_MS;
	if (phase === 'giant-dance') return PARENT_ARRIVAL_DURATION_MS;
	if (phase === 'clear') return FAMILY_DEPARTURE_DURATION_MS;
	return ADDITION_STEP_DURATION_MS;
}
