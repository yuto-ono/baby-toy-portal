import {
	normalizeFamilyAlbumPhotoName,
	type FamilyAlbumPhoto,
	type FamilyAlbumPhotoId
} from '$lib/family-album/familyAlbumPhotos';

export type FamilyAlbumSettingsLoadState = 'loading' | 'ready' | 'error';

export function getFamilyAlbumSettingsStatusMessage({
	loadState,
	isWorking,
	errorMessage
}: {
	loadState: FamilyAlbumSettingsLoadState;
	isWorking: boolean;
	errorMessage: string;
}) {
	if (loadState === 'loading') return '写真を読み込んでいます。';
	if (isWorking) return '保存しています。';

	return errorMessage;
}

export function getAvailableFamilyAlbumPhotoId(
	selectedPhotoId: FamilyAlbumPhotoId | undefined,
	photos: readonly FamilyAlbumPhoto[]
) {
	if (!selectedPhotoId) return undefined;

	return photos.some((photo) => photo.id === selectedPhotoId) ? selectedPhotoId : undefined;
}

export function renameFamilyAlbumPhotoInList(
	photos: readonly FamilyAlbumPhoto[],
	id: FamilyAlbumPhotoId,
	name: string
) {
	return photos.map((photo) =>
		photo.id === id ? { ...photo, name: normalizeFamilyAlbumPhotoName(name, photo.name) } : photo
	);
}

export function removeFamilyAlbumPhotoFromList(
	photos: readonly FamilyAlbumPhoto[],
	id: FamilyAlbumPhotoId
) {
	return photos.filter((photo) => photo.id !== id);
}

export function getFamilyAlbumPhotoIdsWithAddedFirst(
	currentPhotoIds: readonly FamilyAlbumPhotoId[],
	addedPhotoIds: readonly FamilyAlbumPhotoId[]
) {
	const addedPhotoIdSet = new Set(addedPhotoIds);

	return [...addedPhotoIds, ...currentPhotoIds.filter((id) => !addedPhotoIdSet.has(id))];
}
