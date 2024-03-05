<script lang="ts">
	import { page } from '$app/stores';
	import Player from '$lib/Player.svelte';

	let id = $page.params.id;
	let player: Player;

	let message: string = '';
	let volume = 50;

	function send(event: SubmitEvent) {
		event.preventDefault();
		if (player) {
			player.send(message);
		}
	}
	function toggleMute() {
		player?.toggleMute();
	}
	function maxVol() {
		volume = 100;
	}

	$: {
		player?.setVolume(volume);
	}
</script>

<h1>Channel {id}</h1>
<form on:submit={send}>
	<input type="text" bind:value={message} />
	<button>Send</button>
</form>
<button on:click={toggleMute}>Toggle mute</button>
<button on:click={maxVol}>Max volume</button>
<input type="range" min="1" max="100" bind:value={volume} />
<Player bind:this={player} />
