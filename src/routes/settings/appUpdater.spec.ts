import { describe, expect, it, vi } from 'vitest';
import { createAppUpdater, type AppUpdateStatus } from './appUpdater';

function createServiceWorkerMock({
	hasController = true,
	registration
}: {
	hasController?: boolean;
	registration?: ServiceWorkerRegistration;
} = {}) {
	const listeners = new Map<string, EventListener>();
	const serviceWorker = {
		controller: hasController ? ({} as ServiceWorker) : null,
		ready: Promise.resolve(registration),
		getRegistration: vi.fn(async () => registration),
		addEventListener: vi.fn((type: string, listener: EventListener) => {
			listeners.set(type, listener);
		}),
		removeEventListener: vi.fn((type: string) => {
			listeners.delete(type);
		})
	};

	return {
		serviceWorker: serviceWorker as unknown as ServiceWorkerContainer,
		dispatch(type: string) {
			listeners.get(type)?.(new Event(type));
		}
	};
}

function createRegistrationMock() {
	const listeners = new Map<string, EventListener>();
	const registration = {
		installing: null,
		waiting: null,
		update: vi.fn(async () => undefined),
		addEventListener: vi.fn((type: string, listener: EventListener) => {
			listeners.set(type, listener);
		}),
		removeEventListener: vi.fn((type: string) => {
			listeners.delete(type);
		})
	};

	return registration as unknown as ServiceWorkerRegistration;
}

function createWorkerMock(initialState: ServiceWorkerState = 'installing') {
	const listeners = new Map<string, EventListener>();
	let state = initialState;
	const worker = {
		get state() {
			return state;
		},
		postMessage: vi.fn(),
		addEventListener: vi.fn((type: string, listener: EventListener) => {
			listeners.set(type, listener);
		}),
		removeEventListener: vi.fn((type: string) => {
			listeners.delete(type);
		})
	};

	return {
		worker: worker as unknown as ServiceWorker,
		setState(nextState: ServiceWorkerState) {
			state = nextState;
			listeners.get('statechange')?.(new Event('statechange'));
		}
	};
}

function createUpdater({
	serviceWorker,
	online = true
}: {
	serviceWorker: ServiceWorkerContainer | undefined;
	online?: boolean;
}) {
	const statuses: AppUpdateStatus[] = [];
	const reload = vi.fn();
	const scheduleReload = vi.fn((callback: () => void) => callback());
	const updater = createAppUpdater({
		serviceWorker,
		isOnline: () => online,
		onStatusChange: (status) => statuses.push(status),
		reload,
		scheduleReload
	});

	return { updater, statuses, reload, scheduleReload };
}

describe('createAppUpdater', () => {
	it('reports unavailable when service workers are not supported', async () => {
		const { updater, statuses } = createUpdater({ serviceWorker: undefined });

		await updater.checkForUpdate();

		expect(statuses).toEqual(['unavailable']);
	});

	it('does not request an update while offline', async () => {
		const registration = createRegistrationMock();
		const serviceWorker = createServiceWorkerMock({ registration });
		const { updater, statuses } = createUpdater({
			serviceWorker: serviceWorker.serviceWorker,
			online: false
		});

		await updater.checkForUpdate();

		expect(statuses).toEqual(['offline']);
		expect(registration.update).not.toHaveBeenCalled();
	});

	it('reports current when no new worker is found', async () => {
		const registration = createRegistrationMock();
		const serviceWorker = createServiceWorkerMock({ registration });
		const { updater, statuses } = createUpdater({ serviceWorker: serviceWorker.serviceWorker });

		await updater.checkForUpdate();

		expect(registration.update).toHaveBeenCalledOnce();
		expect(statuses).toEqual(['checking', 'current']);
	});

	it('waits for confirmation before applying an available update', async () => {
		const registration = createRegistrationMock();
		const worker = createWorkerMock();
		Object.defineProperty(registration, 'installing', { value: worker.worker });
		const serviceWorker = createServiceWorkerMock({ registration });
		const { updater, statuses, reload, scheduleReload } = createUpdater({
			serviceWorker: serviceWorker.serviceWorker
		});

		await updater.checkForUpdate();
		worker.setState('installed');

		expect(statuses).toEqual(['checking', 'available']);
		expect(worker.worker.postMessage).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();

		updater.applyUpdate();
		serviceWorker.dispatch('controllerchange');

		expect(statuses).toEqual(['checking', 'available', 'applying', 'updated']);
		expect(worker.worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
		expect(scheduleReload).toHaveBeenCalledWith(reload, 600);
		expect(reload).toHaveBeenCalledOnce();
	});

	it('removes service worker listeners when destroyed', () => {
		const serviceWorker = createServiceWorkerMock();
		const { updater } = createUpdater({ serviceWorker: serviceWorker.serviceWorker });

		updater.destroy();

		expect(serviceWorker.serviceWorker.removeEventListener).toHaveBeenCalledWith(
			'controllerchange',
			expect.any(Function)
		);
	});
});
