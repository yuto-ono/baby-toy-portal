<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { FamilyAlbumPhoto, FamilyAlbumPhotoId } from '$lib/family-album/familyAlbumPhotos';

	let {
		photo,
		positionLabel,
		canMoveUp,
		canMoveDown,
		disabled,
		onRename,
		onMoveUp,
		onMoveDown,
		onDelete
	}: {
		photo: FamilyAlbumPhoto;
		positionLabel: string;
		canMoveUp: boolean;
		canMoveDown: boolean;
		disabled: boolean;
		onRename: (id: FamilyAlbumPhotoId, name: string) => Promise<void>;
		onMoveUp: (id: FamilyAlbumPhotoId) => Promise<void>;
		onMoveDown: (id: FamilyAlbumPhotoId) => Promise<void>;
		onDelete: (id: FamilyAlbumPhotoId) => Promise<void>;
	} = $props();

	let draftName = $derived(photo.name);
	let imageUrl = $state('');

	const canSaveName = $derived(
		!disabled && draftName.trim().length > 0 && draftName !== photo.name
	);

	$effect(() => {
		const url = URL.createObjectURL(photo.image);
		imageUrl = url;

		return () => {
			URL.revokeObjectURL(url);
		};
	});

	async function saveName(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		if (!canSaveName) return;

		await onRename(photo.id, draftName);
	}
</script>

<article>
	<div class="preview">
		{#if imageUrl}
			<img src={imageUrl} alt={photo.name} />
		{/if}
	</div>

	<div class="details">
		<p class="position">{positionLabel}</p>
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
	</div>

	<div class="actions" aria-label={`${photo.name}の並び順と削除`}>
		<button type="button" disabled={disabled || !canMoveUp} onclick={() => onMoveUp(photo.id)}>
			<ArrowUp size={22} strokeWidth={2.8} aria-hidden="true" />
			<span>上へ</span>
		</button>
		<button type="button" disabled={disabled || !canMoveDown} onclick={() => onMoveDown(photo.id)}>
			<ArrowDown size={22} strokeWidth={2.8} aria-hidden="true" />
			<span>下へ</span>
		</button>
		<button class="delete-button" type="button" {disabled} onclick={() => onDelete(photo.id)}>
			<Trash2 size={22} strokeWidth={2.8} aria-hidden="true" />
			<span>削除</span>
		</button>
	</div>
</article>

<style lang="scss">
	$ink: #333145;
	$muted: #666274;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;
	$danger: #df5b69;

	article {
		display: grid;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
		box-shadow: 5px 5px 0 $accent-yellow;
		grid-template-columns: 7.5rem minmax(0, 1fr) auto;
	}

	.preview {
		width: 7.5rem;
		aspect-ratio: 1;
		overflow: hidden;
		border: 2px solid $ink;
		border-radius: 1rem;
		background: #f4efe4;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.details,
	form {
		min-width: 0;
	}

	.position {
		margin: 0 0 0.45rem;
		color: $muted;
		font-size: 0.9rem;
		font-weight: 800;
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

	.save-button {
		flex: 0 0 auto;
		background: $accent-yellow;
	}

	.actions {
		display: grid;
		gap: 0.55rem;
	}

	.delete-button {
		background: #fff;
		color: $danger;
	}

	@media (max-width: 760px) {
		article {
			grid-template-columns: 6.5rem minmax(0, 1fr);
		}

		.preview {
			width: 6.5rem;
		}

		.actions {
			grid-column: 1 / -1;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.actions button {
			width: 100%;
		}
	}

	@media (max-width: 520px) {
		article {
			grid-template-columns: 1fr;
		}

		.preview {
			width: 100%;
			max-height: 16rem;
			aspect-ratio: 4 / 3;
		}

		.name-row {
			flex-direction: column;
		}

		.save-button {
			width: 100%;
		}
	}
</style>
