import { describe, expect, it } from 'vitest';
import {
	createFamilyAlbumPhotoRepository,
	getFamilyAlbumResizeDimensions,
	reorderFamilyAlbumPhotoRecords,
	type FamilyAlbumPhoto
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
		image: new Blob([id], { type: 'image/jpeg' }),
		mimeType: 'image/jpeg',
		width: 1200,
		height: 800,
		order,
		createdAt
	};
}

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
			image: resized,
			mimeType: 'image/jpeg',
			width: 1600,
			height: 1200,
			order: 5,
			createdAt: 1234
		});
		expect(await photos()).toHaveLength(2);
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
