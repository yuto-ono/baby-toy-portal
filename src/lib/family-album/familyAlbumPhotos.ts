const DATABASE_NAME = 'baby-toy-portal:family-album';
const DATABASE_VERSION = 1;
const PHOTO_STORE_NAME = 'photos';
const PHOTO_ORDER_INDEX_NAME = 'by-display-order';
const PHOTO_MAX_SIDE_PX = 1600;
const PHOTO_MIME_TYPE = 'image/jpeg';
const PHOTO_JPEG_QUALITY = 0.88;
const REORDER_START = 0;
const DEFAULT_PHOTO_NAME = '家族の写真';
export const FAMILY_ALBUM_PHOTO_NAME_MAX_LENGTH = 40;

export type FamilyAlbumPhotoId = string;

export type FamilyAlbumPhoto = {
	id: FamilyAlbumPhotoId;
	name: string;
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

export type StoredFamilyAlbumPhoto = Omit<FamilyAlbumPhoto, 'image' | 'name'> & {
	image?: Blob;
	imageData?: ArrayBuffer;
	name?: string;
};

export type FamilyAlbumPhotoRecordNormalizationIssueReason = 'missing-image' | 'restore-failed';

export type FamilyAlbumPhotoRecordNormalizationIssue = {
	id: FamilyAlbumPhotoId;
	reason: FamilyAlbumPhotoRecordNormalizationIssueReason;
	error: unknown;
};

export type FamilyAlbumPhotoRecordNormalizationResult = {
	photos: FamilyAlbumPhoto[];
	issues: FamilyAlbumPhotoRecordNormalizationIssue[];
};

type PhotoStorage = {
	add(photo: FamilyAlbumPhoto): Promise<void>;
	list(): Promise<FamilyAlbumPhoto[]>;
	listWithIssues(): Promise<FamilyAlbumPhotoRecordNormalizationResult>;
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

export function normalizeFamilyAlbumPhotoName(name: string, fallback = DEFAULT_PHOTO_NAME) {
	const normalizedName = name.trim().replace(/\s+/g, ' ');

	if (!normalizedName) {
		return fallback;
	}

	return normalizedName.slice(0, FAMILY_ALBUM_PHOTO_NAME_MAX_LENGTH);
}

export function getFamilyAlbumPhotoNameFromFileName(fileName: string) {
	const nameWithoutExtension = fileName.replace(/\.[^.]+$/, '');

	return normalizeFamilyAlbumPhotoName(nameWithoutExtension);
}

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
	async function addPhoto(source: Blob, name = DEFAULT_PHOTO_NAME) {
		const [preparedImage, photos] = await Promise.all([prepareImage(source), storage.list()]);
		const photo: FamilyAlbumPhoto = {
			id: createId(),
			name: normalizeFamilyAlbumPhotoName(name),
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

	async function listPhotoRecordsWithIssues() {
		const result = await storage.listWithIssues();

		return {
			photos: sortFamilyAlbumPhotos(result.photos),
			issues: result.issues
		};
	}

	async function reorderPhotos(orderedIds: readonly FamilyAlbumPhotoId[]) {
		const photos = await storage.list();
		await storage.putAll(reorderFamilyAlbumPhotoRecords(photos, orderedIds));
	}

	async function updatePhotoName(id: FamilyAlbumPhotoId, name: string) {
		const photos = await storage.list();
		const photo = photos.find((currentPhoto) => currentPhoto.id === id);

		if (!photo) {
			throw new Error('Photo was not found.');
		}

		await storage.putAll([{ ...photo, name: normalizeFamilyAlbumPhotoName(name, photo.name) }]);
	}

	async function deletePhoto(id: FamilyAlbumPhotoId) {
		await storage.delete(id);
	}

	return {
		addPhoto,
		listPhotos,
		listPhotoRecordsWithIssues,
		reorderPhotos,
		updatePhotoName,
		deletePhoto
	};
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

	async function readStoredPhotos(store: IDBObjectStore) {
		if (store.indexNames.contains(PHOTO_ORDER_INDEX_NAME)) {
			return requestToPromise<StoredFamilyAlbumPhoto[]>(
				store.index(PHOTO_ORDER_INDEX_NAME).getAll()
			);
		}

		return requestToPromise<StoredFamilyAlbumPhoto[]>(store.getAll());
	}

	async function listWithIssues() {
		return withStore('readonly', async (store) => {
			const photos = await readStoredPhotos(store);

			return normalizeFamilyAlbumPhotoRecordsWithIssues(photos);
		});
	}

	return {
		async add(photo) {
			const storedPhoto = await serializeFamilyAlbumPhotoRecord(photo);

			return withStore('readwrite', async (store) => {
				await requestToPromise(store.add(storedPhoto));
			});
		},
		async list() {
			const result = await listWithIssues();

			return result.photos;
		},
		listWithIssues,
		async putAll(photos) {
			const storedPhotos = await Promise.all(photos.map(serializeFamilyAlbumPhotoRecord));

			return withStore('readwrite', (store) => {
				for (const photo of storedPhotos) {
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
			image: await canvasToBlob(canvas, PHOTO_MIME_TYPE, PHOTO_JPEG_QUALITY),
			mimeType: PHOTO_MIME_TYPE,
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

export function addNamedFamilyAlbumPhoto(source: Blob, name: string) {
	return getFamilyAlbumPhotoRepository().addPhoto(source, name);
}

export function listFamilyAlbumPhotos() {
	return getFamilyAlbumPhotoRepository().listPhotos();
}

export function listFamilyAlbumPhotosWithIssues() {
	return getFamilyAlbumPhotoRepository().listPhotoRecordsWithIssues();
}

export function reorderFamilyAlbumPhotos(orderedIds: readonly FamilyAlbumPhotoId[]) {
	return getFamilyAlbumPhotoRepository().reorderPhotos(orderedIds);
}

export function updateFamilyAlbumPhotoName(id: FamilyAlbumPhotoId, name: string) {
	return getFamilyAlbumPhotoRepository().updatePhotoName(id, name);
}

export function deleteFamilyAlbumPhoto(id: FamilyAlbumPhotoId) {
	return getFamilyAlbumPhotoRepository().deletePhoto(id);
}

async function serializeFamilyAlbumPhotoRecord(
	photo: FamilyAlbumPhoto
): Promise<StoredFamilyAlbumPhoto> {
	const { image, name, ...storedPhoto } = photo;

	return {
		...storedPhoto,
		imageData: await blobToArrayBuffer(image),
		name
	};
}

export async function normalizeFamilyAlbumPhotoRecords(photos: readonly StoredFamilyAlbumPhoto[]) {
	const result = await normalizeFamilyAlbumPhotoRecordsWithIssues(photos);

	return result.photos;
}

export async function normalizeFamilyAlbumPhotoRecordsWithIssues(
	photos: readonly StoredFamilyAlbumPhoto[]
): Promise<FamilyAlbumPhotoRecordNormalizationResult> {
	// NOTE: 壊れたレコードは自動削除せず、クリーンアップ UI 用に情報を残す。
	// 一覧読み込みでは、正常に復元できた写真だけを返す。
	const settledPhotos = await Promise.allSettled(photos.map(normalizeFamilyAlbumPhotoRecord));
	const normalizedPhotos: FamilyAlbumPhoto[] = [];
	const issues: FamilyAlbumPhotoRecordNormalizationIssue[] = [];

	for (const [index, settledPhoto] of settledPhotos.entries()) {
		if (settledPhoto.status === 'fulfilled') {
			normalizedPhotos.push(settledPhoto.value);
			continue;
		}

		issues.push({
			id: photos[index].id,
			reason: getFamilyAlbumPhotoRecordNormalizationIssueReason(settledPhoto.reason),
			error: settledPhoto.reason
		});
	}

	return { photos: normalizedPhotos, issues };
}

async function normalizeFamilyAlbumPhotoRecord(
	photo: StoredFamilyAlbumPhoto
): Promise<FamilyAlbumPhoto> {
	const mimeType = getStoredFamilyAlbumPhotoMimeType(photo);

	return {
		id: photo.id,
		name: normalizeFamilyAlbumPhotoName(photo.name ?? DEFAULT_PHOTO_NAME),
		image: await createStoredFamilyAlbumPhotoBlob(photo, mimeType),
		mimeType,
		width: photo.width,
		height: photo.height,
		order: photo.order,
		createdAt: photo.createdAt
	};
}

function getStoredFamilyAlbumPhotoMimeType(photo: StoredFamilyAlbumPhoto) {
	return photo.mimeType || photo.image?.type || PHOTO_MIME_TYPE;
}

function getFamilyAlbumPhotoRecordNormalizationIssueReason(
	error: unknown
): FamilyAlbumPhotoRecordNormalizationIssueReason {
	if (error instanceof StoredFamilyAlbumPhotoImageMissingError) {
		return 'missing-image';
	}

	return 'restore-failed';
}

class StoredFamilyAlbumPhotoImageMissingError extends Error {
	constructor() {
		super('Stored photo image is missing.');
		this.name = 'StoredFamilyAlbumPhotoImageMissingError';
	}
}

async function createStoredFamilyAlbumPhotoBlob(photo: StoredFamilyAlbumPhoto, mimeType: string) {
	if (photo.imageData) {
		return new Blob([photo.imageData], { type: mimeType });
	}

	if (photo.image) {
		try {
			return new Blob([await blobToArrayBuffer(photo.image)], { type: mimeType });
		} catch {
			return photo.image;
		}
	}

	throw new StoredFamilyAlbumPhotoImageMissingError();
}

function blobToArrayBuffer(blob: Blob) {
	if (typeof blob.arrayBuffer === 'function') {
		return blob.arrayBuffer();
	}

	if (typeof FileReader === 'undefined') {
		throw new Error('Blob reading is not available.');
	}

	return new Promise<ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (reader.result instanceof ArrayBuffer) {
				resolve(reader.result);
				return;
			}

			reject(new Error('Could not read image data.'));
		};
		reader.onerror = () => reject(reader.error ?? new Error('Could not read image data.'));
		reader.onabort = () => reject(new Error('Image data reading was aborted.'));
		reader.readAsArrayBuffer(blob);
	});
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
