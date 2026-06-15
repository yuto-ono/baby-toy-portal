<script lang="ts">
	import Delete from '@lucide/svelte/icons/delete';

	let {
		label,
		disabled = false,
		onDigit,
		onBackspace,
		onClear
	}: {
		label: string;
		disabled?: boolean;
		onDigit: (digit: string) => void;
		onBackspace: () => void;
		onClear: () => void;
	} = $props();

	const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
</script>

<div class="keypad" role="group" aria-label={label}>
	{#each digits as digit (digit)}
		<button type="button" {disabled} onclick={() => onDigit(digit)}>{digit}</button>
	{/each}

	<button class="utility clear" type="button" {disabled} onclick={onClear}>クリア</button>
	<button type="button" {disabled} onclick={() => onDigit('0')}>0</button>
	<button
		class="utility delete"
		type="button"
		{disabled}
		aria-label="1文字削除"
		onclick={onBackspace}
	>
		<Delete size={26} strokeWidth={2.7} aria-hidden="true" />
	</button>
</div>

<style lang="scss">
	$ink: #333145;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	.keypad {
		display: grid;
		width: min(100%, 20rem);
		margin: 1rem auto 0;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
	}

	button {
		box-sizing: border-box;
		display: grid;
		min-height: 3.5rem;
		margin: 0;
		padding: 0.35rem;
		place-items: center;
		border: 2px solid $ink;
		border-radius: 1rem;
		background: #fff;
		color: $ink;
		font: inherit;
		font-size: 1.5rem;
		font-weight: 900;
		box-shadow: 0 3px 0 $ink;
		cursor: pointer;
		touch-action: manipulation;

		&:active:not(:disabled) {
			transform: translateY(3px);
			box-shadow: none;
		}

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 2px;
		}

		&:disabled {
			cursor: wait;
			opacity: 0.55;
		}
	}

	.utility {
		background: $accent-yellow;
		font-size: 0.85rem;
	}

	.delete {
		background: #ffd0d0;
	}

	@media (orientation: landscape) and (min-width: 44rem) {
		.keypad {
			margin-top: 0.75rem;
			gap: 0.45rem;
		}

		button {
			min-height: 3rem;
		}
	}
</style>
