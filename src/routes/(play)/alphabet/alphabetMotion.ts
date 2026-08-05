import { TWINKLE_STEP_DURATION_MS } from './twinkleMelody';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as Array<Letter>;
export type Letter =
	| 'A'
	| 'B'
	| 'C'
	| 'D'
	| 'E'
	| 'F'
	| 'G'
	| 'H'
	| 'I'
	| 'J'
	| 'K'
	| 'L'
	| 'M'
	| 'N'
	| 'O'
	| 'P'
	| 'Q'
	| 'R'
	| 'S'
	| 'T'
	| 'U'
	| 'V'
	| 'W'
	| 'X'
	| 'Y'
	| 'Z';

export const LETTER_TRAVEL_DURATION_MS = TWINKLE_STEP_DURATION_MS * 4;
export const LETTER_BURST_COUNT = 28;

const LETTER_COLORS = [
	'#ff8f91',
	'#ffb66e',
	'#ffd866',
	'#a9dc76',
	'#68d4c4',
	'#72b9f4',
	'#a99bea',
	'#ef91ca'
];

export type LetterMotion = {
	id: number;
	letter: Letter;
	color: string;
};

export function createLetterMotion(id: number, letter: Letter, random = Math.random): LetterMotion {
	return {
		id,
		letter,
		color: LETTER_COLORS[Math.floor(random() * LETTER_COLORS.length)]
	};
}

export function createBurstMotions(source: LetterMotion, random = Math.random) {
	return Array.from({ length: LETTER_BURST_COUNT }, (_, index) => ({
		id: source.id * 100 + index,
		letter: source.letter,
		color: source.color,
		offsetX: Math.round((random() - 0.5) * 34),
		offsetY: Math.round((random() - 0.5) * 34),
		scale: 0.8 + random() * 1.25
	}));
}
