import { describe, expect, it } from 'vitest';
import { getLetterName } from './letterSpeech';

describe('getLetterName', () => {
	it('capitalを含まない文字名を返す', () => {
		expect(getLetterName('A')).toBe('ay');
		expect(getLetterName('Z')).not.toContain('capital');
	});
});
