import { build, files, prerendered, version } from "$service-worker";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { buildNumber } from "$lib/buildNumber.js";

const precache_list = [...build, ...files, ...prerendered].map((s) => ({
	url: s,
	revision: `${version}-${buildNumber}`,
}));

precacheAndRoute(precache_list);
