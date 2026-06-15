<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { isValidPin } from './pinCredential';

	let {
		onAuthenticate
	}: {
		onAuthenticate: (pin: string) => Promise<boolean>;
	} = $props();

	let pin = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	function returnHome(): void {
		void goto(resolve('/'));
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') returnHome();
	}

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		errorMessage = '';

		if (!isValidPin(pin)) {
			errorMessage = 'PINが違います。もう一度入力してください。';
			return;
		}

		isSubmitting = true;
		const authenticated = await onAuthenticate(pin);
		isSubmitting = false;

		if (!authenticated) {
			pin = '';
			errorMessage = 'PINが違います。もう一度入力してください。';
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<main>
	<button
		class="backdrop"
		type="button"
		tabindex="-1"
		aria-label="設定を閉じて戻る"
		onclick={returnHome}
	></button>

	<a class="home-link" href={resolve('/')}>
		<ArrowLeft size={26} strokeWidth={3} aria-hidden="true" />
		<span>戻る</span>
	</a>

	<div class="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
		<div class="icon" aria-hidden="true">
			<LockKeyhole size={44} strokeWidth={2.5} />
		</div>
		<p class="eyebrow">おとなのかたへ</p>
		<h1 id="gate-title">保護者設定</h1>
		<p class="description">設定を開くには、保護者PINを入力してください。</p>

		<form onsubmit={submit}>
			<input
				id="parent-pin"
				type="password"
				inputmode="numeric"
				pattern="[0-9]*"
				autocomplete="off"
				bind:value={pin}
				aria-describedby="pin-hint pin-error"
			/>
			<p id="pin-error" class="error" aria-live="polite">{errorMessage}</p>

			<button type="submit" disabled={isSubmitting}>
				{isSubmitting ? '確認しています…' : '設定を開く'}
			</button>
		</form>
	</div>
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	main {
		position: relative;
		display: flex;
		min-height: 100dvh;
		align-items: center;
		flex-direction: column;
		padding: 1rem;
		background:
			linear-gradient(rgba($ink, 0.55), rgba($ink, 0.55)),
			radial-gradient(circle at 10% 14%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 90% 86%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}

	.backdrop {
		position: absolute;
		z-index: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.home-link {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-self: flex-start;
		align-items: center;
		gap: 0.4rem;
		min-height: 3rem;
		padding: 0.65rem 1rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-yellow;
		color: inherit;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 3px;
		}
	}

	.gate {
		position: relative;
		z-index: 1;
		width: min(100%, 28rem);
		margin: auto 0;
		padding: clamp(1.5rem, 6vw, 2.5rem);
		border: 3px solid $ink;
		border-radius: 2rem;
		background: #fff;
		text-align: center;
		box-shadow: 8px 8px 0 $accent-pink;
		cursor: auto;
	}

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
		text-align: left;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
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
</style>
