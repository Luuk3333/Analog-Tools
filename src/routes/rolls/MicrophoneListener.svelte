<script>
	import { onDestroy } from "svelte";

	let { enableMicrophone, setMessage, callback } = $props();

	let rec = null;

	function startRecording() {
		if (rec) return; // Prevent multiple initializations
		setMessage("⏳ Initializing microphone...");

		var Recording = function (cb) {
			var recorder = null;
			var recording = true;
			var audioInput = null;
			var volume = null;
			var audioContext = null;
			var callback = cb;

			navigator.getUserMedia =
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia;

			if (navigator.getUserMedia) {
				navigator.getUserMedia(
					{ audio: true },
					function (e) {
						var AudioContext = window.AudioContext || window.webkitAudioContext;
						audioContext = new AudioContext();
						volume = audioContext.createGain();
						audioInput = audioContext.createMediaStreamSource(e);
						audioInput.connect(volume);
						recorder = audioContext.createScriptProcessor(2048, 1, 1);

						recorder.onaudioprocess = function (e) {
							if (!recording) return;
							var left = e.inputBuffer.getChannelData(0);
							callback(new Float32Array(left));
						};
						volume.connect(recorder);
						recorder.connect(audioContext.destination);
					},
					function (error) {
						if (error.name === "NotAllowedError") {
							setMessage("❌ Microphone access denied by the user.");
						} else {
							setMessage("❌ Failed to capture audio.");
							console.error("Error capturing audio.", error);
						}
					},
				);
			} else {
				setMessage("❌ getUserMedia not supported in this browser.");
			}

			this.stop = function () {
				recording = false;
				if (recorder) recorder.disconnect();
				if (audioInput) audioInput.disconnect();
				if (audioContext) audioContext.close();
				rec = null;
			};
		};

		var lastClap = new Date().getTime();

		function detectClap(data) {
			var t = new Date().getTime();
			if (t - lastClap < 200) return false;
			var zeroCrossings = 0,
				highAmp = 0;
			for (var i = 1; i < data.length; i++) {
				if (Math.abs(data[i]) > 0.25) highAmp++;
				if ((data[i] > 0 && data[i - 1] < 0) || (data[i] < 0 && data[i - 1] > 0))
					zeroCrossings++;
			}
			if (highAmp > 20 && zeroCrossings > 30) {
				lastClap = t;
				return true;
			}
			return false;
		}

		rec = new Recording(function (data) {
			if (detectClap(data)) {
				setMessage("✅ Shutter detected!");
				callback(data);
				setTimeout(() => {
					setMessage("🎙️ Listening...");
				}, 1500);
			}
		});
	}

	$effect(() => {
		if (enableMicrophone) {
			startRecording();
			setMessage("🎙️ Listening...");
		} else if (rec) {
			rec.stop();
			setMessage('<span class="diagonal-strike">🎙️</span> Microphone not active.');
		}
	});

	onDestroy(() => {
		if (rec) rec.stop();
	});
</script>
