<script lang="ts">
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type {
		FamilyAlbumPhotoRecordNormalizationIssue,
		FamilyAlbumPhotoRecordNormalizationIssueReason
	} from '$lib/family-album/familyAlbumPhotos';

	const photoRecordIssueLabels = {
		'missing-image': '画像データが見つかりません。',
		'invalid-record': '写真レコードの形式が正しくありません。',
		'restore-failed': '写真データを復元できませんでした。'
	} satisfies Record<FamilyAlbumPhotoRecordNormalizationIssueReason, string>;

	let {
		issues,
		disabled,
		onCleanup
	}: {
		issues: FamilyAlbumPhotoRecordNormalizationIssue[];
		disabled: boolean;
		onCleanup: () => void | Promise<void>;
	} = $props();

	function getPhotoRecordIssueLabel(issue: FamilyAlbumPhotoRecordNormalizationIssue) {
		return photoRecordIssueLabels[issue.reason];
	}
</script>

<section class="cleanup-panel" aria-labelledby="family-album-cleanup-title">
	<div class="cleanup-header">
		<span class="cleanup-icon" aria-hidden="true">
			<AlertTriangle size={34} strokeWidth={2.6} />
		</span>
		<div>
			<p class="eyebrow">要確認</p>
			<h2 id="family-album-cleanup-title">壊れた写真レコードがあります</h2>
			<p>正常な写真はそのまま使えます。復元できないレコードだけを削除できます。</p>
		</div>
		<button class="cleanup-button" type="button" {disabled} onclick={onCleanup}>
			<Trash2 size={22} strokeWidth={2.8} aria-hidden="true" />
			<span>{issues.length}件を削除</span>
		</button>
	</div>

	<ul class="issue-list" aria-label="壊れた写真レコード">
		{#each issues as issue (issue.id)}
			<li>
				<code>{issue.id}</code>
				<span>{getPhotoRecordIssueLabel(issue)}</span>
			</li>
		{/each}
	</ul>
</section>

<style lang="scss">
	$ink: #333145;
	$muted: #666274;
	$accent-yellow: #ffe272;
	$danger: #df5b69;

	.cleanup-panel {
		margin-top: 1.5rem;
		padding: 1.1rem 1.25rem;
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
		box-shadow: 6px 6px 0 $danger;
	}

	.cleanup-header {
		display: grid;
		align-items: center;
		gap: 0.9rem;
		grid-template-columns: auto minmax(0, 1fr) auto;

		p {
			margin: 0.4rem 0 0;
			color: $muted;
			font-weight: 700;
			line-height: 1.6;
		}
	}

	.cleanup-icon {
		display: inline-flex;
		color: $danger;
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

	.cleanup-button {
		display: inline-flex;
		min-height: 3.4rem;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.65rem 1rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: #fff;
		color: $danger;
		font: inherit;
		font-size: 1rem;
		font-weight: 800;
		white-space: nowrap;
		cursor: pointer;

		&:disabled {
			cursor: wait;
			opacity: 0.6;
		}

		&:focus-visible {
			outline: 4px solid $accent-yellow;
			outline-offset: 3px;
		}
	}

	.issue-list {
		display: grid;
		gap: 0.45rem;
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;

		li {
			display: grid;
			gap: 0.35rem;
			padding: 0.65rem 0.75rem;
			border: 2px solid #f0d9dc;
			border-radius: 0.9rem;
			background: #fff7f8;
		}

		code {
			color: $ink;
			font-size: 0.85rem;
			font-weight: 800;
			overflow-wrap: anywhere;
		}

		span {
			color: $muted;
			font-size: 0.95rem;
			font-weight: 700;
			line-height: 1.5;
		}
	}

	@media (max-width: 620px) {
		.cleanup-header {
			align-items: start;
			grid-template-columns: auto minmax(0, 1fr);
		}

		.cleanup-button {
			width: 100%;
			grid-column: 1 / -1;
		}
	}
</style>
