import { describe, expect, it } from 'vitest';
import { getEquationAudioPath, getMagicAudioPath, getNumberAudioPath } from './additionAudio';

describe('足し算音声パス', () => {
	it('数字と式と合体音の固定ファイルを参照する', () => {
		expect(getNumberAudioPath(7)).toBe('/audio/addition/numbers/7.mp3');
		expect(getEquationAudioPath(7, 3)).toBe('/audio/addition/equations/7-plus-3.mp3');
		expect(getMagicAudioPath()).toBe('/audio/addition/magic.mp3');
	});

	it('ベースパスを付けられる', () => {
		expect(getNumberAudioPath(10, '/baby-toy')).toBe('/baby-toy/audio/addition/numbers/10.mp3');
		expect(getEquationAudioPath(2, 4, '/baby-toy')).toBe(
			'/baby-toy/audio/addition/equations/2-plus-4.mp3'
		);
	});
});
