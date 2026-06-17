import type { FamilyAlbumPhotoId } from '$lib/family-album/familyAlbumPhotos';

export type FamilyAlbumPhotoMoveDirection = -1 | 1;

export function moveFamilyAlbumPhotoId(
	ids: readonly FamilyAlbumPhotoId[],
	id: FamilyAlbumPhotoId,
	direction: FamilyAlbumPhotoMoveDirection
) {
	const currentIndex = ids.indexOf(id);
	const nextIndex = currentIndex + direction;

	if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ids.length) {
		return [...ids];
	}

	const nextIds = [...ids];
	[nextIds[currentIndex], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[currentIndex]];

	return nextIds;
}
