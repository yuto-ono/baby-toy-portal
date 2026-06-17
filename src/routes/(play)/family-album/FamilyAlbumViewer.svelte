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
			<img class="photo-image" src={imageSource.url} alt="" draggable="false" />
		{/key}
	{/if}

	<FamilyAlbumTapEffects target={viewerElement} />
</button>

<style lang="scss">
	$ink: #333145;
	$album-background: #fff8e7;

	.viewer {
		position: relative;
		display: grid;
		width: 100%;
		height: 100%;
		min-height: 0;
		place-items: center;
		padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
			max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
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
		display: block;
		width: 100%;
		height: 100%;
		border: clamp(0.35rem, 1vw, 0.55rem) solid #fff;
		border-radius: clamp(1.25rem, 4vw, 2.5rem);
		background: #fff;
		box-shadow:
			0 0 0 3px $ink,
			0 1rem 2rem rgba($ink, 0.22);
		object-fit: contain;
		pointer-events: none;
		user-select: none;
		animation: photo-enter 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
		-webkit-user-drag: none;
	}

	@keyframes photo-enter {
		from {
			opacity: 0;
			transform: scale(0.975);
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
