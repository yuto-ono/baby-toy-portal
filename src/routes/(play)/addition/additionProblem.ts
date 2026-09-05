export const CREATURES = [
	{ kind: 'rabbit', symbol: '🐰', label: 'うさぎ' },
	{ kind: 'chick', symbol: '🐤', label: 'ひよこ' },
	{ kind: 'cat', symbol: '🐱', label: 'ねこ' },
	{ kind: 'dog', symbol: '🐶', label: 'いぬ' },
	{ kind: 'panda', symbol: '🐼', label: 'パンダ' },
	{ kind: 'lion', symbol: '🦁', label: 'ライオン' },
	{ kind: 'frog', symbol: '🐸', label: 'かえる' },
	{ kind: 'penguin', symbol: '🐧', label: 'ペンギン' },
	{ kind: 'flower', symbol: '🌼', label: 'おはな' },
	{ kind: 'cake', symbol: '🍰', label: 'ケーキ' },
	{ kind: 'apple', symbol: '🍎', label: 'りんご' },
	{ kind: 'strawberry', symbol: '🍓', label: 'いちご' },
	{ kind: 'banana', symbol: '🍌', label: 'バナナ' },
	{ kind: 'doughnut', symbol: '🍩', label: 'ドーナツ' },
	{ kind: 'car', symbol: '🚗', label: 'くるま' },
	{ kind: 'balloon', symbol: '🎈', label: 'ふうせん' }
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
const MIN_ANSWER = 1;

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

export function createAnswerOptions(
	correctAnswer: number,
	random = Math.random
): readonly [number, number] {
	const incorrectAnswers = Array.from(
		{ length: MAX_TOTAL - MIN_ANSWER + 1 },
		(_, index) => index + MIN_ANSWER
	).filter((answer) => answer !== correctAnswer);
	const incorrectAnswer = incorrectAnswers[selectIndex(incorrectAnswers.length, random)];

	return random() < 0.5 ? [correctAnswer, incorrectAnswer] : [incorrectAnswer, correctAnswer];
}
