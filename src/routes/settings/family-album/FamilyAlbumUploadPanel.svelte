<script lang="ts">
	import ImagePlus from '@lucide/svelte/icons/image-plus';

	let {
		isBusy,
		isWorking,
		onAddPhotos
	}: {
		isBusy: boolean;
		isWorking: boolean;
		onAddPhotos: (event: Event) => void | Promise<void>;
	} = $props();
</script>

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
		onchange={onAddPhotos}
	/>
	<label class="upload-button" class:disabled={isBusy} for="family-album-files">
		<ImagePlus size={24} strokeWidth={2.8} aria-hidden="true" />
		<span>{isWorking ? '保存中…' : '写真を追加'}</span>
	</label>
</section>

<style lang="scss">
	$ink: #333145;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.upload-panel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 1.25rem;
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
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

	@media (max-width: 620px) {
		.upload-panel {
			align-items: stretch;
			flex-direction: column;
		}

		.upload-button {
			width: 100%;
		}
	}
</style>
