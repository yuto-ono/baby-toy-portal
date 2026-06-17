<script lang="ts">
	import { PageNavigation } from '$lib';
	import AppUpdatePanel from './AppUpdatePanel.svelte';
	import FamilyAlbumSettingsLink from './FamilyAlbumSettingsLink.svelte';
	import PinSettingsLink from './PinSettingsLink.svelte';
</script>

<svelte:head>
	<title>保護者設定 | Baby Toy Portal</title>
	<meta name="description" content="Baby Toy Portalの保護者向け設定画面です。" />
</svelte:head>

<main>
	<PageNavigation title="保護者設定" />
	<div class="settings-list">
		<AppUpdatePanel />
		<FamilyAlbumSettingsLink />
		<PinSettingsLink />
	</div>
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

	.settings-list {
		display: grid;
		width: min(calc(100% - 3rem), 34rem);
		margin: clamp(2rem, 7vw, 3.5rem) auto;
		gap: 1.5rem;
	}
</style>
