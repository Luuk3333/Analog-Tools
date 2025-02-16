<script>
	import "../app.scss";
	import { ProgressBar } from "@prgm/sveltekit-progress-bar";
	let { children } = $props();
</script>

<ProgressBar color="#0000ff" />

<main>
	<div class="page">
		<content>
			{@render children?.()}
		</content>
	</div>
</main>

<noscript>
	<style>
		.noscript-hide {
			display: none !important;
		}
	</style>
</noscript>
