import type { Letter } from './alphabetMotion';

export function getLetterAudioPath(letter: Letter, basePath = ''): string {
	return `${basePath}/audio/alphabet/${letter.toLowerCase()}.mp3`;
}
