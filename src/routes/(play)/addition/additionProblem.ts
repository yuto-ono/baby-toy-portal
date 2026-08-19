export const CREATURES = [
	{ kind: 'rabbit', symbol: '🐰', label: 'うさぎ' },
	{ kind: 'chick', symbol: '🐤', label: 'ひよこ' },
	{ kind: 'cat', symbol: '🐱', label: 'ねこ' },
	{ kind: 'flower', symbol: '🌼', label: 'おはな' },
	{ kind: 'cake', symbol: '🍰', label: 'ケーキ' },
	{ kind: 'apple', symbol: '🍎', label: 'りんご' }
] as const;

export type Creature = (typeof CREATURES)[number];

export type AdditionProblem = {
	left: number;
	right: number;
	total: number;
	creature: Creature;
};

const MIN_TOTAL = 2;
const MAX_TOTAL = 10;

function selectIndex(length: number, random: () => number) {
	const value = random();
	const normalizedValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999_999) : 0;
	return Math.floor(normalizedValue * length);
}

export function createAdditionProblem(
	previous: AdditionProblem | null = null,
	random = Math.random
): AdditionProblem {
	let total = MIN_TOTAL + selectIndex(MAX_TOTAL - MIN_TOTAL + 1, random);
	let left = 1 + selectIndex(total - 1, random);

	if (previous?.left === left && previous.right === total - left) {
		if (total > MIN_TOTAL) {
			left = (left % (total - 1)) + 1;
		} else {
			total += 1;
			left = 1;
		}
	}

	return {
		left,
		right: total - left,
		total,
		creature: CREATURES[selectIndex(CREATURES.length, random)]
	};
}
