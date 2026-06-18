<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { PageNavigation, TapEffects } from '$lib';
	import {
		listFamilyAlbumPhotos,
		type FamilyAlbumPhoto
	} from '$lib/family-album/familyAlbumPhotos';
	import FamilyAlbumViewer from './FamilyAlbumViewer.svelte';

	const TAP_LOCK_MS = 1000;

	type LoadState = 'loading' | 'ready' | 'error';

	let photos = $state<FamilyAlbumPhoto[]>([]);
	let currentPhotoIndex = $state(0);
	let loadState = $state<LoadState>('loading');
	let isTapLocked = $state(false);
	let emptyStateElement = $state<HTMLElement>();
	let lockTimeoutId: ReturnType<typeof setTimeout> | undefined;

	const currentPhoto = $derived(photos[currentPhotoIndex]);

	onMount(() => {
		void loadPhotos();
	});

	onDestroy(() => {
		if (lockTimeoutId) {
			clearTimeout(lockTimeoutId);
		}
	});

	async function loadPhotos(): Promise<void> {
		loadState = 'loading';

		try {
			photos = await listFamilyAlbumPhotos();
			currentPhotoIndex = 0;
			loadState = 'ready';
		} catch {
			loadState = 'error';
		}
	}

	function showNextPhoto(): void {
		if (isTapLocked || photos.length <= 1) return;

		currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
		isTapLocked = true;

		if (lockTimeoutId) {
			clearTimeout(lockTimeoutId);
		}

		lockTimeoutId = setTimeout(() => {
			isTapLocked = false;
			lockTimeoutId = undefined;
		}, TAP_LOCK_MS);
	}
</script>

<svelte:head>
	<title>アルバムを 見よう | Baby Toy Portal</title>
	<meta name="theme-color" content="#fff8e7" />
	<meta
		name="description"
		content="家族写真を大きく表示して、タップで切り替えて遊べるアルバムです。"
	/>
</svelte:head>

<main>
	<PageNavigation title="アルバムを 見よう" />

	{#if loadState === 'loading'}
		<section class="message-state" aria-live="polite" aria-labelledby="family-album-loading-title">
			<p class="child-message" id="family-album-loading-title">しゃしんを よみこんでいるよ</p>
		</section>
	{:else if loadState === 'error'}
		<button
			class="message-state retry-state"
			type="button"
			aria-labelledby="family-album-error-title"
			onclick={loadPhotos}
		>
			<RotateCcw size={56} strokeWidth={2.6} aria-hidden="true" />
			<span class="child-message" id="family-album-error-title">もういちど 見る</span>
			<span class="parent-message"
				>写真を読み込めませんでした。画面をタップすると再読み込みします。</span
			>
		</button>
	{:else if photos.length === 0}
		<section
			bind:this={emptyStateElement}
			class="message-state effect-state"
			aria-labelledby="family-album-empty-title"
		>
			<p class="child-message" id="family-album-empty-title">しゃしんを 入れてね</p>
			<p class="parent-message">保護者設定の家族アルバムから、表示したい写真を追加できます。</p>
			<TapEffects target={emptyStateElement} />
		</section>
	{:else if currentPhoto}
		<FamilyAlbumViewer photo={currentPhoto} isLocked={isTapLocked} onNext={showNextPhoto} />
	{/if}
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;
	$muted: #666274;

	main,
	main :global(*) {
		user-select: none;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
	}

	main {
		position: fixed;
		inset: 0;
		display: grid;
		height: 100dvh;
		grid-template-rows: auto 1fr;
		overflow: hidden;
		overscroll-behavior: none;
		background:
			radial-gradient(circle at 14% 18%, #ffd86f 0 5rem, transparent 5.1rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
		color: $ink;
	}

	.message-state {
		position: relative;
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
		align-content: center;
		gap: 1rem;
		padding: clamp(1.5rem, 6vw, 4rem);
		border: 0;
		background:
			radial-gradient(circle at 16% 78%, $accent-pink 0 4rem, transparent 4.1rem),
			radial-gradient(circle at 86% 22%, $accent-mint 0 5rem, transparent 5.1rem),
			linear-gradient(135deg, #fffef6, $page-background);
		color: inherit;
		font: inherit;
		text-align: center;
	}

	.effect-state {
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.retry-state {
		cursor: pointer;
		touch-action: manipulation;

		&:focus-visible {
			outline: 6px solid $accent-mint;
			outline-offset: -10px;
		}
	}

	.child-message {
		max-width: 18em;
		margin: 0;
		font-size: clamp(2.1rem, 9vw, 5rem);
		font-weight: 800;
		line-height: 1.25;
	}

	.parent-message {
		max-width: 34rem;
		margin: 0;
		padding: 0.9rem 1.1rem;
		border: 3px solid $ink;
		border-radius: 1.2rem;
		background: #fff;
		color: $muted;
		font-size: clamp(1rem, 3vw, 1.35rem);
		font-weight: 800;
		line-height: 1.6;
		box-shadow: 5px 5px 0 $accent-yellow;
	}
</style>
