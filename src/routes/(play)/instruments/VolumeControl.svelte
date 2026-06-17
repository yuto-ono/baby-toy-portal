<script lang="ts">
	import VolumeX from '@lucide/svelte/icons/volume-x';

	const volumeLevels = [
		{ label: '消音', value: 0 },
		{ label: '小', value: 0.25 },
		{ label: '中', value: 0.55 },
		{ label: '大', value: 1 }
	];

	let { value = $bindable(0.55) }: { value?: number } = $props();

	const currentLevel = $derived(
		volumeLevels.find((level) => level.value === value) ?? volumeLevels[2]
	);

	function selectNextLevel() {
		const currentIndex = volumeLevels.findIndex((level) => level.value === value);
		value = volumeLevels[(currentIndex + 1) % volumeLevels.length].value;
	}
</script>

<div class="volume-control" role="group" aria-label="音量">
	<div class="level-buttons">
		{#each volumeLevels as level (level.label)}
			<button
				type="button"
				class:active={value === level.value}
				aria-label={`音量 ${level.label}`}
				aria-pressed={value === level.value}
				onclick={() => (value = level.value)}
			>
				{#if level.value === 0}
					<VolumeX size={20} strokeWidth={3} aria-hidden="true" />
				{:else}
					<span>{level.label}</span>
				{/if}
			</button>
		{/each}
	</div>
	<button
		class="compact-button"
		type="button"
		aria-label={`音量 ${currentLevel.label}。押すと次の音量に切り替え`}
		onclick={selectNextLevel}
	>
		{#if currentLevel.value === 0}
			<VolumeX size={20} strokeWidth={3} aria-hidden="true" />
		{:else}
			<span>{currentLevel.label}</span>
		{/if}
	</button>
</div>

<style lang="scss">
	$ink: #333145;
	$accent-mint: #67c7bf;
	$accent-yellow: #ffe272;

	.volume-control {
		display: inline;
		color: $ink;
		font-size: 0.9rem;
		font-weight: 800;
		line-height: 1;
	}

	.level-buttons {
		display: inline-grid;
		grid-template-columns: repeat(4, 2.4rem);
		gap: 0.2rem;
		padding: 0.2rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: #fff8e7;
	}

	.compact-button {
		display: none;
	}

	button {
		display: inline-flex;
		width: 2.4rem;
		height: 2.2rem;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font: inherit;
		-webkit-tap-highlight-color: transparent;

		&.active {
			background: $accent-yellow;
			box-shadow: inset 0 0 0 2px $ink;
		}

		&:focus-visible {
			outline: 4px solid $accent-mint;
			outline-offset: 2px;
		}
	}

	@media (max-width: 640px) {
		.level-buttons {
			display: none;
		}

		.compact-button {
			display: inline-flex;
			width: 3.2rem;
			height: 2.4rem;
			border: 2px solid $ink;
			background: $accent-yellow;
			box-shadow: inset 0 0 0 2px #fff8e7;
		}
	}
</style>
