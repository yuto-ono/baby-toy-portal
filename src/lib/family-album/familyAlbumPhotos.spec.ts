import { describe, expect, it } from 'vitest';
import {
	FAMILY_ALBUM_PHOTO_NAME_MAX_LENGTH,
	createFamilyAlbumPhotoRepository,
	getFamilyAlbumPhotoNameFromFileName,
	getFamilyAlbumResizeDimensions,
	normalizeFamilyAlbumPhotoRecords,
	normalizeFamilyAlbumPhotoRecordsWithIssues,
	normalizeFamilyAlbumPhotoName,
	reorderFamilyAlbumPhotoRecords,
	type FamilyAlbumPhoto,
	type StoredFamilyAlbumPhoto
} from './familyAlbumPhotos';

function createPhotoStorageMock(initialPhotos: readonly FamilyAlbumPhoto[] = []) {
	let photos = [...initialPhotos];

	return {
		storage: {
			async add(photo: FamilyAlbumPhoto) {
				photos = [...photos, photo];
			},
			async list() {
				return [...photos];
			},
			async listWithIssues() {
				return { photos: [...photos], issues: [] };
			},
			async putAll(nextPhotos: readonly FamilyAlbumPhoto[]) {
				const nextPhotosById = new Map(nextPhotos.map((photo) => [photo.id, photo]));
				photos = photos.map((photo) => nextPhotosById.get(photo.id) ?? photo);
			},
			async delete(id: string) {
				photos = photos.filter((photo) => photo.id !== id);
			}
		},
		async photos() {
			return [...photos];
		}
	};
}

function createPhoto(id: string, order: number, createdAt = order): FamilyAlbumPhoto {
	return {
		id,
		name: `photo ${id}`,
		image: new Blob([id], { type: 'image/jpeg' }),
		mimeType: 'image/jpeg',
		width: 1200,
		height: 800,
		order,
		createdAt
	};
}

function createStoredPhoto(
	id: string,
	order: number,
	overrides: Partial<StoredFamilyAlbumPhoto> = {}
): StoredFamilyAlbumPhoto {
	return {
		id,
		name: `photo ${id}`,
		imageData: new Uint8Array([1, 2, 3]).buffer,
		mimeType: 'image/jpeg',
		width: 1200,
		height: 800,
		order,
		createdAt: order,
		...overrides
	};
}

describe('normalizeFamilyAlbumPhotoName', () => {
	it('trims blank space and limits the stored name length', () => {
		expect(normalizeFamilyAlbumPhotoName('  おでかけ   写真  ')).toBe('おでかけ 写真');
		expect(normalizeFamilyAlbumPhotoName('')).toBe('家族の写真');
		expect(normalizeFamilyAlbumPhotoName('a'.repeat(80))).toHaveLength(
			FAMILY_ALBUM_PHOTO_NAME_MAX_LENGTH
		);
	});
});

describe('getFamilyAlbumPhotoNameFromFileName', () => {
	it('uses the file name without its extension as the default photo name', () => {
		expect(getFamilyAlbumPhotoNameFromFileName('birthday-party.jpg')).toBe('birthday-party');
		expect(getFamilyAlbumPhotoNameFromFileName('家族.png')).toBe('家族');
	});
});

describe('getFamilyAlbumResizeDimensions', () => {
	it('keeps images within the maximum side while preserving aspect ratio', () => {
		expect(getFamilyAlbumResizeDimensions(4000, 3000)).toEqual({ width: 1600, height: 1200 });
		expect(getFamilyAlbumResizeDimensions(1200, 900)).toEqual({ width: 1200, height: 900 });
		expect(getFamilyAlbumResizeDimensions(1200, 2400)).toEqual({ width: 800, height: 1600 });
	});

	it('rejects invalid dimensions', () => {
		expect(() => getFamilyAlbumResizeDimensions(0, 1200)).toThrow(
			'Image dimensions must be positive.'
		);
	});
});

describe('reorderFamilyAlbumPhotoRecords', () => {
	it('moves requested photos first and assigns display order from the start', () => {
		const photos = [createPhoto('a', 0), createPhoto('b', 1), createPhoto('c', 2)];

		expect(
			reorderFamilyAlbumPhotoRecords(photos, ['c', 'a']).map(({ id, order }) => ({ id, order }))
		).toEqual([
			{ id: 'c', order: 0 },
			{ id: 'a', order: 1 },
			{ id: 'b', order: 2 }
		]);
	});

	it('rejects duplicate or unknown ids', () => {
		const photos = [createPhoto('a', 0), createPhoto('b', 1)];

		expect(() => reorderFamilyAlbumPhotoRecords(photos, ['a', 'a'])).toThrow(
			'Photo order contains duplicate ids.'
		);
		expect(() => reorderFamilyAlbumPhotoRecords(photos, ['missing'])).toThrow(
			'Photo order contains an unknown id.'
		);
	});
});

describe('normalizeFamilyAlbumPhotoRecords', () => {
	it('skips records that cannot be restored as photos', async () => {
		const photos = await normalizeFamilyAlbumPhotoRecords([
			createStoredPhoto('a', 0),
			createStoredPhoto('broken', 1, { imageData: undefined }),
			createStoredPhoto('b', 2)
		]);

		expect(photos.map((photo) => photo.id)).toEqual(['a', 'b']);
	});

	it('keeps issue details for skipped records', async () => {
		const result = await normalizeFamilyAlbumPhotoRecordsWithIssues([
			createStoredPhoto('a', 0),
			createStoredPhoto('broken', 1, { imageData: undefined })
		]);

		expect(result.photos.map((photo) => photo.id)).toEqual(['a']);
		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]).toMatchObject({ id: 'broken', reason: 'missing-image' });
		expect(result.issues[0]?.error).toBeInstanceOf(Error);
	});

	it('returns an empty photo list when all records are broken', async () => {
		await expect(
			normalizeFamilyAlbumPhotoRecords([createStoredPhoto('broken', 0, { imageData: undefined })])
		).resolves.toEqual([]);
	});
});

describe('createFamilyAlbumPhotoRepository', () => {
	it('adds a re-encoded photo after existing photos', async () => {
		const original = new Blob(['original'], { type: 'image/png' });
		const resized = new Blob(['resized'], { type: 'image/jpeg' });
		const { storage, photos } = createPhotoStorageMock([createPhoto('existing', 4)]);
		const repository = createFamilyAlbumPhotoRepository({
			storage,
			createId: () => 'new-photo',
			now: () => 1234,
			prepareImage: async () => ({
				image: resized,
				mimeType: 'image/jpeg',
				width: 1600,
				height: 1200
			})
		});

		const addedPhoto = await repository.addPhoto(original);

		expect(addedPhoto).toMatchObject({
			id: 'new-photo',
			name: '家族の写真',
			image: resized,
			mimeType: 'image/jpeg',
			width: 1600,
			height: 1200,
			order: 5,
			createdAt: 1234
		});
		expect(await photos()).toHaveLength(2);
	});

	it('adds a photo with a normalized name', async () => {
		const { storage } = createPhotoStorageMock();
		const repository = createFamilyAlbumPhotoRepository({
			storage,
			createId: () => 'new-photo',
			prepareImage: async () => ({
				image: new Blob(),
				mimeType: 'image/jpeg',
				width: 1,
				height: 1
			})
		});

		const addedPhoto = await repository.addPhoto(new Blob(), '  おでかけ   写真  ');

		expect(addedPhoto.name).toBe('おでかけ 写真');
	});

	it('lists photos by display order and creation time', async () => {
		const { storage } = createPhotoStorageMock([
			createPhoto('later', 1, 20),
			createPhoto('first', 0, 30),
			createPhoto('earlier', 1, 10)
		]);
		const repository = createFamilyAlbumPhotoRepository({
			storage,
			prepareImage: async () => ({
				image: new Blob(),
				mimeType: 'image/jpeg',
				width: 1,
				height: 1
			})
		});

		expect((await repository.listPhotos()).map((photo) => photo.id)).toEqual([
			'first',
			'earlier',
			'later'
		]);
	});

	it('lists restorable photos with broken record issues', async () => {
		const brokenRecordError = new Error('Stored photo image is missing.');
		const repository = createFamilyAlbumPhotoRepository({
			storage: {
				async add() {},
				async list() {
					return [];
				},
				async listWithIssues() {
					return {
						photos: [createPhoto('later', 1), createPhoto('first', 0)],
						issues: [{ id: 'broken', reason: 'restore-failed', error: brokenRecordError }]
					};
				},
				async putAll() {},
				async delete() {}
			},
			prepareImage: async () => ({
				image: new Blob(),
				mimeType: 'image/jpeg',
				width: 1,
				height: 1
			})
		});

		const result = await repository.listPhotoRecordsWithIssues();

		expect(result.photos.map((photo) => photo.id)).toEqual(['first', 'later']);
		expect(result.issues).toEqual([
			{ id: 'broken', reason: 'restore-failed', error: brokenRecordError }
		]);
	});

	it('updates a photo name', async () => {
		const { storage } = createPhotoStorageMock([createPhoto('a', 0)]);
		const repository = createFamilyAlbumPhotoRepository({
			storage,
			prepareImage: async () => ({
				image: new Blob(),
				mimeType: 'image/jpeg',
				width: 1,
				height: 1
			})
		});

		await repository.updatePhotoName('a', '  新しい   名前  ');

		expect((await repository.listPhotos())[0].name).toBe('新しい 名前');
	});

	it('updates photo order and deletes photos', async () => {
		const { storage } = createPhotoStorageMock([
			createPhoto('a', 0),
			createPhoto('b', 1),
			createPhoto('c', 2)
		]);
		const repository = createFamilyAlbumPhotoRepository({
			storage,
			prepareImage: async () => ({
				image: new Blob(),
				mimeType: 'image/jpeg',
				width: 1,
				height: 1
			})
		});

		await repository.reorderPhotos(['c', 'a']);
		await repository.deletePhoto('a');

		expect((await repository.listPhotos()).map((photo) => photo.id)).toEqual(['c', 'b']);
	});
});
