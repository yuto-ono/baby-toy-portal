import type { Letter } from './alphabetMotion';

const LETTER_NAMES: Record<Letter, string> = {
	A: 'ay',
	B: 'bee',
	C: 'see',
	D: 'dee',
	E: 'ee',
	F: 'eff',
	G: 'gee',
	H: 'aitch',
	I: 'eye',
	J: 'jay',
	K: 'kay',
	L: 'el',
	M: 'em',
	N: 'en',
	O: 'oh',
	P: 'pee',
	Q: 'cue',
	R: 'ar',
	S: 'ess',
	T: 'tee',
	U: 'you',
	V: 'vee',
	W: 'double you',
	X: 'ex',
	Y: 'why',
	Z: 'zee'
};

const FEMALE_ENGLISH_VOICE_NAMES = [
	'samantha',
	'ava',
	'victoria',
	'karen',
	'moira',
	'tessa',
	'susan',
	'zira',
	'hazel',
	'serena',
	'jenny',
	'aria',
	'sonia',
	'libby'
];

export function getLetterName(letter: Letter): string {
	return LETTER_NAMES[letter];
}

export function findFemaleEnglishVoice(
	voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
	return (
		voices.find(
			(voice) =>
				voice.lang.toLowerCase().startsWith('en') &&
				FEMALE_ENGLISH_VOICE_NAMES.some((name) => voice.name.toLowerCase().includes(name))
		) ?? null
	);
}
