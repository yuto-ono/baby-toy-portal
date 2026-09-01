import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALPHABET } from './alphabetMotion';

describe('alphabet audio assets', () => {
	it('各文字に異なる音声ファイルを使用する', () => {
		const hashes = ALPHABET.map((letter) => {
			const path = new URL(
				`../../../../static/audio/alphabet/${letter.toLowerCase()}.mp3`,
				import.meta.url
			);
			return createHash('sha256').update(readFileSync(path)).digest('hex');
		});

		expect(new Set(hashes)).toHaveLength(ALPHABET.length);
	});
});
