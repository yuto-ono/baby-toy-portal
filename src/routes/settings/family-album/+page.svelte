<script lang="ts">
	import { onMount } from 'svelte';
	import { PageNavigation } from '$lib';
	import {
		addNamedFamilyAlbumPhoto,
		deleteFamilyAlbumPhoto,
		getFamilyAlbumPhotoNameFromFileName,
		listFamilyAlbumPhotos,
		normalizeFamilyAlbumPhotoName,
		reorderFamilyAlbumPhotos,
		reorderFamilyAlbumPhotoRecords,
		updateFamilyAlbumPhotoName,
		type FamilyAlbumPhoto,
		type FamilyAlbumPhotoId
	} from '$lib/family-album/familyAlbumPhotos';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import FamilyAlbumPhotoCard from './FamilyAlbumPhotoCard.svelte';
	import FamilyAlbumReloadButton from './FamilyAlbumReloadButton.svelte';
	import {
		moveFamilyAlbumPhotoId,
		type FamilyAlbumPhotoMoveDirection
	} from './familyAlbumPhotoOrder';

	type LoadState = 'loading' | 'ready' | 'error';

	let photos = $state<FamilyAlbumPhoto[]>([]);
	let loadState = $state<LoadState>('loading');
	let isWorking = $state(false);
	let errorMessage = $state('');
	let canRetryReload = $state(false);

	const isBusy = $derived(loadState === 'loading' || isWorking);
	const statusMessage = $derived.by(() => {
		if (loadState === 'loading') return '写真を読み込んでいます。';
		if (isWorking) return '保存しています。';

		return errorMessage;
	});

	onMount(() => {
		void loadPhotos();
	});

	async function loadPhotos(): Promise<void> {
		loadState = 'loading';
		errorMessage = '';
		canRetryReload = false;

		try {
			photos = await listFamilyAlbumPhotos();
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
			for (const file of selectedFiles) {
				await addNamedFamilyAlbumPhoto(file, getFamilyAlbumPhotoNameFromFileName(file.name));
			}

			photos = await listFamilyAlbumPhotos();
			loadState = 'ready';
		} catch {
			try {
				photos = await listFamilyAlbumPhotos();
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

			photos = photos.map((photo) =>
				photo.id === id
					? { ...photo, name: normalizeFamilyAlbumPhotoName(name, photo.name) }
					: photo
			);
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

			photos = photos.filter((currentPhoto) => currentPhoto.id !== id);
			await reloadPhotosAfterSuccessfulSave(
				'写真を削除しましたが、最新の一覧を読み込めませんでした。もう一度読み込んで確認してください。'
			);
		} finally {
			isWorking = false;
		}
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
			photos = await listFamilyAlbumPhotos();
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
		<section class="upload-panel" aria-labelledby="family-album-upload-title">
			<div>
				<p class="eyebrow">写真管理</p>
				<h2 id="family-album-upload-title">アルバムの写真</h2>
			</div>

			<input
				id="family-album-files"
				type="file"
				accept="image/*"
				multiple
				disabled={isBusy}
				onchange={addPhotos}
			/>
			<label class="upload-button" class:disabled={isBusy} for="family-album-files">
				<ImagePlus size={24} strokeWidth={2.8} aria-hidden="true" />
				<span>{isWorking ? '保存中…' : '写真を追加'}</span>
			</label>
		</section>

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
			<div class="photo-list" aria-label="登録済み写真">
				{#each photos as photo, index (photo.id)}
					<FamilyAlbumPhotoCard
						{photo}
						positionLabel={`${index + 1}枚目`}
						canMoveUp={index > 0}
						canMoveDown={index < photos.length - 1}
						disabled={isBusy}
						onRename={renamePhoto}
						onMoveUp={(id) => movePhoto(id, -1)}
						onMoveDown={(id) => movePhoto(id, 1)}
						onDelete={removePhoto}
					/>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style lang="scss">
	$ink: #333145;
	$page-background: #fff8e7;
	$muted: #666274;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

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

	.upload-panel,
	.empty-state {
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
	}

	.upload-panel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 1.25rem;
		box-shadow: 6px 6px 0 $accent-pink;
	}

	.eyebrow {
		margin: 0;
		color: #c84c5a;
		font-size: 0.85rem;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	h2 {
		margin: 0.25rem 0 0;
		font-size: clamp(1.35rem, 4vw, 1.9rem);
		line-height: 1.25;
	}

	input[type='file'] {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.upload-button {
		display: inline-flex;
		min-height: 3.4rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.65rem 1.1rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-mint;
		color: $ink;
		font: inherit;
		font-size: 1rem;
		font-weight: 800;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;

		&:focus-visible {
			outline: 4px solid $accent-yellow;
			outline-offset: 3px;
		}
	}

	.upload-button.disabled {
		cursor: wait;
		opacity: 0.6;
	}

	input[type='file']:focus-visible + .upload-button {
		outline: 4px solid $accent-yellow;
		outline-offset: 3px;
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

	.photo-list {
		display: grid;
		margin-top: 1.5rem;
		gap: 1rem;
	}

	@media (max-width: 620px) {
		.content {
			width: min(calc(100% - 1.5rem), 56rem);
		}

		.upload-panel {
			align-items: stretch;
			flex-direction: column;
		}

		.upload-button {
			width: 100%;
		}

		.status-row {
			align-items: stretch;
			flex-direction: column;
		}
	}
</style>
