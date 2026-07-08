<script lang="ts">
	import type { FamilyAlbumPhoto } from '$lib/family-album/familyAlbumPhotos';

	let { photo, fit = 'cover' }: { photo: FamilyAlbumPhoto; fit?: 'cover' | 'contain' } = $props();

	let imageUrl = $state('');

	$effect(() => {
		const url = URL.createObjectURL(photo.image);
		imageUrl = url;

		return () => {
			URL.revokeObjectURL(url);
		};
	});
</script>

{#if imageUrl}
	<img class:contain={fit === 'contain'} src={imageUrl} alt={photo.name} />
{/if}

<style lang="scss">
	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.contain {
		background: #f4efe4;
		object-fit: contain;
	}
</style>
