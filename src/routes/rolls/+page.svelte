<script>
	import { LocalStorage } from "$lib/storage.svelte";

	const rolls = new LocalStorage("rolls", []);

	function addRoll(event) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);

		// Convert formData to an object
		let data = Object.fromEntries(formData.entries());
		data = {
			...data,
			id: self.crypto.randomUUID(),
			shots: [],
			added_on: new Date().getTime(),
		};
		console.log(data);
		rolls.current = [...rolls.current, data];
		form.reset();
	}
</script>

<svelte:head>
	<title>Timestamp - Analog Tools</title>
</svelte:head>

<h1>Rolls</h1>
<p>Keep track of your film rolls.</p>

{#if rolls.current.length > 0}
	<hr />
	<h2>Your rolls</h2>
	<ul>
		{#each rolls.current as roll}
			<li>
				{roll.brand}
				{roll.product}
				<pre>{JSON.stringify(roll)}</pre>
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
{/if}

<hr />

<h2>New roll</h2>
<form onsubmit={addRoll}>
	<fieldset>
		<legend>Roll</legend>
		<label for="brand">Brand:</label>
		<input type="text" id="brand" name="brand" list="brands" placeholder="Kodak" /><br /><br />
		<datalist id="brands">
			<option value="Kodak"></option>
			<option value="Ilford"></option>
		</datalist>
		<label for="product">Product:</label>
		<input
			type="text"
			id="product"
			name="product"
			list="products"
			placeholder="Portra 400" /><br /><br />
		<datalist id="products">
			<option value="Portra 160"></option>
			<option value="Portra 400"></option>
			<option value="Portra 800"></option>
			<option value="Delta 3200"></option>
		</datalist>
		<label for="iso">ISO:</label>
		<input type="text" id="iso" name="iso" placeholder="400" /><br /><br />
	</fieldset>
	<fieldset>
		<legend>Custom data</legend>
		<label for="identifier">Identifier:</label>
		<input type="text" id="identifier" name="identifier" placeholder="251A" /><br /><br />
	</fieldset>
	<input type="submit" value="Add" />
</form>

<hr />

<pre>{JSON.stringify(rolls.current, null, 2)}</pre>

<style lang="scss">
	fieldset {
		width: max-content;
	}
</style>
