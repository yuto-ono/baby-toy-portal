export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const LETTER_TRAVEL_DURATION_MS = 9_000;
export const LETTER_SPAWN_INTERVAL_MS = 850;
export const LETTER_BURST_COUNT = 14;

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

export type LetterDirection = 'from-left' | 'from-bottom';

export type LetterMotion = {
	id: number;
	letter: string;
	direction: LetterDirection;
	color: string;
	rotation: number;
};

export function createLetterMotion(id: number, random = Math.random): LetterMotion {
	return {
		id,
		letter: ALPHABET[Math.floor(random() * ALPHABET.length)],
		direction: random() < 0.5 ? 'from-left' : 'from-bottom',
		color: LETTER_COLORS[Math.floor(random() * LETTER_COLORS.length)],
		rotation: Math.round(random() * 36 - 18)
	};
}

export function createBurstMotions(source: LetterMotion, random = Math.random) {
	return Array.from({ length: LETTER_BURST_COUNT }, (_, index) => ({
		id: source.id * 100 + index,
		letter: source.letter,
		color: source.color,
		angle: Math.round(random() * 360),
		distance: Math.round(7 + random() * 16),
		rotation: Math.round(random() * 540 - 270)
	}));
}
