<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let ws: WebSocket;
	let id: string = '';

	let message: string = '';
	let currentSongUrl = '';

	onMount(() => {
		id = $page.params.id;

		const wsUrl = `ws://localhost:8080/ws/channel/${id}`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => console.log('WebSocket connection established');
		ws.onmessage = (event) => {
			console.log('Message received:', event.data);
			currentSongUrl = event.data;
		};
		ws.onerror = (error) => console.error('WebSocket error:', error);
		ws.onclose = () => console.log('WebSocket connection closed');

		return () => {
			ws.close();
		};
	});

	function send() {
		ws.send(message);
	}
</script>

<h1>Channel {id}</h1>
<form>
	<input type="text" bind:value={message} />
	<button on:click={send}>Send</button>
</form>
<iframe title="yt" width="400" height="400" src={currentSongUrl}></iframe>
