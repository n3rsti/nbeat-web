<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';

	interface QueuedMusic {
		id: string;
		timestamp: number;
	}

	let ws: WebSocket;
	let id: string = '';

	let currentSong = '';
	let songName = '';
	let songDescription = '';

	let player: YT.Player;

	let messages: string[] = [];
	let queue: QueuedMusic[] = [];

	onDestroy(() => {
		if (player && player.destroy) {
			player.destroy();
		}
	});

	async function getVideoData(videoId: string) {
		const response = await fetch(`/api/youtube/video/${videoId}`);

		const data = await response.json();
		songName = data.snippet.title;
		songDescription = data.snippet.description.slice(0, 80);
	}

	onMount(() => {
		function load() {
			player = new YT.Player('player', {
				height: '200',
				width: '300',
				videoId: '', // Replace with your video ID
				playerVars: {
					autoplay: 1,
					controls: 1,
					mute: 1
				},
				events: {
					onStateChange: (event) => {
						if (event.data === YT.PlayerState.PLAYING) {
							console.log(`Video Duration: ${player.getDuration()} seconds`);
							getVideoData(currentSong);
						}
					},
					onReady: () => {
						if (queue.length > 0) {
							const song = queue.shift();
							if (song) {
								console.log(song);
								playMusicById(song.id, song.timestamp);
							}
						}
					}
				}
			});
		}

		if (window.YT) {
			load();
		} else {
			window.onYouTubeIframeAPIReady = load;
		}

		id = $page.params.id;

		const wsUrl = `ws://localhost:8080/ws/channel/${id}`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			const accessToken = localStorage.getItem('accessToken');
			if (accessToken) {
				ws.send(`Bearer ${accessToken}`);
			}

			console.log('WebSocket connection established');
		};
		ws.onmessage = (event) => {
			console.log('Message received:', event);
			console.log('ID: ', extractVideoId(event.data));
			const vidId = extractVideoId(event.data);
			if (vidId) {
				player.loadVideoById(vidId, 0, 'small');
				messages = [...messages, `Now playing: ${event.data}`];
			} else {
				messages = [...messages, event.data];
			}
		};
		ws.onerror = (error) => console.error('WebSocket error:', error);
		ws.onclose = () => console.log('WebSocket connection closed');

		return () => {
			ws.close();
		};
	});

	export function send(message: string) {
		ws.send(message);
	}

	export function playMusicById(id: string, startSeconds = 0) {
		if (player && player.loadVideoById) {
			player.loadVideoById(id, startSeconds, 'small');
			currentSong = id;
		} else {
			queue = [...queue, { id: id, timestamp: startSeconds }];
		}
	}

	export function printStatus() {
		console.log(player.getPlayerState());
	}

	export function toggleMute() {
		if (player.isMuted()) {
			player.unMute();
		} else {
			player.mute();
		}
	}

	export function setVolume(volume: number) {
		console.log('changed vol');
		player.setVolume(volume);
	}

	function extractVideoId(url: string) {
		const regex =
			/(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);

		return match ? match[1] : null;
	}
</script>

<div id="player"></div>
<svelte:head>
	<script src="https://www.youtube.com/iframe_api"></script>
</svelte:head>
<ul>
	{#each messages as message}
		<li>{message}</li>
	{/each}
</ul>

<div class="grid gap-4 p-8">
	<div class="grid gap-2">
		<h1 class="text-2xl font-semibold">Now playing</h1>
		<div class="flex items-center gap-4">
			<img
				width="100"
				height="100"
				alt="Album art"
				class="rounded-lg"
				style="aspect-ratio: 100 / 100; object-fit: cover;"
			/>
			<div class="grid gap-1.5">
				<h2 class="text-xl font-semibold">{songName}</h2>
				<p class="text-sm text-gray-500 dark:text-gray-400">{songDescription}</p>
			</div>
		</div>
	</div>
	<div class="grid gap-2">
		<div class="flex items-center gap-4">
			<button
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-8 h-8"
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
					class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg
				><span class="sr-only">Previous</span></button
			><button
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-8 h-8"
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
					class="w-4 h-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg
				><span class="sr-only">Next</span></button
			><button
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-8 h-8"
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
					class="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg
				><span class="sr-only">Play</span></button
			>
		</div>
		<div class="grid gap-2">
			<div class="flex items-center justify-between">
				<div class="text-xs text-gray-500 dark:text-gray-400">0:00 / 3:42</div>
				<button
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-4 h-4"
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
						><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path
							d="m7 22-4-4 4-4"
						></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg
					><span class="sr-only">Repeat</span></button
				>
			</div>
			<span
				dir="ltr"
				data-orientation="horizontal"
				aria-disabled="false"
				class="relative flex touch-none select-none items-center w-full"
				style="--radix-slider-thumb-transform: translateX(-50%);"
				><span
					data-orientation="horizontal"
					class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
					><span
						data-orientation="horizontal"
						class="absolute h-full bg-primary"
						style="left: 0%; right: 100%;"
					></span></span
				><span
					style="transform: var(--radix-slider-thumb-transform); position: absolute; left: calc(0% + 10px);"
					><span
						role="slider"
						aria-valuemin="0"
						aria-valuemax="100"
						aria-orientation="horizontal"
						data-orientation="horizontal"
						tabindex="0"
						class="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						style=""
						data-radix-collection-item=""
						aria-valuenow="0"
					></span></span
				></span
			>
		</div>
	</div>
	<div class="grid gap-2">
		<h2 class="text-lg font-semibold">Volume</h2>
		<div class="flex items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="w-4 h-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg
			>
			<div class="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-800">
				<div class="h-full w-3 rounded-full bg-gray-300 dark:bg-gray-200"></div>
			</div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="w-4 h-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg
			>
		</div>
	</div>
</div>
