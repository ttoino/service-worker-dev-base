/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { base, build, files, prerendered, version } from "$service-worker";

/** @type {ServiceWorkerGlobalScope} */
const sw = self;

const cacheName = `cache-${version}`;
const cachedAssets = [...build, ...files, ...prerendered, `${base}/`];

sw.addEventListener("install", (event) => {
    const addAssetsToCache = async () => {
        const cache = await caches.open(cacheName);
        await cache.addAll(cachedAssets);
    };

    event.waitUntil(addAssetsToCache());
});

sw.addEventListener("activate", (event) => {
    const deleteOldCaches = async () => {
        await Promise.allSettled(
            (await caches.keys()).map(
                (name) => name !== cacheName && caches.delete(name),
            ),
        );
    };

    event.waitUntil(deleteOldCaches());
});

sw.addEventListener("fetch", (event) => {
    const respondWithCachedAsset = async () => {
        let asset = await caches.match(event.request);

        asset ??= await fetch(event.request);

        return asset;
    };

    event.respondWith(respondWithCachedAsset());
});
