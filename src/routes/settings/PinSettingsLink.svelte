<script lang="ts">
	import { resolve } from '$app/paths';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import KeyRound from '@lucide/svelte/icons/key-round';
</script>

<a href={resolve('/settings/pin')}>
	<span class="icon" aria-hidden="true">
		<KeyRound size={28} strokeWidth={2.7} />
	</span>
	<span class="label">
		<strong>保護者PIN</strong>
		<span>設定画面を開くPINを変更する</span>
	</span>
	<ChevronRight size={26} strokeWidth={2.7} aria-hidden="true" />
</a>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	a {
		display: flex;
		min-height: 5.5rem;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
		color: inherit;
		box-shadow: 6px 6px 0 $accent-yellow;
		cursor: pointer;
		text-decoration: none;

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 3px;
		}
	}

	.icon {
		display: grid;
		width: 3.25rem;
		height: 3.25rem;
		flex: 0 0 auto;
		place-items: center;
		border: 2px solid $ink;
		border-radius: 50%;
		background: $accent-yellow;
	}

	.label {
		display: grid;
		flex: 1;
		gap: 0.25rem;
		line-height: 1.45;

		strong {
			font-size: 1.2rem;
		}

		span {
			color: #666274;
			font-size: 0.9rem;
			font-weight: 700;
		}
	}

	a > :global(svg) {
		flex: 0 0 auto;
	}
</style>
