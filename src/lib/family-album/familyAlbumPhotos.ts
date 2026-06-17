const DATABASE_NAME = 'baby-toy-portal:family-album';
const DATABASE_VERSION = 1;
const PHOTO_STORE_NAME = 'photos';
const PHOTO_ORDER_INDEX_NAME = 'by-display-order';
const PHOTO_MAX_SIDE_PX = 1600;
const PHOTO_JPEG_QUALITY = 0.88;
const REORDER_START = 0;

export type FamilyAlbumPhotoId = string;

export type FamilyAlbumPhoto = {
	id: FamilyAlbumPhotoId;
	image: Blob;
	mimeType: string;
	width: number;
	height: number;
	order: number;
	createdAt: number;
};

export type PreparedFamilyAlbumImage = {
	image: Blob;
	mimeType: string;
	width: number;
	height: number;
};

type PhotoStorage = {
	add(photo: FamilyAlbumPhoto): Promise<void>;
	list(): Promise<FamilyAlbumPhoto[]>;
	putAll(photos: readonly FamilyAlbumPhoto[]): Promise<void>;
	delete(id: FamilyAlbumPhotoId): Promise<void>;
};

type FamilyAlbumPhotoRepositoryOptions = {
	storage: PhotoStorage;
	prepareImage: (source: Blob) => Promise<PreparedFamilyAlbumImage>;
	createId?: () => FamilyAlbumPhotoId;
	now?: () => number;
};

type LoadedImage = {
	source: CanvasImageSource;
	width: number;
	height: number;
	close(): void;
};

export function getFamilyAlbumResizeDimensions(
	width: number,
	height: number,
	maxSide = PHOTO_MAX_SIDE_PX
) {
	if (width <= 0 || height <= 0 || maxSide <= 0) {
		throw new Error('Image dimensions must be positive.');
	}

	const scale = Math.min(1, maxSide / Math.max(width, height));

	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale)
	};
}

export function reorderFamilyAlbumPhotoRecords(
	photos: readonly FamilyAlbumPhoto[],
	orderedIds: readonly FamilyAlbumPhotoId[]
) {
	const photosById = new Map(photos.map((photo) => [photo.id, photo]));
	const seenIds = new Set<FamilyAlbumPhotoId>();

	for (const id of orderedIds) {
		if (seenIds.has(id)) {
			throw new Error('Photo order contains duplicate ids.');
		}

		if (!photosById.has(id)) {
			throw new Error('Photo order contains an unknown id.');
		}

		seenIds.add(id);
	}

	const orderedPhotos = [
		...orderedIds.map((id) => getKnownPhoto(photosById, id)),
		...sortFamilyAlbumPhotos(photos).filter((photo) => !seenIds.has(photo.id))
	];

	return orderedPhotos.map((photo, index) => ({ ...photo, order: REORDER_START + index }));
}

function getKnownPhoto(
	photosById: ReadonlyMap<FamilyAlbumPhotoId, FamilyAlbumPhoto>,
	id: FamilyAlbumPhotoId
) {
	const photo = photosById.get(id);

	if (!photo) {
		throw new Error('Photo order contains an unknown id.');
	}

	return photo;
}

export function createFamilyAlbumPhotoRepository({
	storage,
	prepareImage,
	createId = createFamilyAlbumPhotoId,
	now = Date.now
}: FamilyAlbumPhotoRepositoryOptions) {
	async function addPhoto(source: Blob) {
		const [preparedImage, photos] = await Promise.all([prepareImage(source), storage.list()]);
		const photo: FamilyAlbumPhoto = {
			id: createId(),
			image: preparedImage.image,
			mimeType: preparedImage.mimeType,
			width: preparedImage.width,
			height: preparedImage.height,
			order: getNextFamilyAlbumPhotoOrder(photos),
			createdAt: now()
		};

		await storage.add(photo);
		return photo;
	}

	async function listPhotos() {
		return sortFamilyAlbumPhotos(await storage.list());
	}

	async function reorderPhotos(orderedIds: readonly FamilyAlbumPhotoId[]) {
		const photos = await storage.list();
		await storage.putAll(reorderFamilyAlbumPhotoRecords(photos, orderedIds));
	}

	async function deletePhoto(id: FamilyAlbumPhotoId) {
		await storage.delete(id);
	}

	return { addPhoto, listPhotos, reorderPhotos, deletePhoto };
}

export function createIndexedDbFamilyAlbumPhotoStorage(
	getIndexedDB: () => IDBFactory = () => indexedDB
): PhotoStorage {
	async function openDatabase() {
		const factory = getIndexedDB();
		const request = factory.open(DATABASE_NAME, DATABASE_VERSION);

		request.onupgradeneeded = () => {
			const database = request.result;

			if (!database.objectStoreNames.contains(PHOTO_STORE_NAME)) {
				const store = database.createObjectStore(PHOTO_STORE_NAME, { keyPath: 'id' });
				store.createIndex(PHOTO_ORDER_INDEX_NAME, 'order');
			}
		};

		return requestToPromise(request);
	}

	async function withStore<T>(
		mode: IDBTransactionMode,
		callback: (store: IDBObjectStore) => Promise<T> | T
	) {
		const database = await openDatabase();

		try {
			const transaction = database.transaction(PHOTO_STORE_NAME, mode);
			const store = transaction.objectStore(PHOTO_STORE_NAME);
			const done = transactionDone(transaction);

			try {
				const result = await callback(store);

				await done;
				return result;
			} catch (error) {
				await done.catch(() => {});
				throw error;
			}
		} finally {
			database.close();
		}
	}

	return {
		add(photo) {
			return withStore('readwrite', async (store) => {
				await requestToPromise(store.add(photo));
			});
		},
		list() {
			return withStore('readonly', async (store) => {
				if (store.indexNames.contains(PHOTO_ORDER_INDEX_NAME)) {
					return requestToPromise<FamilyAlbumPhoto[]>(store.index(PHOTO_ORDER_INDEX_NAME).getAll());
				}

				return requestToPromise<FamilyAlbumPhoto[]>(store.getAll());
			});
		},
		putAll(photos) {
			return withStore('readwrite', (store) => {
				for (const photo of photos) {
					store.put(photo);
				}
			});
		},
		delete(id) {
			return withStore('readwrite', async (store) => {
				await requestToPromise(store.delete(id));
			});
		}
	};
}

export async function prepareFamilyAlbumPhotoImage(
	source: Blob
): Promise<PreparedFamilyAlbumImage> {
	const loadedImage = await loadImage(source);

	try {
		const dimensions = getFamilyAlbumResizeDimensions(loadedImage.width, loadedImage.height);
		const canvas = createCanvas(dimensions.width, dimensions.height);
		const context = getCanvasContext(canvas);

		context.drawImage(loadedImage.source, 0, 0, dimensions.width, dimensions.height);

		return {
			image: await canvasToBlob(canvas, 'image/jpeg', PHOTO_JPEG_QUALITY),
			mimeType: 'image/jpeg',
			width: dimensions.width,
			height: dimensions.height
		};
	} finally {
		loadedImage.close();
	}
}

let defaultRepository: ReturnType<typeof createFamilyAlbumPhotoRepository> | undefined;

export function getFamilyAlbumPhotoRepository() {
	defaultRepository ??= createFamilyAlbumPhotoRepository({
		storage: createIndexedDbFamilyAlbumPhotoStorage(),
		prepareImage: prepareFamilyAlbumPhotoImage
	});

	return defaultRepository;
}

export function addFamilyAlbumPhoto(source: Blob) {
	return getFamilyAlbumPhotoRepository().addPhoto(source);
}

export function listFamilyAlbumPhotos() {
	return getFamilyAlbumPhotoRepository().listPhotos();
}

export function reorderFamilyAlbumPhotos(orderedIds: readonly FamilyAlbumPhotoId[]) {
	return getFamilyAlbumPhotoRepository().reorderPhotos(orderedIds);
}

export function deleteFamilyAlbumPhoto(id: FamilyAlbumPhotoId) {
	return getFamilyAlbumPhotoRepository().deletePhoto(id);
}

function sortFamilyAlbumPhotos(photos: readonly FamilyAlbumPhoto[]) {
	return [...photos].sort((firstPhoto, secondPhoto) => {
		const orderDiff = firstPhoto.order - secondPhoto.order;

		if (orderDiff !== 0) {
			return orderDiff;
		}

		return firstPhoto.createdAt - secondPhoto.createdAt;
	});
}

function getNextFamilyAlbumPhotoOrder(photos: readonly FamilyAlbumPhoto[]) {
	if (photos.length === 0) {
		return REORDER_START;
	}

	return Math.max(...photos.map((photo) => photo.order)) + 1;
}

function createFamilyAlbumPhotoId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function requestToPromise<T>(request: IDBRequest<T>) {
	return new Promise<T>((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
	});
}

function transactionDone(transaction: IDBTransaction) {
	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
		transaction.onabort = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
	});
}

async function loadImage(source: Blob): Promise<LoadedImage> {
	if (typeof createImageBitmap === 'function') {
		const imageBitmap = await createImageBitmap(source);

		return {
			source: imageBitmap,
			width: imageBitmap.width,
			height: imageBitmap.height,
			close: () => imageBitmap.close()
		};
	}

	return loadHtmlImage(source);
}

async function loadHtmlImage(source: Blob): Promise<LoadedImage> {
	if (typeof Image === 'undefined' || typeof URL === 'undefined') {
		throw new Error('Image decoding is not available.');
	}

	const url = URL.createObjectURL(source);
	const image = new Image();

	try {
		image.src = url;

		if (typeof image.decode === 'function') {
			await image.decode();
		} else {
			await new Promise<void>((resolve, reject) => {
				image.onload = () => resolve();
				image.onerror = () => reject(new Error('Could not decode image.'));
			});
		}

		return {
			source: image,
			width: image.naturalWidth,
			height: image.naturalHeight,
			close: () => URL.revokeObjectURL(url)
		};
	} catch (error) {
		URL.revokeObjectURL(url);
		throw error;
	}
}

function createCanvas(width: number, height: number) {
	if (typeof OffscreenCanvas === 'function') {
		return new OffscreenCanvas(width, height);
	}

	if (typeof document === 'undefined') {
		throw new Error('Canvas is not available.');
	}

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

function getCanvasContext(canvas: HTMLCanvasElement | OffscreenCanvas) {
	const context =
		typeof OffscreenCanvas === 'function' && canvas instanceof OffscreenCanvas
			? canvas.getContext('2d')
			: (canvas as HTMLCanvasElement).getContext('2d');

	if (!context) {
		throw new Error('Canvas 2D context is not available.');
	}

	return context;
}

function canvasToBlob(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	mimeType: string,
	quality: number
) {
	if (typeof OffscreenCanvas === 'function' && canvas instanceof OffscreenCanvas) {
		return canvas.convertToBlob({ type: mimeType, quality });
	}

	const htmlCanvas = canvas as HTMLCanvasElement;

	return new Promise<Blob>((resolve, reject) => {
		htmlCanvas.toBlob(
			(blob: Blob | null) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error('Could not encode image.'));
				}
			},
			mimeType,
			quality
		);
	});
}
