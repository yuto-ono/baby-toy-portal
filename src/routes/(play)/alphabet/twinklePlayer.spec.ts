import { describe, expect, it } from 'vitest';
import { TWINKLE_NOTES } from './twinkleMelody';

describe('TWINKLE_NOTES', () => {
	it('各フレーズの2分音符のあとに休符を入れる', () => {
		expect(TWINKLE_NOTES).toHaveLength(48);

		for (let index = 7; index < TWINKLE_NOTES.length; index += 8) {
			expect(TWINKLE_NOTES[index]).toBeNull();
		}
	});
});
