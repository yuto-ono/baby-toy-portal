import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPinCredential, savePinCredential } from './pinStorage';

const credential = {
	version: 1 as const,
	salt: 'salt',
	digest: 'digest'
};

describe('PIN credential storage', () => {
	const getItem = vi.fn();
	const setItem = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('localStorage', { getItem, setItem });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('returns null when a PIN has not been configured', () => {
		getItem.mockReturnValue(null);

		expect(loadPinCredential()).toBeNull();
	});

	it('loads a valid saved credential', () => {
		getItem.mockReturnValue(JSON.stringify(credential));

		expect(loadPinCredential()).toEqual(credential);
	});

	it.each(['not-json', JSON.stringify({ version: 1, salt: '' })])(
		'treats invalid saved data as unconfigured: %s',
		(saved) => {
			getItem.mockReturnValue(saved);

			expect(loadPinCredential()).toBeNull();
		}
	);

	it('saves a credential as JSON', () => {
		savePinCredential(credential);

		expect(setItem).toHaveBeenCalledWith(
			'baby-toy-portal:parent-pin:v1',
			JSON.stringify(credential)
		);
	});
});
