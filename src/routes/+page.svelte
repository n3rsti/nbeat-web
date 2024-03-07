<script lang="ts">
	import { goto } from '$app/navigation';
	import Nav from '$lib/components/Nav.svelte';
	import { API } from '$lib/data';

	let channelName = '';

	async function createChannel(event: SubmitEvent) {
		event.preventDefault();

		const request = await API.createChannel(channelName);
		if (request.status === 201) {
			const data = await request.json();
			goto(`channel/${data._id}`);
		}
	}
</script>

<Nav />
<form action="" on:submit={createChannel}>
	<input type="text" bind:value={channelName} />
	<button>Create</button>
</form>
