import { describe, expect, it } from 'vitest';
import { createPinCredential, isPinCredential, isValidPin, verifyPin } from './pinCredential';

describe('isValidPin', () => {
	it.each(['0000', '123456', '12345678'])('accepts a 4 to 8 digit PIN: %s', (pin) => {
		expect(isValidPin(pin)).toBe(true);
	});

	it.each(['123', '123456789', '12a4', '１２３４', ' 1234'])(
		'rejects an invalid PIN: %s',
		(pin) => {
			expect(isValidPin(pin)).toBe(false);
		}
	);
});

describe('PIN credentials', () => {
	it('verifies the PIN used to create the credential', async () => {
		const credential = await createPinCredential('1234');

		await expect(verifyPin('1234', credential)).resolves.toBe(true);
		await expect(verifyPin('4321', credential)).resolves.toBe(false);
	});

	it('uses a new salt for each credential', async () => {
		const first = await createPinCredential('1234');
		const second = await createPinCredential('1234');

		expect(first.salt).not.toBe(second.salt);
		expect(first.digest).not.toBe(second.digest);
	});

	it('rejects invalid PINs before hashing', async () => {
		await expect(createPinCredential('123')).rejects.toThrow();
	});
});

describe('isPinCredential', () => {
	it('accepts the current storage format', () => {
		expect(isPinCredential({ version: 1, salt: 'salt', digest: 'digest' })).toBe(true);
	});

	it.each([
		null,
		{},
		{ version: 2, salt: 'salt', digest: 'digest' },
		{ version: 1, salt: '', digest: 'digest' },
		{ version: 1, salt: 'salt' }
	])('rejects malformed stored data', (value) => {
		expect(isPinCredential(value)).toBe(false);
	});
});
