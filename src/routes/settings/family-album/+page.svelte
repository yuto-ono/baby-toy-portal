<script lang="ts">
	import { onMount } from 'svelte';
	import { PageNavigation } from '$lib';
	import {
		addNamedFamilyAlbumPhoto,
		deleteFamilyAlbumPhoto,
		getFamilyAlbumPhotoNameFromFileName,
		listFamilyAlbumPhotosWithIssues,
		reorderFamilyAlbumPhotos,
		reorderFamilyAlbumPhotoRecords,
		type FamilyAlbumPhotoRecordNormalizationIssue,
		updateFamilyAlbumPhotoName,
		type FamilyAlbumPhoto,
		type FamilyAlbumPhotoId
	} from '$lib/family-album/familyAlbumPhotos';
	import FamilyAlbumCleanupPanel from './FamilyAlbumCleanupPanel.svelte';
	import FamilyAlbumPhotoDetailDialog from './FamilyAlbumPhotoDetailDialog.svelte';
	import FamilyAlbumPhotoGrid from './FamilyAlbumPhotoGrid.svelte';
	import FamilyAlbumReloadButton from './FamilyAlbumReloadButton.svelte';
	import FamilyAlbumUploadPanel from './FamilyAlbumUploadPanel.svelte';
	import {
		moveFamilyAlbumPhotoId,
		moveFamilyAlbumPhotoIdToEdge,
		type FamilyAlbumPhotoMoveEdge,
		type FamilyAlbumPhotoMoveDirection
	} from './familyAlbumPhotoOrder';
	import {
		getAvailableFamilyAlbumPhotoId,
		getFamilyAlbumPhotoIdsWithAddedFirst,
		getFamilyAlbumSettingsStatusMessage,
		removeFamilyAlbumPhotoFromList,
		renameFamilyAlbumPhotoInList,
		type FamilyAlbumSettingsLoadState
	} from './familyAlbumSettingsState';

	let photos = $state<FamilyAlbumPhoto[]>([]);
	let photoRecordIssues = $state<FamilyAlbumPhotoRecordNormalizationIssue[]>([]);
	let loadState = $state<FamilyAlbumSettingsLoadState>('loading');
	let isWorking = $state(false);
	let errorMessage = $state('');
	let canRetryReload = $state(false);
	let selectedPhotoId = $state<FamilyAlbumPhotoId>();

	const isBusy = $derived(loadState === 'loading' || isWorking);
	const selectedAvailablePhotoId = $derived(
		getAvailableFamilyAlbumPhotoId(selectedPhotoId, photos)
	);
	const selectedPhoto = $derived(photos.find((photo) => photo.id === selectedAvailablePhotoId));
	const selectedPhotoIndex = $derived(
		selectedAvailablePhotoId
			? photos.findIndex((photo) => photo.id === selectedAvailablePhotoId)
			: -1
	);
	const statusMessage = $derived(
		getFamilyAlbumSettingsStatusMessage({ loadState, isWorking, errorMessage })
	);

	onMount(() => {
		void loadPhotos();
	});

	async function loadPhotos(): Promise<void> {
		loadState = 'loading';
		errorMessage = '';
		canRetryReload = false;

		try {
			await refreshPhotosWithIssues();
			loadState = 'ready';
		} catch {
			loadState = 'error';
			errorMessage = '写真を読み込めませんでした。もう一度お試しください。';
		}
	}

	async function addPhotos(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFiles = Array.from(input.files ?? []).filter((file) =>
			file.type.startsWith('image/')
		);

		if (selectedFiles.length === 0) {
			errorMessage = '画像ファイルを選択してください。';
			return;
		}

		isWorking = true;
		errorMessage = '';
		canRetryReload = false;

		try {
			const addedPhotoIds: FamilyAlbumPhotoId[] = [];

			for (const file of selectedFiles) {
				const addedPhoto = await addNamedFamilyAlbumPhoto(
					file,
					getFamilyAlbumPhotoNameFromFileName(file.name)
				);
				addedPhotoIds.push(addedPhoto.id);
			}

			await moveAddedPhotosToFront(addedPhotoIds);
			await refreshPhotosWithIssues();
			loadState = 'ready';
		} catch {
			try {
				await refreshPhotosWithIssues();
				loadState = 'ready';
				errorMessage = '一部の写真を追加できませんでした。画像ファイルを確認してください。';
			} catch {
				loadState = 'error';
				errorMessage = '写真を追加したあと、一覧を読み込めませんでした。もう一度お試しください。';
			}
		} finally {
			isWorking = false;
			input.value = '';
		}
	}

	async function moveAddedPhotosToFront(
		addedPhotoIds: readonly FamilyAlbumPhotoId[]
	): Promise<void> {
		if (addedPhotoIds.length === 0) return;

		await reorderFamilyAlbumPhotos(
			getFamilyAlbumPhotoIdsWithAddedFirst(
				photos.map((photo) => photo.id),
				addedPhotoIds
			)
		);
	}

	async function removeBrokenPhotoRecords(): Promise<void> {
		const issuesToDelete = [...photoRecordIssues];

		if (issuesToDelete.length === 0) return;

		const confirmed = confirm(
			`${issuesToDelete.length}件の壊れた写真レコードを削除しますか？正常な写真は削除されません。`
		);

		if (!confirmed) return;

		isWorking = true;
		errorMessage = '';
		canRetryReload = false;

		const deletedIds: FamilyAlbumPhotoId[] = [];

		try {
			for (const issue of issuesToDelete) {
				await deleteFamilyAlbumPhoto(issue.id);
				deletedIds.push(issue.id);
			}

			photoRecordIssues = photoRecordIssues.filter((issue) => !deletedIds.includes(issue.id));
			await reloadPhotosAfterSuccessfulSave(
				'壊れた写真レコードを削除しましたが、最新の一覧を読み込めませんでした。もう一度読み込んで確認してください。'
			);
		} catch {
			photoRecordIssues = photoRecordIssues.filter((issue) => !deletedIds.includes(issue.id));

			try {
				await refreshPhotosWithIssues();
				loadState = 'ready';
				errorMessage = '一部の壊れた写真レコードを削除できませんでした。もう一度お試しください。';
			} catch {
				loadState = 'ready';
				errorMessage =
					'一部の壊れた写真レコードを削除できませんでした。最新の一覧も読み込めませんでした。もう一度読み込んで確認してください。';
				canRetryReload = true;
			}
		} finally {
			isWorking = false;
		}
	}

	async function renamePhoto(id: FamilyAlbumPhotoId, name: string): Promise<void> {
		isWorking = true;
		errorMessage = '';
		canRetryReload = false;

		try {
			const saved = await savePhotoChange(
				() => updateFamilyAlbumPhotoName(id, name),
				'写真の名前を保存できませんでした。'
			);

			if (!saved) return;

			photos = renameFamilyAlbumPhotoInList(photos, id, name);
			await reloadPhotosAfterSuccessfulSave(
				'写真の名前を保存しましたが、最新の一覧を読み込めませんでした。もう一度読み込んで確認してください。'
			);
		} finally {
			isWorking = false;
		}
	}

	async function movePhoto(
		id: FamilyAlbumPhotoId,
		direction: FamilyAlbumPhotoMoveDirection
	): Promise<void> {
		const orderedIds = moveFamilyAlbumPhotoId(
			photos.map((photo) => photo.id),
			id,
			direction
		);

		await savePhotoOrder(orderedIds);
	}

	async function movePhotoToEdge(
		id: FamilyAlbumPhotoId,
		edge: FamilyAlbumPhotoMoveEdge
	): Promise<void> {
		const orderedIds = moveFamilyAlbumPhotoIdToEdge(
			photos.map((photo) => photo.id),
			id,
			edge
		);

		await savePhotoOrder(orderedIds);
	}

	async function savePhotoOrder(orderedIds: readonly FamilyAlbumPhotoId[]): Promise<void> {
		if (orderedIds.every((orderedId, index) => orderedId === photos[index]?.id)) return;

		isWorking = true;
		errorMessage = '';
		canRetryReload = false;

		try {
			const saved = await savePhotoChange(
				() => reorderFamilyAlbumPhotos(orderedIds),
				'写真の並び順を保存できませんでした。'
			);

			if (!saved) return;

			photos = reorderFamilyAlbumPhotoRecords(photos, orderedIds);
			await reloadPhotosAfterSuccessfulSave(
				'写真の並び順を保存しましたが、最新の一覧を読み込めませんでした。もう一度読み込んで確認してください。'
			);
		} finally {
			isWorking = false;
		}
	}

	async function removePhoto(id: FamilyAlbumPhotoId): Promise<void> {
		const photo = photos.find((currentPhoto) => currentPhoto.id === id);
		const confirmed = confirm(`${photo?.name ?? 'この写真'}を削除しますか？`);

		if (!confirmed) return;

		isWorking = true;
		errorMessage = '';
		canRetryReload = false;

		try {
			const saved = await savePhotoChange(
				() => deleteFamilyAlbumPhoto(id),
				'写真を削除できませんでした。'
			);

			if (!saved) return;

			photos = removeFamilyAlbumPhotoFromList(photos, id);
			await reloadPhotosAfterSuccessfulSave(
				'写真を削除しましたが、最新の一覧を読み込めませんでした。もう一度読み込んで確認してください。'
			);
		} finally {
			isWorking = false;
		}
	}

	async function refreshPhotosWithIssues(): Promise<void> {
		const result = await listFamilyAlbumPhotosWithIssues();

		photos = result.photos;
		photoRecordIssues = result.issues;
	}

	async function savePhotoChange(save: () => Promise<void>, saveErrorMessage: string) {
		try {
			await save();
			return true;
		} catch {
			errorMessage = saveErrorMessage;
			return false;
		}
	}

	async function reloadPhotosAfterSuccessfulSave(reloadErrorMessage: string): Promise<void> {
		try {
			await refreshPhotosWithIssues();
			loadState = 'ready';
			canRetryReload = false;
		} catch {
			loadState = 'ready';
			errorMessage = reloadErrorMessage;
			canRetryReload = true;
		}
	}
</script>

<svelte:head>
	<title>家族アルバム | Baby Toy Portal</title>
	<meta name="description" content="家族アルバムに表示する写真を管理します。" />
</svelte:head>

<main>
	<PageNavigation title="家族アルバム" backHref="/settings" backLabel="設定" />

	<div class="content">
		<FamilyAlbumUploadPanel {isBusy} {isWorking} onAddPhotos={addPhotos} />

		{#if statusMessage || canRetryReload}
			<div class="status-row" aria-live="polite">
				{#if statusMessage}
					<p class="status">{statusMessage}</p>
				{/if}
				{#if canRetryReload}
					<FamilyAlbumReloadButton compact disabled={isBusy} onReload={loadPhotos} />
				{/if}
			</div>
		{/if}

		{#if loadState === 'ready' && photoRecordIssues.length > 0}
			<FamilyAlbumCleanupPanel
				issues={photoRecordIssues}
				disabled={isBusy}
				onCleanup={removeBrokenPhotoRecords}
			/>
		{/if}

		{#if loadState === 'error'}
			<section class="empty-state" aria-labelledby="family-album-error-title">
				<h2 id="family-album-error-title">読み込めませんでした</h2>
				<p>写真の保存状態を確認できませんでした。</p>
				<FamilyAlbumReloadButton disabled={isBusy} onReload={loadPhotos} />
			</section>
		{:else if loadState === 'ready' && photos.length === 0}
			<section class="empty-state" aria-labelledby="family-album-empty-title">
				<h2 id="family-album-empty-title">写真はまだありません</h2>
				<p>上のボタンから、アルバムに表示する写真を追加できます。</p>
			</section>
		{:else if photos.length > 0}
			<FamilyAlbumPhotoGrid
				{photos}
				selectedPhotoId={selectedAvailablePhotoId}
				disabled={isBusy}
				onSelect={(id) => (selectedPhotoId = id)}
			/>
		{/if}
	</div>

	{#if selectedPhoto && selectedPhotoIndex >= 0}
		<FamilyAlbumPhotoDetailDialog
			photo={selectedPhoto}
			positionLabel={`${selectedPhotoIndex + 1}枚目`}
			canMoveUp={selectedPhotoIndex > 0}
			canMoveDown={selectedPhotoIndex < photos.length - 1}
			disabled={isBusy}
			onClose={() => (selectedPhotoId = undefined)}
			onRename={renamePhoto}
			onMoveFirst={(id) => movePhotoToEdge(id, 'first')}
			onMovePrevious={(id) => movePhoto(id, -1)}
			onMoveNext={(id) => movePhoto(id, 1)}
			onMoveLast={(id) => movePhotoToEdge(id, 'last')}
			onDelete={removePhoto}
		/>
	{/if}
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$muted: #666274;
	$accent-yellow: #ffe272;

	main {
		min-height: 100dvh;
		padding-bottom: 2rem;
		background:
			radial-gradient(circle at 12% 82%, #ffd86f 0 4.5rem, transparent 4.6rem),
			radial-gradient(circle at 88% 28%, #8edbd3 0 6rem, transparent 6.1rem), $page-background;
	}

	.content {
		width: min(calc(100% - 3rem), 56rem);
		margin: clamp(1.5rem, 5vw, 3rem) auto 0;
	}

	.empty-state {
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
	}

	h2 {
		margin: 0.25rem 0 0;
		font-size: clamp(1.35rem, 4vw, 1.9rem);
		line-height: 1.25;
	}

	.status-row {
		display: flex;
		min-height: 1.4em;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		margin: 1rem 0;
	}

	.status {
		margin: 0;
		color: $muted;
		font-weight: 800;
		line-height: 1.4;
	}

	.empty-state {
		margin-top: 1.5rem;
		padding: clamp(1.5rem, 5vw, 2.5rem);
		text-align: center;
		box-shadow: 6px 6px 0 $accent-yellow;

		p {
			margin: 0.65rem 0 0;
			color: $muted;
			font-weight: 700;
			line-height: 1.6;
		}
	}

	@media (max-width: 620px) {
		.content {
			width: min(calc(100% - 1.5rem), 56rem);
		}

		.status-row {
			align-items: stretch;
			flex-direction: column;
		}
	}
</style>
