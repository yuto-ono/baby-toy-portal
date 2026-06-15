<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ParentPinGate from './ParentPinGate.svelte';
	import PinForm from './PinForm.svelte';
	import { createPinCredential, verifyPin, type PinCredential } from './pinCredential';
	import { loadPinCredential, savePinCredential } from './pinStorage';

	let { children } = $props();

	type ViewState = 'loading' | 'setup' | 'locked' | 'authenticated';

	let credential = $state<PinCredential>();
	let viewState = $state<ViewState>('loading');

	onMount(() => {
		credential = loadPinCredential() ?? undefined;
		viewState = credential ? 'locked' : 'setup';
	});

	function returnHome(): void {
		void goto(resolve('/'));
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (viewState === 'setup' && event.key === 'Escape') returnHome();
	}

	async function authenticate(pin: string): Promise<boolean> {
		if (!credential) return false;

		const matches = await verifyPin(pin, credential);

		if (matches) viewState = 'authenticated';
		return matches;
	}

	async function setupPin(pin: string): Promise<void> {
		const nextCredential = await createPinCredential(pin);
		savePinCredential(nextCredential);
		credential = nextCredential;
		viewState = 'authenticated';
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if viewState === 'authenticated'}
	{@render children()}
{:else if viewState === 'locked'}
	<ParentPinGate onAuthenticate={authenticate} />
{:else if viewState === 'setup'}
	<main class="setup-page">
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

		<div class="setup-dialog" role="dialog" aria-modal="true" aria-labelledby="pin-form-title">
			<PinForm mode="setup" onSave={setupPin} />
		</div>
	</main>
{/if}

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: $page-background;
		color: $ink;
		font-family: 'Hiragino Maru Gothic ProN', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
	}

	.setup-page {
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

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 3px;
		}
	}

	.setup-dialog {
		position: relative;
		z-index: 1;
		width: min(100%, 34rem);
		margin: auto 0;
	}

	.setup-dialog :global(section) {
		width: 100%;
		margin: 0;
		box-shadow: 8px 8px 0 #ff8d8d;
	}
</style>
