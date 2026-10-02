export const CREATURES = [
	{ kind: 'rabbit', symbol: '🐰', label: 'うさぎ' },
	{ kind: 'chick', symbol: '🐤', label: 'ひよこ' },
	{ kind: 'cat', symbol: '🐱', label: 'ねこ' },
	{ kind: 'puppy', symbol: '🐶', label: 'こいぬ' },
	{ kind: 'hamster', symbol: '🐹', label: 'ハムスター' },
	{ kind: 'mouse', symbol: '🐭', label: 'ねずみ' },
	{ kind: 'bear', symbol: '🧸', label: 'くまのぬいぐるみ' },
	{ kind: 'koala', symbol: '🐨', label: 'コアラ' },
	{ kind: 'fox', symbol: '🦊', label: 'きつね' },
	{ kind: 'frog', symbol: '🐸', label: 'かえる' },
	{ kind: 'penguin', symbol: '🐧', label: 'ペンギン' },
	{ kind: 'duck', symbol: '🦆', label: 'あひる' },
	{ kind: 'turtle', symbol: '🐢', label: 'かめ' },
	{ kind: 'fish', symbol: '🐠', label: 'さかな' },
	{ kind: 'whale', symbol: '🐳', label: 'くじら' },
	{ kind: 'unicorn', symbol: '🦄', label: 'ユニコーン' },
	{ kind: 'butterfly', symbol: '🦋', label: 'ちょうちょ' },
	{ kind: 'ladybug', symbol: '🐞', label: 'てんとうむし' },
	{ kind: 'bee', symbol: '🐝', label: 'みつばち' },
	{ kind: 'snail', symbol: '🐌', label: 'かたつむり' },
	{ kind: 'flower', symbol: '🌼', label: 'おはな' },
	{ kind: 'cherry-blossom', symbol: '🌸', label: 'さくら' },
	{ kind: 'tulip', symbol: '🌷', label: 'チューリップ' },
	{ kind: 'sunflower', symbol: '🌻', label: 'ひまわり' },
	{ kind: 'rainbow', symbol: '🌈', label: 'にじ' },
	{ kind: 'star', symbol: '⭐', label: 'おほしさま' },
	{ kind: 'heart', symbol: '💖', label: 'ハート' },
	{ kind: 'crown', symbol: '👑', label: 'おうかん' },
	{ kind: 'cake', symbol: '🍰', label: 'ケーキ' },
	{ kind: 'ice-cream', symbol: '🍦', label: 'アイスクリーム' },
	{ kind: 'cookie', symbol: '🍪', label: 'クッキー' },
	{ kind: 'candy', symbol: '🍬', label: 'キャンディ' },
	{ kind: 'apple', symbol: '🍎', label: 'りんご' },
	{ kind: 'strawberry', symbol: '🍓', label: 'いちご' },
	{ kind: 'peach', symbol: '🍑', label: 'もも' },
	{ kind: 'watermelon', symbol: '🍉', label: 'すいか' },
	{ kind: 'balloon', symbol: '🎈', label: 'ふうせん' },
	{ kind: 'gift', symbol: '🎁', label: 'プレゼント' },
	{ kind: 'ribbon', symbol: '🎀', label: 'リボン' }
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
