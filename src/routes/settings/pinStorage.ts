import { isPinCredential, type PinCredential } from './pinCredential';

const STORAGE_KEY = 'baby-toy-portal:parent-pin:v1';

export function loadPinCredential(): PinCredential | null {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) return null;

		const parsed: unknown = JSON.parse(saved);
		return isPinCredential(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function savePinCredential(credential: PinCredential): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(credential));
	} catch {
		throw new Error('Could not save PIN credential.');
	}
}
