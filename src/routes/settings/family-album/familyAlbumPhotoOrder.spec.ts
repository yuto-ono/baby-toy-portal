import { describe, expect, it } from 'vitest';
import { moveFamilyAlbumPhotoId } from './familyAlbumPhotoOrder';

describe('moveFamilyAlbumPhotoId', () => {
	it('moves the selected id in the requested direction', () => {
		expect(moveFamilyAlbumPhotoId(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
		expect(moveFamilyAlbumPhotoId(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
	});

	it('keeps the order when the selected id cannot move', () => {
		expect(moveFamilyAlbumPhotoId(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
		expect(moveFamilyAlbumPhotoId(['a', 'b', 'c'], 'c', 1)).toEqual(['a', 'b', 'c']);
		expect(moveFamilyAlbumPhotoId(['a', 'b', 'c'], 'missing', 1)).toEqual(['a', 'b', 'c']);
	});
});
