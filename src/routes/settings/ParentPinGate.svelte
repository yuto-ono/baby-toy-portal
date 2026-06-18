<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { onMount } from 'svelte';
	import PinKeypad from './PinKeypad.svelte';
	import SettingsDialogShell from './SettingsDialogShell.svelte';
	import { pinInputActionFromKey, updatePin, type PinInputAction } from './pinInput';
	import { MAX_PIN_LENGTH, isValidPin } from './pinCredential';

	let {
		onAuthenticate
	}: {
		onAuthenticate: (pin: string) => Promise<boolean>;
	} = $props();

	let pin = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	let pinInputElement: HTMLInputElement;

	onMount(() => {
		pinInputElement.focus();
	});

	function returnHome(): void {
		void goto(resolve('/'));
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			returnHome();
			return;
		}

		const action = pinInputActionFromKey(event.key);
		if (!action || isSubmitting) return;

		event.preventDefault();
		applyPinAction(action);
	}

	function applyPinAction(action: PinInputAction): void {
		pin = updatePin(pin, action, MAX_PIN_LENGTH);
		errorMessage = '';
	}

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		errorMessage = '';

		if (!isValidPin(pin)) {
			errorMessage = 'PINが違います。もう一度入力してください。';
			return;
		}

		isSubmitting = true;
		try {
			const authenticated = await onAuthenticate(pin);

			if (!authenticated) {
				pin = '';
				errorMessage = 'PINが違います。もう一度入力してください。';
			}
		} catch {
			errorMessage = 'PINを確認できませんでした。時間をおいてもう一度お試しください。';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<SettingsDialogShell labelledBy="gate-title" variant="gate" onClose={returnHome}>
	<div class="intro">
		<div class="icon" aria-hidden="true">
			<LockKeyhole size={44} strokeWidth={2.5} />
		</div>
		<p class="eyebrow">おとなのかたへ</p>
		<h1 id="gate-title">保護者設定</h1>
		<p class="description">設定を開くには、保護者PINを入力してください。</p>
	</div>

	<form onsubmit={submit}>
		<input
			id="parent-pin"
			bind:this={pinInputElement}
			type="password"
			inputmode="none"
			autocomplete="off"
			readonly
			bind:value={pin}
			aria-describedby="pin-hint pin-error"
		/>
		<p id="pin-hint" class="hint">画面の数字ボタンで入力してください。</p>
		<PinKeypad
			label="保護者PINの数字入力"
			disabled={isSubmitting}
			onDigit={(digit) => applyPinAction({ type: 'append', digit })}
			onBackspace={() => applyPinAction({ type: 'backspace' })}
			onClear={() => applyPinAction({ type: 'clear' })}
		/>
		<p id="pin-error" class="error" aria-live="polite">{errorMessage}</p>

		<button type="submit" disabled={isSubmitting}>
			{isSubmitting ? '確認しています…' : '設定を開く'}
		</button>
	</form>
</SettingsDialogShell>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.icon {
		display: grid;
		width: 5rem;
		height: 5rem;
		margin: 0 auto 1rem;
		place-items: center;
		border: 2px solid $ink;
		border-radius: 50%;
		background: $accent-yellow;
	}

	.eyebrow {
		margin: 0;
		color: #c84c5a;
		font-size: 0.9rem;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	h1 {
		margin: 0.25rem 0 0;
		font-size: clamp(2rem, 8vw, 2.75rem);
	}

	.description {
		margin: 0.75rem 0 1.5rem;
		font-weight: 700;
		line-height: 1.6;
	}

	form {
		width: min(100%, 20rem);
		margin-inline: auto;
		text-align: left;
	}

	input {
		width: 100%;
		min-height: 3.5rem;
		padding: 0.6rem 1rem;
		border: 3px solid $ink;
		border-radius: 1rem;
		font-size: 1.5rem;
		letter-spacing: 0.25em;

		&:focus {
			outline: 4px solid $accent-mint;
			outline-offset: 2px;
		}
	}

	.hint,
	.error {
		margin: 0.45rem 0 0;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.hint {
		color: #666274;
	}

	.error {
		min-height: 1.4em;
		color: #b32636;
	}

	button {
		width: 100%;
		min-height: 3.5rem;
		margin-top: 0.75rem;
		border: 3px solid $ink;
		border-radius: 999px;
		background: $accent-mint;
		color: $ink;
		font: inherit;
		font-size: 1.1rem;
		font-weight: 800;
		cursor: pointer;

		&:disabled {
			cursor: wait;
			opacity: 0.65;
		}

		&:focus-visible {
			outline: 4px solid $accent-yellow;
			outline-offset: 3px;
		}
	}

	@media (orientation: landscape) and (min-width: 44rem) {
		.icon {
			width: 4rem;
			height: 4rem;
			margin-bottom: 0.75rem;
		}

		h1 {
			font-size: clamp(1.75rem, 4vw, 2.5rem);
		}

		.description {
			margin-bottom: 0;
		}
	}
</style>
