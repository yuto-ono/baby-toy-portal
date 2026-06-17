export const MIN_PIN_LENGTH = 4;
export const MAX_PIN_LENGTH = 8;

export type PinCredential = {
	version: 1;
	salt: string;
	digest: string;
};

const SALT_BYTE_LENGTH = 16;
const SHA_256_DIGEST_BYTE_LENGTH = 32;
const encoder = new TextEncoder();

export function isValidPin(pin: string): boolean {
	return new RegExp(`^\\d{${MIN_PIN_LENGTH},${MAX_PIN_LENGTH}}$`).test(pin);
}

export function isPinCredential(value: unknown): value is PinCredential {
	if (typeof value !== 'object' || value === null) return false;

	const credential = value as Record<string, unknown>;
	if (
		credential.version !== 1 ||
		typeof credential.salt !== 'string' ||
		typeof credential.digest !== 'string'
	) {
		return false;
	}

	const salt = base64ToBytes(credential.salt);
	const digest = base64ToBytes(credential.digest);

	return (
		salt !== null &&
		salt.length === SALT_BYTE_LENGTH &&
		digest !== null &&
		digest.length === SHA_256_DIGEST_BYTE_LENGTH
	);
}

export async function createPinCredential(pin: string): Promise<PinCredential> {
	if (!isValidPin(pin)) {
		throw new Error('PIN must contain 4 to 8 digits.');
	}

	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
	const digest = await digestPin(pin, salt);

	return {
		version: 1,
		salt: bytesToBase64(salt),
		digest: bytesToBase64(digest)
	};
}

export async function verifyPin(pin: string, credential: PinCredential): Promise<boolean> {
	if (!isValidPin(pin)) return false;

	const salt = base64ToBytes(credential.salt);
	const expectedDigest = base64ToBytes(credential.digest);
	if (
		salt === null ||
		expectedDigest === null ||
		salt.length !== SALT_BYTE_LENGTH ||
		expectedDigest.length !== SHA_256_DIGEST_BYTE_LENGTH
	) {
		return false;
	}

	const actualDigest = await digestPin(pin, salt);

	return constantTimeEqual(actualDigest, expectedDigest);
}

async function digestPin(pin: string, salt: Uint8Array): Promise<Uint8Array> {
	const pinBytes = encoder.encode(pin);
	const input = new Uint8Array(salt.length + pinBytes.length);

	input.set(salt);
	input.set(pinBytes, salt.length);

	return new Uint8Array(await crypto.subtle.digest('SHA-256', input));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
	if (left.length !== right.length) return false;

	let difference = 0;
	for (let index = 0; index < left.length; index += 1) {
		difference |= left[index] ^ right[index];
	}

	return difference === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array | null {
	try {
		const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
		return bytesToBase64(bytes) === value ? bytes : null;
	} catch {
		return null;
	}
}
