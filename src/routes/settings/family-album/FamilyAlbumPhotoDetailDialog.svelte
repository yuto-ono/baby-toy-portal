<script lang="ts">
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import MoveLeft from '@lucide/svelte/icons/move-left';
	import MoveRight from '@lucide/svelte/icons/move-right';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';
	import type { FamilyAlbumPhoto, FamilyAlbumPhotoId } from '$lib/family-album/familyAlbumPhotos';
	import FamilyAlbumPhotoThumbnail from './FamilyAlbumPhotoThumbnail.svelte';

	let {
		photo,
		positionLabel,
		canMoveUp,
		canMoveDown,
		disabled,
		onClose,
		onRename,
		onMoveFirst,
		onMovePrevious,
		onMoveNext,
		onMoveLast,
		onDelete
	}: {
		photo: FamilyAlbumPhoto;
		positionLabel: string;
		canMoveUp: boolean;
		canMoveDown: boolean;
		disabled: boolean;
		onClose: () => void;
		onRename: (id: FamilyAlbumPhotoId, name: string) => Promise<void>;
		onMoveFirst: (id: FamilyAlbumPhotoId) => Promise<void>;
		onMovePrevious: (id: FamilyAlbumPhotoId) => Promise<void>;
		onMoveNext: (id: FamilyAlbumPhotoId) => Promise<void>;
		onMoveLast: (id: FamilyAlbumPhotoId) => Promise<void>;
		onDelete: (id: FamilyAlbumPhotoId) => Promise<void>;
	} = $props();

	let draftName = $derived(photo.name);
	let dialogElement = $state<HTMLDialogElement>();
	let isUnmounting = false;

	const canSaveName = $derived(
		!disabled && draftName.trim().length > 0 && draftName !== photo.name
	);

	onMount(() => {
		dialogElement?.showModal();

		return () => {
			isUnmounting = true;

			if (dialogElement?.open) {
				dialogElement.close();
			}
		};
	});

	async function saveName(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		if (!canSaveName) return;

		await onRename(photo.id, draftName);
	}

	function closeOnNativeClose(): void {
		if (isUnmounting) return;

		onClose();
	}

	function keepOpenWhileDisabled(event: Event): void {
		if (!disabled) return;

		event.preventDefault();
	}

	function requestClose(): void {
		if (disabled) return;

		dialogElement?.close();
	}
</script>

<dialog
	bind:this={dialogElement}
	class="dialog"
	aria-labelledby="photo-detail-title"
	oncancel={keepOpenWhileDisabled}
	onclose={closeOnNativeClose}
>
	<button
		class="backdrop-close"
		type="button"
		{disabled}
		tabindex="-1"
		aria-label="閉じる"
		onclick={requestClose}
	></button>

	<div class="dialog-panel">
		<div class="dialog-header">
			<div>
				<p class="position">{positionLabel}</p>
				<h2 id="photo-detail-title">写真の詳細</h2>
			</div>
			<button
				class="icon-button"
				type="button"
				{disabled}
				aria-label="閉じる"
				onclick={requestClose}
			>
				<X size={24} strokeWidth={2.8} aria-hidden="true" />
			</button>
		</div>

		<div class="preview">
			<FamilyAlbumPhotoThumbnail {photo} fit="contain" />
		</div>

		<form onsubmit={saveName}>
			<label for={`photo-name-${photo.id}`}>写真の名前</label>
			<div class="name-row">
				<input
					id={`photo-name-${photo.id}`}
					type="text"
					bind:value={draftName}
					maxlength="40"
					{disabled}
					autocomplete="off"
				/>
				<button class="save-button" type="submit" disabled={!canSaveName}>
					<Save size={20} strokeWidth={2.7} aria-hidden="true" />
					<span>保存</span>
				</button>
			</div>
		</form>

		<div class="action-groups">
			<div class="order-actions">
				<p id={`photo-order-actions-${photo.id}`}>並び順を変える</p>
				<div class="order-buttons" aria-labelledby={`photo-order-actions-${photo.id}`}>
					<button
						type="button"
						disabled={disabled || !canMoveUp}
						onclick={() => onMoveFirst(photo.id)}
					>
						<ChevronsLeft size={22} strokeWidth={2.8} aria-hidden="true" />
						<span>先頭へ移動</span>
					</button>
					<button
						type="button"
						disabled={disabled || !canMoveUp}
						onclick={() => onMovePrevious(photo.id)}
					>
						<MoveLeft size={22} strokeWidth={2.8} aria-hidden="true" />
						<span>前へ移動</span>
					</button>
					<button
						type="button"
						disabled={disabled || !canMoveDown}
						onclick={() => onMoveNext(photo.id)}
					>
						<MoveRight size={22} strokeWidth={2.8} aria-hidden="true" />
						<span>後へ移動</span>
					</button>
					<button
						type="button"
						disabled={disabled || !canMoveDown}
						onclick={() => onMoveLast(photo.id)}
					>
						<ChevronsRight size={22} strokeWidth={2.8} aria-hidden="true" />
						<span>末尾へ移動</span>
					</button>
				</div>
			</div>
			<button class="delete-button" type="button" {disabled} onclick={() => onDelete(photo.id)}>
				<Trash2 size={22} strokeWidth={2.8} aria-hidden="true" />
				<span>削除</span>
			</button>
		</div>
	</div>
</dialog>

<style lang="scss">
	$ink: #333145;
	$muted: #666274;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;
	$danger: #df5b69;

	.dialog {
		position: fixed;
		inset: 0;
		display: grid;
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		margin: 0;
		overflow: hidden;
		place-items: center;
		padding: 1rem;
		border: 0;
		background: transparent;
	}

	.dialog:not([open]) {
		display: none;
	}

	.dialog::backdrop {
		background: rgba($ink, 0.42);
	}

	.backdrop-close {
		position: absolute;
		z-index: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		cursor: default;
	}

	.dialog-panel {
		position: relative;
		z-index: 1;
		display: grid;
		width: min(100%, 34rem);
		max-height: min(42rem, calc(100dvh - 2rem));
		overflow: auto;
		gap: 1rem;
		padding: clamp(1rem, 4vw, 1.25rem);
		border: 3px solid $ink;
		border-radius: 1.25rem;
		background: #fff;
		box-shadow: 7px 7px 0 $accent-yellow;
	}

	.dialog-header {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.position {
		margin: 0;
		color: $muted;
		font-size: 0.9rem;
		font-weight: 800;
	}

	h2 {
		margin: 0.25rem 0 0;
		font-size: 1.55rem;
		line-height: 1.25;
	}

	.preview {
		height: clamp(11rem, 32dvh, 18rem);
		overflow: hidden;
		border: 2px solid $ink;
		border-radius: 1rem;
		background: #f4efe4;
	}

	form {
		min-width: 0;
	}

	label {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.9rem;
		font-weight: 800;
	}

	.name-row {
		display: flex;
		gap: 0.6rem;
	}

	input {
		width: 100%;
		min-width: 0;
		min-height: 3rem;
		padding: 0.55rem 0.75rem;
		border: 2px solid $ink;
		border-radius: 0.9rem;
		color: $ink;
		font: inherit;
		font-weight: 700;

		&:focus {
			outline: 4px solid $accent-mint;
			outline-offset: 2px;
		}
	}

	button {
		display: inline-flex;
		min-height: 3rem;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.55rem 0.85rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-mint;
		color: $ink;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 800;
		white-space: nowrap;
		cursor: pointer;

		&:disabled {
			cursor: not-allowed;
			opacity: 0.45;
		}

		&:focus-visible {
			outline: 4px solid $accent-yellow;
			outline-offset: 3px;
		}
	}

	.icon-button {
		width: 3rem;
		padding: 0;
		background: #fff;
	}

	.save-button {
		flex: 0 0 auto;
		background: $accent-yellow;
	}

	.action-groups {
		display: grid;
		gap: 0.85rem;
	}

	.order-actions {
		display: grid;
		gap: 0.45rem;

		p {
			margin: 0;
			color: $muted;
			font-size: 0.9rem;
			font-weight: 800;
		}
	}

	.order-buttons {
		display: grid;
		gap: 0.55rem;
		grid-template-columns: repeat(4, minmax(0, 1fr));

		button {
			width: 100%;
		}
	}

	.delete-button {
		background: #fff;
		color: $danger;
	}

	@media (max-width: 520px) {
		.dialog {
			place-items: end center;
			padding: 0.75rem;
		}

		.dialog-panel {
			max-height: calc(100dvh - 1.5rem);
		}

		.preview {
			height: clamp(9rem, 24dvh, 13rem);
		}

		.name-row,
		.order-buttons {
			grid-template-columns: 1fr;
		}

		.name-row {
			flex-direction: column;
		}

		.save-button {
			width: 100%;
		}
	}
</style>
