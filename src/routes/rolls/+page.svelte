<script>
	import { LocalStorage } from "$lib/storage.svelte";
	import { iso, aperture, shutterSpeed, products } from "$lib/datalists.js";
	import MicrophoneListener from "./MicrophoneListener.svelte";

	const currentCameraSettings = new LocalStorage("currentCameraSettings", {
		iso: "",
		aperture: "",
		shutterSpeed: "",
	});

	const preferences = new LocalStorage("preferences", {
		addGPSToNewShots: false,
		enableMicrophone: false,
		microphoneOneShot: false,
	});

	const rolls = new LocalStorage("rolls", []);

	function addRoll() {
		const data = {
			id: self.crypto.randomUUID(),
			shots: [],
			product: "",
			identifier: "",
			notes: "",
			added_on: new Date().getTime(),
		};
		rolls.current = [data, ...rolls.current];
	}

	function addShot(roll) {
		const dt = new Date();
		const uuid = self.crypto.randomUUID();
		const obj = {
			id: uuid,
			iso: currentCameraSettings.current.iso,
			aperture: currentCameraSettings.current.aperture,
			shutterSpeed: currentCameraSettings.current.shutterSpeed,
			position: null,
			frameNumber: roll.shots.length + 1,
			date: dt.toLocaleString("sv-SE").slice(0, 10),
			time: dt.toLocaleString("sv-SE").slice(11, 19),
			timezone_offset: dt.getTimezoneOffset(),
			added_on: dt.getTime(),
		};
		roll.shots = [obj, ...roll.shots];
		return uuid;
	}

	// GPS
	let GPSTestMessage = $state("");
	function testLocation() {
		GPSTestMessage = "⏳ Loading...";
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					GPSTestMessage = `✅ It works!<pre>${JSON.stringify(position, null, 2)}</pre>`;
				},
				(error) => {
					if (error.code === error.PERMISSION_DENIED) {
						GPSTestMessage = "❌ Location access denied by the user.";
					} else if (error.code === error.POSITION_UNAVAILABLE) {
						GPSTestMessage = "❌ Location information is unavailable.";
					} else if (error.code === error.TIMEOUT) {
						GPSTestMessage = "❌ The request to get user location timed out.";
					} else {
						GPSTestMessage = "❌ An unknown error occurred while retrieving location.";
					}
				},
			);
		} else {
			GPSTestMessage = "❌ Geolocation is not supported by this browser.";
		}
	}
	function getLocation(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					callback(null, position);
				},
				(error) => {
					callback(error, null);
				},
			);
		} else {
			callback(new Error("Geolocation not supported"), null, null);
		}
	}

	// Microphone
	let microphoneMessage = $state(
		'<span class="diagonal-strike">🎙️</span> Microphone not active.',
	);
	function updateMessage(newMessage) {
		microphoneMessage = newMessage;
	}
	function handleShutterSoundDetected(data, enableMicrophone) {
		if (rolls.current.length === 0) addRoll();
		setTimeout(() => {
			document
				.getElementById("rolls")
				.querySelector("li:first-child")
				.querySelector("button#addShot")
				.click();
		}, 0);
		preferences.current.enableMicrophone = enableMicrophone;
	}
</script>

<svelte:head>
	<title>Rolls - Analog Tools</title>
</svelte:head>

<h1>Rolls</h1>
<p>Keep track of your film rolls.</p>

<fieldset>
	<legend>Current Camera Settings</legend>
	<label for="current-iso">ISO:</label>
	<input
		type="number"
		id="current-iso"
		list="isos"
		bind:value={currentCameraSettings.current.iso}
		placeholder="400" />
	<datalist id="isos">
		{#each iso as value}
			<option {value}></option>
		{/each}
	</datalist>
	<br />
	<label for="current-aperture">Aperture:</label>
	<input
		type="text"
		id="current-aperture"
		list="apertures"
		bind:value={currentCameraSettings.current.aperture}
		placeholder="f/8" />
	<datalist id="apertures">
		{#each aperture as value}
			<option {value}></option>
		{/each}
	</datalist>
	<br />
	<label for="current-shutterSpeed">Shutter speed:</label>
	<input
		type="text"
		id="current-shutterSpeed"
		list="shutterSpeeds"
		bind:value={currentCameraSettings.current.shutterSpeed}
		placeholder="1/250" />
	<datalist id="shutterSpeeds">
		{#each shutterSpeed as value}
			<option {value}></option>
		{/each}
	</datalist>
	<br />
	<button
		style="float:right;"
		onclick={() => {
			currentCameraSettings.current.iso = "";
			currentCameraSettings.current.aperture = "";
			currentCameraSettings.current.shutterSpeed = "";
		}}>Clear</button>
</fieldset>

<br />

<fieldset>
	<legend>GPS Position</legend>
	<button onclick={testLocation}>Test GPS</button>
	<div class="coordinates">{@html GPSTestMessage}</div>

	<input
		type="checkbox"
		id="prefAddGPSToNewShots"
		bind:checked={preferences.current.addGPSToNewShots}
		onchange={() => (GPSTestMessage = "")} />
	<label for="prefAddGPSToNewShots">Add current GPS position to new shots</label>
</fieldset>

<fieldset>
	<legend>Microphone</legend>
	<input type="checkbox" id="microphone" bind:checked={preferences.current.enableMicrophone} />
	<label for="microphone">Enable microphone to listen for shutter sound</label>
	<br />
	<input
		type="checkbox"
		id="microphoneOneShot"
		bind:checked={preferences.current.microphoneOneShot} />
	<label for="microphoneOneShot">Turn off after detection</label>
	<p>{@html microphoneMessage}</p>
</fieldset>
<MicrophoneListener
	enableMicrophone={preferences.current.enableMicrophone}
	setMessage={updateMessage}
	oneShot={preferences.current.microphoneOneShot}
	callback={handleShutterSoundDetected} />

<hr />
<h2>Your rolls</h2>
<button onclick={addRoll}>Add roll</button>
<div class="rolls">
	{#each rolls.current as roll, index}
		<div class="roll" style:backgroundImage={`url(${products[roll.product]?.image})`}>
			<span class="film-label">
				{#if products[roll.product]?.image}
					<img src={products[roll.product].image} />
				{/if}
			</span>

			<h1>
				{roll.identifier || roll.product || `Roll #${rolls.current.length - index}`}
			</h1>
			{#if roll.identifier}
				<h2>{roll.product}</h2>
			{/if}

			{#if roll.notes}
				<p style="white-space: pre-line;">
					{roll.notes.trim()}
				</p>
			{/if}

			<br />

			{#if roll.editing}
				<button onclick={() => (roll.editing = false)}>Finish editing</button>
				<fieldset>
					<legend>Roll</legend>
					<label for="product">Product:</label>
					<input
						type="text"
						id="product"
						bind:value={roll.product}
						list="products"
						placeholder="Kodak Portra 400" />
					<datalist id="products">
						{#each Object.keys(products).sort() as value}
							<option {value}></option>
						{/each}
					</datalist>
				</fieldset>
				<fieldset>
					<legend>Custom</legend>
					<label for="identifier">Identifier:</label>
					<input
						type="text"
						id="identifier"
						bind:value={roll.identifier}
						placeholder="251A" />
					<br />
					<label for="notes">Notes:</label>
					<textarea id="notes" bind:value={roll.notes}></textarea>
				</fieldset>
				<br />
			{:else}
				<button onclick={() => (roll.editing = true)}>Edit</button>
			{/if}
			<button
				onclick={() => {
					const index = rolls.current.findIndex((r) => r.id === roll.id);
					if (index !== -1) {
						rolls.current.splice(index, 1);
					}
				}}>Remove</button>

			<br />

			<details>
				<summary>Shots</summary>
				<button
					id="addShot"
					onclick={() => {
						const uuid = addShot(roll);

						if (preferences.current.addGPSToNewShots) {
							const index = roll.shots.findIndex((r) => r.id === uuid);
							roll.shots[index].position = "loading";
							setTimeout(() => {
								if (roll.shots[index].position === "loading") {
									roll.shots[index].position = null;
								}
							}, 30 * 1000);
							getLocation((error, position) => {
								if (error) {
									console.error(
										"Failed to add GPS coordinates to new shot:",
										error.message,
									);
									roll.shots[index].position = null;
								} else {
									roll.shots[index].position = position;
								}
							});
						}
					}}>Add shot</button>
				<div class="shots">
					{#each roll.shots as shot}
						<details>
							<summary class="square">
								<span class="icon">🖼️</span>
								<span class="info top left frameNumber">#{shot.frameNumber}</span>
								<span class="info top right">
									{#if shot.position === "loading"}
										<span class="blink">📍</span>
									{:else if shot.position}
										📍
									{/if}
								</span>
								<div class="info bottom left datetime">
									{#if shot.time}
										<span>{shot.time.substring(0, 5)}</span>
									{/if}
									{#if shot.date}
										<span
											>{new Date(shot.date).toLocaleDateString("en-GB", {
												day: "2-digit",
												month: "short",
											})}</span>
										<span>{shot.date.substring(0, 4)}</span>
									{/if}
								</div>
								<div class="info bottom right cameraSettings">
									<span>{shot.iso}</span>
									<span>{shot.aperture}</span>
									{#if shot.shutterSpeed}
										<span
											>{shot.shutterSpeed}{#if !shot.shutterSpeed.startsWith("1/")}&nbsp;s{/if}</span>
									{/if}
								</div>
							</summary>
							<label for="frameNumber">Frame number:</label>
							#<input
								type="number"
								id="frameNumber"
								bind:value={shot.frameNumber}
								style="width: 5rem;"
								placeholder="36" />
							<br />
							<label for="shot-iso">ISO:</label>
							<input
								type="number"
								id="shot-iso"
								list="isos"
								bind:value={shot.iso}
								placeholder="400" />
							<br />
							<label for="shot-aperture">Aperture:</label>
							<input
								type="text"
								id="shot-aperture"
								list="apertures"
								bind:value={shot.aperture}
								placeholder="f/8" />
							<br />
							<label for="shot-shutterSpeed">Shutter speed:</label>
							<input
								type="text"
								id="shot-shutterSpeed"
								list="shutterSpeeds"
								bind:value={shot.shutterSpeed}
								placeholder="1/250" />

							<br />
							<label for="shot-timestamp">Taken on:</label>
							<input type="date" id="shot-date" bind:value={shot.date} />
							<input type="time" id="shot-time" step="1" bind:value={shot.time} />
							(local)

							<br />

							<button
								onclick={() => {
									const index = roll.shots.findIndex((r) => r.id === shot.id);
									if (index !== -1) {
										roll.shots.splice(index, 1);
									}
								}}>Remove</button>

							<details>
								<summary>Show JSON</summary>
								<pre>{JSON.stringify(shot, null, 2)}</pre>
							</details>
						</details>
					{/each}
				</div>
			</details>
		</div>
	{/each}
</div>

{#if rolls.current.length === 0}
	or
	<br />
	<button
		onclick={() => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".json";
			input.onchange = async function (event) {
				const file = event.target.files[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = function (e) {
						try {
							const importedData = JSON.parse(e.target.result);
							rolls.current = importedData;
							console.log("Imported JSON:", rolls.current);
						} catch (error) {
							console.error("Error parsing JSON:", error);
						}
					};
					reader.readAsText(file);
				}
			};
			input.click();
		}}>Import JSON file</button>
{:else}
	<button
		onclick={() => {
			var blob = new Blob([JSON.stringify(rolls.current, null, 2)], {
				type: "application/json",
			});
			const fileURL = URL.createObjectURL(blob);
			const el = document.createElement("a");
			el.href = fileURL;
			el.download = `rolls-${Math.floor(new Date().getTime() / 1000)}.json`;
			document.body.appendChild(el);
			el.click();
			document.body.removeChild(el);
			setTimeout(function () {
				URL.revokeObjectURL(fileURL);
			}, 1500);
		}}>Export to JSON file</button>
{/if}

<hr />

<details>
	<summary>Show JSON</summary>
	<pre>{JSON.stringify(rolls.current, null, 2)}</pre>
</details>

<style lang="scss">
	fieldset {
		width: max-content;
	}

	details summary {
		cursor: pointer;
	}

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

	.rolls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;

		.roll {
			flex: 1;
			border: 2px solid red;
			border-radius: 1rem;
			padding: 1rem;
			min-width: 18rem;
			max-width: 30rem;

			.film-label img {
				height: 4.5rem;
			}

			h1,
			h2 {
				margin: 0;
			}
			h1 {
				font-size: 1.5rem;
			}
			h2 {
				font-size: 1.2rem;
			}
		}
	}

	.shots {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.shots .square {
		$size: 7rem;
		position: relative;
		width: $size;
		height: $size;
		background-color: lightgray;
		border-radius: 1rem;

		.icon {
			position: absolute;
			font-size: 3rem;
			width: 100%;
			height: 60%;
			display: flex;
			justify-content: center;
			align-items: center;
			filter: grayscale(1);
			opacity: 0.25;
		}

		.info {
			position: absolute;
			padding: 0.5rem;
			&.top {
				top: 0;
			}
			&.left {
				left: 0;
			}
			&.right {
				right: 0;
			}
			&.bottom {
				bottom: 0;
				display: flex;
				flex-direction: column;
				&.left {
					align-items: flex-start;
				}
				&.right {
					align-items: flex-end;
				}
			}
		}

		.frameNumber {
			font-size: 1.7rem;
		}
	}

	.blink {
		animation: blinker 1s step-start infinite;
		@keyframes blinker {
			50% {
				opacity: 0;
			}
		}
	}
</style>
