import { ALPHABET, createLetterMotion, type LetterMotion } from './alphabetMotion';
import { TWINKLE_NOTES } from './twinkleMelody';

export const LANE_COUNT = 4;
export const LANE_TOP_PERCENTAGES = [18, 36, 54, 72] as const;

const ALPHABET_SPAWN_STEPS = TWINKLE_NOTES.flatMap((frequency, step) =>
	frequency === null ? [] : [step]
).slice(0, ALPHABET.length);

export type TimedLetter = LetterMotion & {
	lane: number;
};

export function getAlphabetSpawnStep(letterIndex: number): number {
	return ALPHABET_SPAWN_STEPS[letterIndex];
}

export function createTimedLetter(
	id: number,
	step: number,
	recentLanes: number[],
	random = Math.random
): TimedLetter | null {
	const letterIndex = ALPHABET.findIndex((_, index) => getAlphabetSpawnStep(index) === step);
	if (letterIndex === -1) {
		return null;
	}

	const activeLanes = new Set(recentLanes);
	const availableLanes = Array.from({ length: LANE_COUNT }, (_, lane) => lane).filter(
		(lane) => !activeLanes.has(lane)
	);
	const lane = availableLanes[Math.floor(random() * availableLanes.length)];

	return {
		...createLetterMotion(id, ALPHABET[letterIndex], random),
		lane
	};
}
