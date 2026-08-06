import { describe, expect, it } from 'vitest';
import { ALPHABET } from './alphabetMotion';
import { getLetterAudioPath } from './letterAudio';

describe('getLetterAudioPath', () => {
	it('すべてのアルファベットを対応するMP3へ変換する', () => {
		const paths = ALPHABET.map((letter) => getLetterAudioPath(letter));

		expect(paths).toHaveLength(ALPHABET.length);
		expect(paths[0]).toBe('/audio/alphabet/a.mp3');
		expect(paths.at(-1)).toBe('/audio/alphabet/z.mp3');
	});

	it('base pathを音声パスへ反映する', () => {
		expect(getLetterAudioPath('A', '/baby-toy')).toBe('/baby-toy/audio/alphabet/a.mp3');
	});
});
