import type { FamilyAlbumPhotoId } from '$lib/family-album/familyAlbumPhotos';

export type FamilyAlbumPhotoMoveDirection = -1 | 1;
export type FamilyAlbumPhotoMoveEdge = 'first' | 'last';

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

export function moveFamilyAlbumPhotoIdToEdge(
	ids: readonly FamilyAlbumPhotoId[],
	id: FamilyAlbumPhotoId,
	edge: FamilyAlbumPhotoMoveEdge
) {
	const currentIndex = ids.indexOf(id);

	if (currentIndex < 0) return [...ids];

	const targetIndex = edge === 'first' ? 0 : ids.length - 1;

	if (currentIndex === targetIndex) return [...ids];

	const nextIds = [...ids];
	const [movedId] = nextIds.splice(currentIndex, 1);
	nextIds.splice(targetIndex, 0, movedId);

	return nextIds;
}
