/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;
const cacheName = `baby-toy-portal-${version}`;
const appShellPath = new URL('./', worker.location.href).pathname;
const appAssets = [...build, ...files, appShellPath];

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => cache.addAll(appAssets))
			.then(() => worker.skipWaiting())
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
			)
			.then(() => worker.clients.claim())
	);
});

worker.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const requestUrl = new URL(event.request.url);
	if (requestUrl.origin !== worker.location.origin) return;

	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const copy = response.clone();
					event.waitUntil(caches.open(cacheName).then((cache) => cache.put(event.request, copy)));
					return response;
				})
				.catch(async () => {
					const cachedPage = await caches.match(event.request);
					return cachedPage ?? (await caches.match(appShellPath)) ?? Response.error();
				})
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => cachedResponse ?? fetch(event.request))
	);
});
