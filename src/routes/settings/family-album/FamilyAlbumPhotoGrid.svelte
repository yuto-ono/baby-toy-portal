<script lang="ts">
	import type { FamilyAlbumPhoto, FamilyAlbumPhotoId } from '$lib/family-album/familyAlbumPhotos';
	import FamilyAlbumPhotoThumbnail from './FamilyAlbumPhotoThumbnail.svelte';

	let {
		photos,
		selectedPhotoId,
		disabled,
		onSelect
	}: {
		photos: FamilyAlbumPhoto[];
		selectedPhotoId: FamilyAlbumPhotoId | undefined;
		disabled: boolean;
		onSelect: (id: FamilyAlbumPhotoId) => void;
	} = $props();
</script>

<ul class="photo-grid" aria-label="登録済み写真">
	{#each photos as photo, index (photo.id)}
		<li>
			<button
				class:selected={photo.id === selectedPhotoId}
				type="button"
				{disabled}
				aria-label={`${index + 1}枚目、${photo.name}の詳細を開く`}
				aria-pressed={photo.id === selectedPhotoId}
				onclick={() => onSelect(photo.id)}
			>
				<FamilyAlbumPhotoThumbnail {photo} />
				<span class="position" aria-hidden="true">{index + 1}</span>
			</button>
		</li>
	{/each}
</ul>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.photo-grid {
		display: grid;
		margin: 1.5rem 0 0;
		padding: 0;
		gap: 0.85rem;
		grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
		list-style: none;
	}

	button {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		padding: 0;
		border: 3px solid $ink;
		border-radius: 1rem;
		background: #f4efe4;
		box-shadow: 4px 4px 0 $accent-yellow;
		cursor: pointer;
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;

		&:hover:not(:disabled),
		&.selected {
			transform: translateY(-2px);
			box-shadow: 5px 6px 0 $accent-mint;
		}

		&:disabled {
			cursor: wait;
			opacity: 0.6;
		}

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 4px;
		}
	}

	.position {
		position: absolute;
		top: 0.45rem;
		left: 0.45rem;
		display: inline-flex;
		min-width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		padding: 0 0.45rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: rgba(#fff, 0.92);
		color: $ink;
		font-size: 0.95rem;
		font-weight: 900;
	}

	@media (max-width: 560px) {
		.photo-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
