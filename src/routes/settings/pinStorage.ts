import { isPinCredential, type PinCredential } from './pinCredential';

const STORAGE_KEY = 'baby-toy-portal:parent-pin:v1';

export function loadPinCredential(): PinCredential | null {
	const saved = localStorage.getItem(STORAGE_KEY);

	if (!saved) return null;

	try {
		const parsed: unknown = JSON.parse(saved);
		return isPinCredential(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function savePinCredential(credential: PinCredential): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(credential));
}
