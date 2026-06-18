export type AppUpdateStatus =
	| 'idle'
	| 'checking'
	| 'current'
	| 'available'
	| 'applying'
	| 'updated'
	| 'offline'
	| 'unavailable'
	| 'error';

type AppUpdaterOptions = {
	serviceWorker: ServiceWorkerContainer | undefined;
	isOnline: () => boolean;
	onStatusChange: (status: AppUpdateStatus) => void;
	reload: () => void;
	scheduleReload?: (callback: () => void, delay: number) => void;
};

export type AppUpdater = {
	checkForUpdate: () => Promise<void>;
	applyUpdate: () => void;
	destroy: () => void;
};

export function createAppUpdater({
	serviceWorker,
	isOnline,
	onStatusChange,
	reload,
	scheduleReload = (callback, delay) => {
		window.setTimeout(callback, delay);
	}
}: AppUpdaterOptions): AppUpdater {
	let registration: ServiceWorkerRegistration | undefined;
	let hadControllerBeforeCheck = false;
	let isBusy = false;
	let isReloading = false;
	let applyRequested = false;
	let pendingWorker: ServiceWorker | undefined;
	const workerListeners: Array<{ worker: ServiceWorker; listener: () => void }> = [];

	function setStatus(status: AppUpdateStatus): void {
		isBusy = status === 'checking' || status === 'applying' || status === 'updated';
		onStatusChange(status);
	}

	function trackWorker(worker: ServiceWorker): void {
		if (workerListeners.some((entry) => entry.worker === worker)) return;

		pendingWorker = worker;

		const handleStateChange = (): void => {
			if (worker.state === 'installed') {
				setStatus(hadControllerBeforeCheck ? 'available' : 'current');
			} else if (worker.state === 'activated' && !hadControllerBeforeCheck) {
				setStatus('current');
			} else if (worker.state === 'redundant') {
				pendingWorker = undefined;
				setStatus('error');
			}
		};

		worker.addEventListener('statechange', handleStateChange);
		workerListeners.push({ worker, listener: handleStateChange });
		handleStateChange();
	}

	function handleControllerChange(): void {
		if (!applyRequested || isReloading) return;

		isReloading = true;
		setStatus('updated');
		scheduleReload(reload, 600);
	}

	async function initializeRegistration(): Promise<void> {
		if (!serviceWorker) return;

		try {
			registration = await serviceWorker.getRegistration();
			if (registration?.waiting) {
				hadControllerBeforeCheck = serviceWorker.controller !== null;
				pendingWorker = registration.waiting;
				setStatus('available');
			}
		} catch {
			// Initial lookup is opportunistic; explicit checks report update errors.
		}
	}

	if (!serviceWorker) {
		setStatus('unavailable');
	} else {
		serviceWorker.addEventListener('controllerchange', handleControllerChange);
		void initializeRegistration();
	}

	async function checkForUpdate(): Promise<void> {
		if (isBusy || !serviceWorker) return;

		if (!isOnline()) {
			setStatus('offline');
			return;
		}

		setStatus('checking');
		hadControllerBeforeCheck = serviceWorker.controller !== null;

		try {
			registration ??= await serviceWorker.getRegistration();
			registration ??= await serviceWorker.ready;

			if (!registration) {
				setStatus('unavailable');
				return;
			}

			const handleUpdateFound = (): void => {
				if (registration?.installing) trackWorker(registration.installing);
			};

			registration.addEventListener('updatefound', handleUpdateFound);

			try {
				await registration.update();
				const foundWorker = registration.installing ?? registration.waiting;

				if (foundWorker) {
					trackWorker(foundWorker);
					if (foundWorker.state === 'installed') setStatus('available');
				} else {
					setStatus('current');
				}
			} finally {
				registration.removeEventListener('updatefound', handleUpdateFound);
			}
		} catch {
			setStatus(isOnline() ? 'error' : 'offline');
		}
	}

	function applyUpdate(): void {
		const worker = registration?.waiting ?? pendingWorker;
		if (isBusy || !worker) return;

		applyRequested = true;
		setStatus('applying');

		try {
			worker.postMessage({ type: 'SKIP_WAITING' });
		} catch {
			applyRequested = false;
			setStatus('error');
		}
	}

	function destroy(): void {
		serviceWorker?.removeEventListener('controllerchange', handleControllerChange);

		for (const { worker, listener } of workerListeners) {
			worker.removeEventListener('statechange', listener);
		}
	}

	return { checkForUpdate, applyUpdate, destroy };
}
