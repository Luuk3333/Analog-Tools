<script>
	import { LocalStorage } from "$lib/storage.svelte";
	import { iso, aperture, shutterSpeed, products } from "$lib/datalists.js";

	const currentCameraSettings = new LocalStorage("currentCameraSettings", {
		iso: "",
		aperture: "",
		shutterSpeed: "",
	});

	const rolls = new LocalStorage("rolls", []);

	function addRoll(event) {
		event.preventDefault();
		const data = {
			id: self.crypto.randomUUID(),
			shots: [],
			product: "",
			identifier: "",
			notes: "",
			added_on: new Date().getTime(),
		};
		console.log(data);
		rolls.current = [data, ...rolls.current];
	}

	let GPSTestMessage = "";
	function getLocation() {
		GPSTestMessage = "⏳ Loading...";
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					GPSTestMessage = `✅ It works!<pre>${JSON.stringify(position, null, 2)}</pre>`;
				},
				(error) => {
					// Handle different error scenarios
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
</script>

<svelte:head>
	<title>Timestamp - Analog Tools</title>
</svelte:head>

<h1>Rolls</h1>
<p>Keep track of your film rolls.</p>

<fieldset>
	<legend>Current Camera Settings</legend>
	<label for="current-iso">ISO:</label>
	<input
		type="text"
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
</fieldset>

<br />

<button onclick={getLocation}>Test GPS</button>
<div class="coordinates">{@html GPSTestMessage}</div>

<hr />
<h2>Your rolls</h2>
<button onclick={addRoll}>Add roll</button>
<ul>
	{#each rolls.current as roll}
		<li>
			{roll.identifier || roll.product || `Roll #${roll.id.slice(0, 7)}`}
			{#if roll.identifier}
				&ndash; {roll.product}
			{/if}

			<br />

			<button
				onclick={() => {
					const obj = {
						id: self.crypto.randomUUID(),
						iso: currentCameraSettings.current.iso,
						aperture: currentCameraSettings.current.aperture,
						shutterSpeed: currentCameraSettings.current.shutterSpeed,
						added_on: new Date().getTime(),
					};
					roll.shots = [...roll.shots, obj];
				}}>Add shot</button>

			<br />

			{#if roll.shots.length > 0}
				Shots:<br />
			{/if}
			<ul>
				{#each roll.shots as shot}
					<li>
						<pre>{JSON.stringify(shot)}</pre>
						<button
							onclick={() => {
								const index = roll.shots.findIndex((r) => r.id === shot.id);
								console.log(index);
								if (index !== -1) {
									roll.shots.splice(index, 1);
								}
							}}>Remove</button>
					</li>
				{/each}
			</ul>

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
						{#each products.sort() as value}
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
					console.log(index);
					if (index !== -1) {
						rolls.current.splice(index, 1);
					}
				}}>Remove</button>
		</li>
	{/each}
</ul>

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
			document.body.removeChild(a);
			setTimeout(function () {
				URL.revokeObjectURL(fileURL);
			}, 1500);
		}}>Export to JSON file</button>
{/if}

<hr />

<pre>{JSON.stringify(rolls.current, null, 2)}</pre>

<style lang="scss">
	fieldset {
		width: max-content;
	}
	li {
		margin-top: 1rem;
	}
</style>
