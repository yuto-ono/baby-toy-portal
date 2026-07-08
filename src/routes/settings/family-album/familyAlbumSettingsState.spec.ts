import { describe, expect, it } from 'vitest';
import type { FamilyAlbumPhoto } from '$lib/family-album/familyAlbumPhotos';
import {
	getAvailableFamilyAlbumPhotoId,
	getFamilyAlbumPhotoIdsWithAddedFirst,
	getFamilyAlbumSettingsStatusMessage,
	removeFamilyAlbumPhotoFromList,
	renameFamilyAlbumPhotoInList
} from './familyAlbumSettingsState';

function createPhoto(id: string, name: string): FamilyAlbumPhoto {
	return {
		id,
		name,
		image: new Blob([id], { type: 'image/jpeg' }),
		mimeType: 'image/jpeg',
		width: 100,
		height: 100,
		order: 0,
		createdAt: 0
	};
}

describe('getFamilyAlbumSettingsStatusMessage', () => {
	it('prioritizes loading and saving messages over errors', () => {
		expect(
			getFamilyAlbumSettingsStatusMessage({
				loadState: 'loading',
				isWorking: true,
				errorMessage: '失敗しました。'
			})
		).toBe('写真を読み込んでいます。');

		expect(
			getFamilyAlbumSettingsStatusMessage({
				loadState: 'ready',
				isWorking: true,
				errorMessage: '失敗しました。'
			})
		).toBe('保存しています。');
	});

	it('returns the current error message when the page is idle', () => {
		expect(
			getFamilyAlbumSettingsStatusMessage({
				loadState: 'ready',
				isWorking: false,
				errorMessage: 'もう一度お試しください。'
			})
		).toBe('もう一度お試しください。');
	});
});

describe('getAvailableFamilyAlbumPhotoId', () => {
	it('keeps an existing selected photo id', () => {
		expect(getAvailableFamilyAlbumPhotoId('photo-1', [createPhoto('photo-1', '写真')])).toBe(
			'photo-1'
		);
	});

	it('clears missing or empty selected photo ids', () => {
		expect(getAvailableFamilyAlbumPhotoId('missing', [createPhoto('photo-1', '写真')])).toBe(
			undefined
		);
		expect(getAvailableFamilyAlbumPhotoId(undefined, [createPhoto('photo-1', '写真')])).toBe(
			undefined
		);
	});
});

describe('renameFamilyAlbumPhotoInList', () => {
	it('renames and normalizes the selected photo only', () => {
		const photos = [createPhoto('photo-1', '古い名前'), createPhoto('photo-2', 'そのまま')];

		expect(renameFamilyAlbumPhotoInList(photos, 'photo-1', '  新しい   名前  ')).toEqual([
			{ ...photos[0], name: '新しい 名前' },
			photos[1]
		]);
	});

	it('uses the current name when the next name is blank', () => {
		const photos = [createPhoto('photo-1', '古い名前')];

		expect(renameFamilyAlbumPhotoInList(photos, 'photo-1', '   ')).toEqual([
			{ ...photos[0], name: '古い名前' }
		]);
	});
});

describe('removeFamilyAlbumPhotoFromList', () => {
	it('removes the selected photo', () => {
		const photos = [createPhoto('photo-1', '削除する'), createPhoto('photo-2', '残す')];

		expect(removeFamilyAlbumPhotoFromList(photos, 'photo-1')).toEqual([photos[1]]);
	});
});

describe('getFamilyAlbumPhotoIdsWithAddedFirst', () => {
	it('keeps added photos in the selected order before existing photos', () => {
		expect(getFamilyAlbumPhotoIdsWithAddedFirst(['old-1', 'old-2'], ['new-1', 'new-2'])).toEqual([
			'new-1',
			'new-2',
			'old-1',
			'old-2'
		]);
	});

	it('does not duplicate ids that already exist in the current list', () => {
		expect(getFamilyAlbumPhotoIdsWithAddedFirst(['old-1', 'new-1', 'old-2'], ['new-1'])).toEqual([
			'new-1',
			'old-1',
			'old-2'
		]);
	});
});
