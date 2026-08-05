import { ALPHABET, createLetterMotion, type Letter, type LetterMotion } from './alphabetMotion';
import { TWINKLE_NOTES } from './twinkleMelody';

export const LANE_COUNT = 4;
export const LANE_TOP_PERCENTAGES = [18, 36, 54, 72] as const;
export const BARRAGE_START_STEP = 32;
export const BARRAGE_END_STEP = 44;
export const BARRAGE_LETTERS_PER_STEP = 4;

const BARRAGE_REPEAT_COUNT = 2;

const ALPHABET_SPAWN_STEPS = TWINKLE_NOTES.flatMap((frequency, step) =>
	frequency === null ? [] : [step]
).slice(0, ALPHABET.length);

export type TimedLetter = LetterMotion & {
	lane: number;
	kind: 'regular' | 'barrage';
};

function selectLane(recentLanes: number[], random: () => number): number {
	const activeLanes = new Set(recentLanes);
	const availableLanes = Array.from({ length: LANE_COUNT }, (_, lane) => lane).filter(
		(lane) => !activeLanes.has(lane)
	);

	return availableLanes[Math.floor(random() * availableLanes.length)];
}

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

	return {
		...createLetterMotion(id, ALPHABET[letterIndex], random),
		lane: selectLane(recentLanes, random),
		kind: 'regular'
	};
}

function shuffleAlphabet(random: () => number) {
	const letters = [...ALPHABET];
	for (let index = letters.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1));
		[letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
	}
	return letters;
}

export function createBarrageOrder(random = Math.random) {
	return Array.from({ length: BARRAGE_REPEAT_COUNT }, () => shuffleAlphabet(random)).flat();
}

export function createBarrageLetters(
	firstId: number,
	step: number,
	letterOrder: Letter[],
	recentLanes: number[],
	random = Math.random
): TimedLetter[] {
	if (step < BARRAGE_START_STEP || step > BARRAGE_END_STEP) {
		return [];
	}

	const startIndex = (step - BARRAGE_START_STEP) * BARRAGE_LETTERS_PER_STEP;
	const letters = letterOrder.slice(startIndex, startIndex + BARRAGE_LETTERS_PER_STEP);
	const laneHistory = [...recentLanes];

	return letters.map((letter, index) => {
		const lane = selectLane(laneHistory.slice(-(LANE_COUNT - 1)), random);
		laneHistory.push(lane);
		return {
			...createLetterMotion(firstId + index, letter, random),
			lane,
			kind: 'barrage'
		};
	});
}
