<script lang="ts">
	import type { FamilyAlbumPhoto } from '$lib/family-album/familyAlbumPhotos';

	let {
		photo,
		isLocked,
		onNext
	}: {
		photo: FamilyAlbumPhoto;
		isLocked: boolean;
		onNext: () => void;
	} = $props();

	let imageUrl = $state('');

	$effect(() => {
		const url = URL.createObjectURL(photo.image);
		imageUrl = url;

		return () => {
			URL.revokeObjectURL(url);
		};
	});
</script>

<button
	class="viewer"
	class:locked={isLocked}
	type="button"
	aria-label="次の写真を見る"
	onclick={onNext}
>
	{#if imageUrl}
		<img src={imageUrl} alt="" draggable="false" />
	{/if}
</button>

<style lang="scss">
	$ink: #333145;
	$album-background: #fff8e7;

	.viewer {
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
		touch-action: manipulation;

		&:focus-visible {
			outline: 6px solid #67c7bf;
			outline-offset: -10px;
		}
	}

	.locked {
		cursor: wait;
	}

	img {
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
		-webkit-user-drag: none;
	}
</style>
