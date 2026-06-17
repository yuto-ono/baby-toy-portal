<script lang="ts">
	import type { FamilyAlbumPhoto } from '$lib/family-album/familyAlbumPhotos';
	import FamilyAlbumTapEffects from './FamilyAlbumTapEffects.svelte';

	let {
		photo,
		isLocked,
		onNext
	}: {
		photo: FamilyAlbumPhoto;
		isLocked: boolean;
		onNext: () => void;
	} = $props();

	let viewerElement = $state<HTMLButtonElement>();
	let imageSource = $state<{ photoId: string; url: string }>();

	$effect(() => {
		const url = URL.createObjectURL(photo.image);
		imageSource = { photoId: photo.id, url };

		return () => {
			URL.revokeObjectURL(url);
		};
	});
</script>

<button
	bind:this={viewerElement}
	class="viewer"
	class:locked={isLocked}
	type="button"
	aria-label="次の写真を見る"
	onclick={onNext}
>
	{#if imageSource?.photoId === photo.id}
		{#key photo.id}
			<div
				class="photo-image"
				style={`background-image: url("${imageSource.url}")`}
				aria-hidden="true"
			></div>
		{/key}
	{/if}

	<FamilyAlbumTapEffects target={viewerElement} />
</button>

<style lang="scss">
	$album-background: #fff8e7;
	$photo-enter-duration: 500ms;

	.viewer {
		position: relative;
		display: grid;
		width: 100%;
		height: 100%;
		min-height: 0;
		place-items: center;
		padding: 0;
		border: 0;
		background:
			radial-gradient(circle at 14% 18%, #ffd86f 0 5rem, transparent 5.1rem),
			radial-gradient(circle at 88% 82%, #8edbd3 0 6rem, transparent 6.1rem),
			linear-gradient(135deg, #fffef6, $album-background);
		cursor: pointer;
		overflow: hidden;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;

		&:focus-visible {
			outline: 6px solid #67c7bf;
			outline-offset: -10px;
		}
	}

	.locked {
		cursor: wait;
	}

	.photo-image {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		min-width: 0;
		min-height: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		box-shadow: none;
		pointer-events: none;
		user-select: none;
		animation: photo-enter $photo-enter-duration ease-in-out both;
	}

	@keyframes photo-enter {
		from {
			opacity: 0;
			transform: scale(0.985);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.photo-image {
			animation-duration: 180ms;
			animation-name: photo-fade;
		}
	}

	@keyframes photo-fade {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}
</style>
