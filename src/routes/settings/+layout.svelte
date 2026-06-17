<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ParentPinGate from './ParentPinGate.svelte';
	import PinForm from './PinForm.svelte';
	import SettingsDialogShell from './SettingsDialogShell.svelte';
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
	<SettingsDialogShell labelledBy="pin-form-title" variant="setup" onClose={returnHome}>
		<PinForm mode="setup" onSave={setupPin} />
	</SettingsDialogShell>
{/if}
