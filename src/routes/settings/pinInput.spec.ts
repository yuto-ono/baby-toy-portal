import { describe, expect, it } from 'vitest';
import { pinInputActionFromKey, updatePin } from './pinInput';

describe('updatePin', () => {
	it('appends digits up to the maximum length', () => {
		expect(updatePin('123', { type: 'append', digit: '4' }, 4)).toBe('1234');
		expect(updatePin('1234', { type: 'append', digit: '5' }, 4)).toBe('1234');
	});

	it('ignores non-digit input', () => {
		expect(updatePin('123', { type: 'append', digit: 'a' }, 8)).toBe('123');
	});

	it('removes the final digit', () => {
		expect(updatePin('1234', { type: 'backspace' }, 8)).toBe('123');
		expect(updatePin('', { type: 'backspace' }, 8)).toBe('');
	});

	it('clears every digit', () => {
		expect(updatePin('1234', { type: 'clear' }, 8)).toBe('');
	});
});

describe('pinInputActionFromKey', () => {
	it.each(['0', '5', '9'])('maps a number key to a digit action: %s', (key) => {
		expect(pinInputActionFromKey(key)).toEqual({ type: 'append', digit: key });
	});

	it.each(['Backspace', 'Delete'])('maps a removal key to a backspace action: %s', (key) => {
		expect(pinInputActionFromKey(key)).toEqual({ type: 'backspace' });
	});

	it.each(['a', 'Enter', 'ArrowLeft'])('ignores unrelated keys: %s', (key) => {
		expect(pinInputActionFromKey(key)).toBeUndefined();
	});
});
