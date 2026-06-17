<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { createAppUpdater, type AppUpdater, type AppUpdateStatus } from './appUpdater';

	let status = $state<AppUpdateStatus>('idle');
	let updater: AppUpdater | undefined;

	const isBusy = $derived(status === 'checking' || status === 'applying' || status === 'updated');
	const isUnavailable = $derived(status === 'unavailable');
	const statusMessage = $derived.by(() => {
		switch (status) {
			case 'checking':
				return '新しいバージョンがないか確認しています。';
			case 'current':
				return '現在のバージョンが最新です。';
			case 'available':
				return '新しいバージョンがあります。更新後はホームへ戻ります。';
			case 'applying':
				return '更新を適用しています。';
			case 'updated':
				return '更新しました。ホームへ戻ります。';
			case 'offline':
				return 'インターネット接続を確認して、もう一度お試しください。';
			case 'unavailable':
				return 'この環境ではアプリの更新確認を利用できません。';
			case 'error':
				return '更新を確認できませんでした。しばらくしてからもう一度お試しください。';
			default:
				return 'インターネット上の新しいバージョンを確認できます。';
		}
	});

	onMount(() => {
		updater = createAppUpdater({
			serviceWorker: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined,
			isOnline: () => navigator.onLine,
			onStatusChange: (nextStatus) => {
				status = nextStatus;
			},
			reload: () => window.location.assign(resolve('/'))
		});
		void updater.checkForUpdate();
	});

	onDestroy(() => {
		updater?.destroy();
	});

	async function checkForUpdate(): Promise<void> {
		await updater?.checkForUpdate();
	}

	function handleUpdateAction(): void {
		if (status === 'available') {
			updater?.applyUpdate();
		} else {
			void checkForUpdate();
		}
	}
</script>

<section aria-labelledby="app-update-title">
	<div class="content">
		<div class="heading">
			<span class="icon" aria-hidden="true">
				<RefreshCw size={28} strokeWidth={2.7} class={isBusy ? 'spinning' : undefined} />
			</span>
			<div>
				<h2 id="app-update-title">アプリの更新</h2>
				<p class="description">新しいバージョンを確認する</p>
			</div>
		</div>

		<button type="button" onclick={handleUpdateAction} disabled={isBusy || isUnavailable}>
			{status === 'checking'
				? '確認中…'
				: status === 'available'
					? '更新する'
					: status === 'applying' || status === 'updated'
						? '更新中…'
						: '更新を確認'}
		</button>
	</div>

	<p class="status" aria-live="polite">{status === 'idle' ? '' : statusMessage}</p>
</section>

<style lang="scss">
	$ink: #333145;
	$accent-pink: #ff8d8d;
	$accent-yellow: #ffe272;
	$accent-mint: #67c7bf;

	section {
		width: 100%;
		margin: 0;
		padding: 1rem 1.25rem;
		border: 3px solid $ink;
		border-radius: 1.5rem;
		background: #fff;
		box-shadow: 6px 6px 0 $accent-pink;
	}

	.content,
	.heading {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.content {
		justify-content: space-between;
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

	:global(.spinning) {
		animation: spin 1s linear infinite;
	}

	h2 {
		margin: 0;
		font-size: 1.2rem;
	}

	.description {
		margin: 0.25rem 0 0;
		color: #666274;
		font-size: 0.9rem;
		font-weight: 700;
		line-height: 1.45;
	}

	.status {
		margin: 0.75rem 0 0 4.25rem;
		color: #666274;
		font-size: 0.9rem;
		font-weight: 700;
		line-height: 1.45;

		&:empty {
			display: none;
		}
	}

	button {
		min-height: 2.9rem;
		flex: 0 0 auto;
		padding: 0.55rem 1rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: $accent-mint;
		color: $ink;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 800;
		cursor: pointer;

		&:disabled {
			cursor: wait;
			opacity: 0.65;
		}

		&:focus-visible {
			outline: 4px solid $accent-yellow;
			outline-offset: 3px;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.spinning) {
			animation: none;
		}
	}

	@media (max-width: 420px) {
		.content {
			align-items: stretch;
			flex-direction: column;
		}

		button {
			width: 100%;
		}

		.status {
			margin-left: 0;
		}
	}
</style>
