<script>
	import { LocalStorage } from "$lib/storage.svelte";

	const rolls = new LocalStorage("rolls", []);

	function addRoll(event) {
		event.preventDefault();
		const data = {
			id: self.crypto.randomUUID(),
			shots: [],
			brand: "",
			product: "",
			iso: null,
			identifier: "",
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
			{roll.brand || `Roll #${roll.id.slice(0, 7)}`}
			{roll.product}
			<br />

			{#if roll.editing}
				<button onclick={() => (roll.editing = false)}>Finish editing</button>
				<fieldset>
					<legend>Roll</legend>
					<label for="brand">Brand:</label>
					<input
						type="text"
						id="brand"
						bind:value={roll.brand}
						list="brands"
						placeholder="Kodak" />
					<datalist id="brands">
						<option value="Kodak"></option>
						<option value="Ilford"></option>
					</datalist>
					<br />
					<label for="product">Product:</label>
					<input
						type="text"
						id="product"
						bind:value={roll.product}
						list="products"
						placeholder="Portra 400" />
					<datalist id="products">
						<option value="Portra 160"></option>
						<option value="Portra 400"></option>
						<option value="Portra 800"></option>
						<option value="Delta 3200"></option>
					</datalist>
					<br />
					<label for="iso">ISO:</label>
					<input type="text" id="iso" bind:value={roll.iso} placeholder="400" />
				</fieldset>
				<fieldset>
					<legend>Custom</legend>
					<label for="identifier">Identifier:</label>
					<input type="text" id="identifier" name="identifier" placeholder="251A" />
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

<hr />

<pre>{JSON.stringify(rolls.current, null, 2)}</pre>

<style lang="scss">
	fieldset {
		width: max-content;
	}
</style>
