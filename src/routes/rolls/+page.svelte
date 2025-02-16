<script>
	import { LocalStorage } from "$lib/storage.svelte";
	import { products } from "$lib/products.js";

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
</script>

<svelte:head>
	<title>Timestamp - Analog Tools</title>
</svelte:head>

<h1>Rolls</h1>
<p>Keep track of your film rolls.</p>

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
						{#each products.sort() as product}
							<option value={product}></option>
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

{#if rolls.current.length > 0}
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
			URL.revokeObjectURL(fileURL);
		}}>Export to JSON file</button>
{/if}

<hr />

<pre>{JSON.stringify(rolls.current, null, 2)}</pre>

<style lang="scss">
	fieldset {
		width: max-content;
	}
</style>
