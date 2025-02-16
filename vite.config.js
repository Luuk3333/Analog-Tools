import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern",
			},
		},
	},

	plugins: [sveltekit()],

	// Fix hot reload on WSL2 - https://www.reddit.com/r/sveltejs/comments/vzdsc0/npm_run_dev_not_automatically_refreshing_with/igmj4bv/
	server: {
		watch: {
			usePolling: true,
			ignored: ["**/scraper/**"],
		},
	},
});
