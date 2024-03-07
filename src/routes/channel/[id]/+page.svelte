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
				player.playMusicById(channel.last_song, secondsElapsed);
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

<!--
// v0 by Vercel.
// https://v0.dev/t/sk10Pyu7PnP
-->
<div class="p-8 grid gap-4 grid-cols-[1fr auto]">
	<div class="grid gap-4">
		<div class="flex items-center gap-4">
			<img
				width="80"
				height="80"
				alt="Channel logo"
				class="rounded-full aspect-square object-cover border"
			/>
			<div class="grid gap-1.5">
				<h1 class="text-2xl font-bold">{channel.name}</h1>
				<div class="flex items-center gap-2 text-sm">
					<button
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
						>Subscribe</button
					><button
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-4 h-4"
							><path
								d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
							></path></svg
						>
						Like
					</button><button
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-4 h-4"
							><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline
								points="16 6 12 2 8 6"
							></polyline><line x1="12" x2="12" y1="2" y2="15"></line></svg
						>
						Share
					</button>
				</div>
			</div>
		</div>

		<Player bind:this={player} />
		<div class="grid gap-4 pt-4">
			<div class="grid gap-2">
				<h2 class="text-xl font-semibold">Chat</h2>
				<div class="grid gap-2">
					<div class="flex items-start gap-2">
						<img
							width="32"
							height="32"
							alt="Avatar"
							class="rounded-full object-cover"
							style="aspect-ratio: 32 / 32; object-fit: cover;"
						/>

						<div>
							<div class="flex items-center gap-2">
								<div class="font-semibold">User123</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">2:34pm</div>
							</div>
							<p>
								Hey everyone! Just tuning in to some chill lofi beats. How is everyone's day going?
							</p>
						</div>
					</div>
				</div>
			</div>
			<div class="grid gap-2">
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only"
					for="message"
				>
					Message
				</label>
				<input
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="message"
					placeholder="Type your message..."
					data-id="88"
				/>
			</div>
		</div>
	</div>
</div>
