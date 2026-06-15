export type PinInputAction =
	| { type: 'append'; digit: string }
	| { type: 'backspace' }
	| { type: 'clear' };

export function updatePin(pin: string, action: PinInputAction, maxLength: number): string {
	switch (action.type) {
		case 'append':
			if (!/^\d$/.test(action.digit) || pin.length >= maxLength) return pin;
			return pin + action.digit;
		case 'backspace':
			return pin.slice(0, -1);
		case 'clear':
			return '';
	}
}

export function pinInputActionFromKey(key: string): PinInputAction | undefined {
	if (/^\d$/.test(key)) return { type: 'append', digit: key };
	if (key === 'Backspace' || key === 'Delete') return { type: 'backspace' };
	return undefined;
}
