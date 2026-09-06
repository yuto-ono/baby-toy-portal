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
	'#e9455d',
	'#d96800',
	'#9b7900',
	'#4f8b24',
	'#008c82',
	'#2879bd',
	'#7058c8',
	'#c44791'
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
