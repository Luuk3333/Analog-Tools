<script>
	import MicrophoneListener from "./MicrophoneListener.svelte";

	let enableMicrophone = $state(false);
	let microphoneMessage = $state(
		'<span class="diagonal-strike">🎙️</span> Microphone not active.',
	);
	function updateMessage(newMessage) {
		microphoneMessage = newMessage;
	}
</script>

<fieldset>
	<legend>Microphone</legend>
	<input type="checkbox" id="microphone" bind:checked={enableMicrophone} />
	<label for="microphone">Enable microphone to listen for shutter</label>
	<p>{@html microphoneMessage}</p>
</fieldset>

<MicrophoneListener {enableMicrophone} setMessage={updateMessage} />

<style lang="scss">
	:global(.diagonal-strike) {
		position: relative;
		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			left: 0.25rem;
			width: 100%;
			height: 0.15rem;
			background-color: red;
			transform-origin: bottom left;
			transform: rotate(-45deg);
		}
	}
</style>
