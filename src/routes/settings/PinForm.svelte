<script lang="ts">
	import { MAX_PIN_LENGTH, MIN_PIN_LENGTH, isValidPin } from './pinCredential';

	let {
		mode = 'change',
		onSave
	}: {
		mode?: 'setup' | 'change';
		onSave: (pin: string) => Promise<void>;
	} = $props();

	const isSetup = $derived(mode === 'setup');
	let newPin = $state('');
	let confirmation = $state('');
	let errorMessage = $state('');
	let successMessage = $state('');
	let isSubmitting = $state(false);

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		errorMessage = '';
		successMessage = '';

		if (!isValidPin(newPin)) {
			errorMessage = `PINは${MIN_PIN_LENGTH}〜${MAX_PIN_LENGTH}桁の数字で入力してください。`;
			return;
		}

		if (newPin !== confirmation) {
			errorMessage = '確認用のPINが一致しません。';
			return;
		}

		isSubmitting = true;
		await onSave(newPin);
		isSubmitting = false;
		newPin = '';
		confirmation = '';
		successMessage = isSetup ? '' : '保護者PINを変更しました。';
	}
</script>

<section aria-labelledby="pin-form-title">
	{#if isSetup}
		<p class="eyebrow">はじめての設定</p>
	{/if}
	<h2 id="pin-form-title">{isSetup ? '保護者PINを設定' : '保護者PINの変更'}</h2>
	<p class="description">
		{isSetup
			? '設定画面を開くときに使うPINを決めてください。'
			: '設定画面を開くときに使うPINを変更できます。'}
	</p>

	<form onsubmit={submit}>
		<label for="new-pin">{isSetup ? '保護者PIN' : '新しいPIN'}</label>
		<input
			id="new-pin"
			type="password"
			inputmode="numeric"
			pattern="[0-9]*"
			autocomplete="new-password"
			minlength={MIN_PIN_LENGTH}
			maxlength={MAX_PIN_LENGTH}
			bind:value={newPin}
			aria-describedby="new-pin-hint"
		/>
		<p id="new-pin-hint" class="hint">{MIN_PIN_LENGTH}〜{MAX_PIN_LENGTH}桁の数字</p>

		<label for="confirm-pin">{isSetup ? '保護者PIN（確認）' : '新しいPIN（確認）'}</label>
		<input
			id="confirm-pin"
			type="password"
			inputmode="numeric"
			pattern="[0-9]*"
			autocomplete="new-password"
			minlength={MIN_PIN_LENGTH}
			maxlength={MAX_PIN_LENGTH}
			bind:value={confirmation}
		/>

		<p class="message error" aria-live="polite">{errorMessage}</p>
		<p class="message success" aria-live="polite">{successMessage}</p>

		<button type="submit" disabled={isSubmitting}>
			{isSubmitting ? '保存しています…' : isSetup ? 'PINを設定する' : 'PINを変更する'}
		</button>
	</form>
</section>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	section {
		width: min(calc(100% - 2rem), 34rem);
		margin: clamp(1.5rem, 6vw, 3rem) auto;
		padding: clamp(1.5rem, 5vw, 2.5rem);
		border: 3px solid $ink;
		border-radius: 2rem;
		background: #fff;
		box-shadow: 8px 8px 0 $accent-yellow;
	}

	h2 {
		margin: 0;
		font-size: clamp(1.5rem, 6vw, 2rem);
	}

	.eyebrow {
		margin: 0 0 0.25rem;
		color: #c84c5a;
		font-size: 0.9rem;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	.description {
		margin: 0.6rem 0 1.75rem;
		font-weight: 700;
		line-height: 1.6;
	}

	label {
		display: block;
		margin: 1rem 0 0.5rem;
		font-weight: 800;
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

	.hint {
		margin: 0.45rem 0 0;
		color: #666274;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.message {
		min-height: 1.4em;
		margin: 0.75rem 0 0;
		font-weight: 700;
	}

	.error {
		color: #b32636;
	}

	.success {
		margin-top: 0.2rem;
		color: #167067;
	}

	button {
		width: 100%;
		min-height: 3.5rem;
		margin-top: 1rem;
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
</style>
