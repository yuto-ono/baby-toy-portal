<script lang="ts">
	import { PageNavigation } from '$lib';
	import PinForm from '../PinForm.svelte';
	import { createPinCredential } from '../pinCredential';
	import { savePinCredential } from '../pinStorage';

	async function changePin(pin: string): Promise<void> {
		const credential = await createPinCredential(pin);
		savePinCredential(credential);
	}
</script>

<svelte:head>
	<title>保護者PIN | Baby Toy Portal</title>
	<meta name="description" content="Baby Toy Portalの保護者PINを変更します。" />
</svelte:head>

<main>
	<PageNavigation title="保護者PIN" backHref="/settings" />
	<PinForm onSave={changePin} />
</main>

<style lang="scss">
	$page-background: #fff8e7;

	main {
		min-height: 100dvh;
		padding-bottom: 2rem;
		background:
			radial-gradient(circle at 12% 82%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 28%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}
</style>
