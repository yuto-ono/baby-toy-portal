import { describe, expect, it } from 'vitest';
import { moveFamilyAlbumPhotoId, moveFamilyAlbumPhotoIdToEdge } from './familyAlbumPhotoOrder';

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

describe('moveFamilyAlbumPhotoIdToEdge', () => {
	it('moves the selected id to the requested edge', () => {
		expect(moveFamilyAlbumPhotoIdToEdge(['a', 'b', 'c', 'd'], 'c', 'first')).toEqual([
			'c',
			'a',
			'b',
			'd'
		]);
		expect(moveFamilyAlbumPhotoIdToEdge(['a', 'b', 'c', 'd'], 'b', 'last')).toEqual([
			'a',
			'c',
			'd',
			'b'
		]);
	});

	it('keeps the order when the selected id is already at the edge or missing', () => {
		expect(moveFamilyAlbumPhotoIdToEdge(['a', 'b', 'c'], 'a', 'first')).toEqual(['a', 'b', 'c']);
		expect(moveFamilyAlbumPhotoIdToEdge(['a', 'b', 'c'], 'c', 'last')).toEqual(['a', 'b', 'c']);
		expect(moveFamilyAlbumPhotoIdToEdge(['a', 'b', 'c'], 'missing', 'first')).toEqual([
			'a',
			'b',
			'c'
		]);
	});
});
