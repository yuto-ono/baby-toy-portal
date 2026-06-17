<script lang="ts">
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	let {
		disabled,
		compact = false,
		onReload
	}: {
		disabled: boolean;
		compact?: boolean;
		onReload: () => void | Promise<void>;
	} = $props();
</script>

<button class:compact type="button" {disabled} onclick={onReload}>
	<RotateCcw size={20} strokeWidth={2.8} aria-hidden="true" />
	<span>もう一度読み込む</span>
</button>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	button {
		display: inline-flex;
		min-height: 3.4rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.25rem;
		padding: 0.65rem 1.1rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-mint;
		color: $ink;
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

	.compact {
		min-height: 2.8rem;
		flex: 0 0 auto;
		gap: 0.4rem;
		margin-top: 0;
		padding: 0.5rem 0.85rem;
		background: #fff;
		font-size: 0.95rem;
	}

	@media (max-width: 620px) {
		.compact {
			width: 100%;
		}
	}
</style>
