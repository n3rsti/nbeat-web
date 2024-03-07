<script lang="ts">
	import { page } from '$app/stores';
	import Player from '$lib/Player.svelte';
	import { API } from '$lib/data';
	import { ChannelModel, ChannelBuilder } from '$lib/models/channel.model';
	import { onMount } from 'svelte';

	let id = $page.params.id;
	let player: Player;

	let message: string = '';
	let volume = 50;

	let channel: ChannelModel = new ChannelBuilder();

	onMount(() => {
		API.getChannel(id)
			.then((data: ChannelModel) => {
				channel = data;

				const secondsElapsed = (Date.now() - channel.last_song_played_at) / 1000;
				console.log(player.playMusicById);
				player?.playMusicById(channel.last_song, secondsElapsed);
			})
			.catch((err) => {
				console.log(err);
			});
	});

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
</script>

<h1>Channel {channel.name}</h1>
<h3>Owner {channel.owner}</h3>
<form on:submit={send}>
	<input type="text" bind:value={message} />
	<button>Send</button>
</form>
<button on:click={toggleMute}>Toggle mute</button>
<button on:click={maxVol}>Max volume</button>
<input type="range" min="1" max="100" bind:value={volume} />
<Player bind:this={player} />
