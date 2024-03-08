<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	interface QueuedMusic {
		id: string;
		timestamp: number;
	}

	let currentSong = '';
	let thumbnail = '';
	let songName = '';
	let songDescription = '';
	let muted = true;
	let volume = 20;
	let formattedSongDuration = '00:00';
	let songDuration = 0;
	let elapsed = 0;
	let formattedElapsed = '00:00';

	let player: YT.Player;

	let queue: QueuedMusic[] = [];

	onDestroy(() => {
		if (player && player.destroy) {
			player.destroy();
		}
	});

	setInterval(() => {
		if (player && player.getCurrentTime && player.getPlayerState() === YT.PlayerState.PLAYING) {
			elapsed = Math.ceil(player.getCurrentTime());
			formattedElapsed = formatSongDuration(elapsed);
		}
	}, 1000);

	export function getSongName() {
		return songName;
	}

	function formatSongDuration(seconds: number) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		const paddedMinutes = minutes.toString().padStart(2, '0');
		const paddedSeconds = Math.ceil(remainingSeconds).toString().padStart(2, '0');

		if (isNaN(hours)) {
			return formatSongDuration(elapsed);
		}

		if (hours == 0) {
			return `${paddedMinutes}:${paddedSeconds}`;
		}

		return `${hours}:${paddedMinutes}:${paddedSeconds}`;
	}

	async function getVideoData(videoId: string) {
		const response = await fetch(`/api/youtube/video/${videoId}`);

		const data = await response.json();
		songName = data.snippet.title;
		thumbnail = data.snippet.thumbnails.default.url;
		songDescription = data.snippet.description.slice(0, 80);
	}

	onMount(() => {
		function load() {
			player = new YT.Player('player', {
				height: '0',
				width: '0',
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
							formattedSongDuration = formatSongDuration(player.getDuration());
							songDuration = player.getDuration();
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

						getVideoData(currentSong);
					}
				}
			});
		}

		if (window.YT) {
			load();
		} else {
			window.onYouTubeIframeAPIReady = load;
		}
	});

	export function playMusicById(id: string, startSeconds = 0) {
		if (player && player.loadVideoById) {
			player.loadVideoById(id, startSeconds, 'small');
			currentSong = id;

			getVideoData(currentSong);
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
			muted = false;
		} else {
			player.mute();
			muted = true;
		}
	}

	export function setVolume() {
		player.setVolume(volume);
	}

	export function extractVideoId(url: string) {
		const regex =
			/(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);

		return match ? match[1] : null;
	}
</script>

<div id="player" class="hidden"></div>
<svelte:head>
	<script src="https://www.youtube.com/iframe_api"></script>
</svelte:head>

<div class="grid gap-4 px-8">
	<div class="grid gap-2">
		<h1 class="text-2xl font-semibold">Now playing</h1>
		<div class="flex items-center gap-4">
			<img
				src={thumbnail}
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
				on:click={toggleMute}
			>
				{#if muted}
					<span class="material-symbols-outlined text-sm"> volume_off </span>
				{:else}
					<span class="material-symbols-outlined text-sm"> volume_mute </span>
				{/if}
				<span class="sr-only">Toggle mute</span></button
			>
		</div>
		<div class="grid gap-2">
			<div class="flex items-center justify-between">
				<div class="text-xs text-gray-500 dark:text-gray-400">
					{formattedElapsed} / {formattedSongDuration}
				</div>
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
			<input
				type="range"
				min="0"
				max={songDuration}
				step="1"
				bind:value={elapsed}
				class="w-full"
				disabled
			/>
		</div>
	</div>
	<div class="grid gap-2">
		<h2 class="text-lg font-semibold">Volume</h2>
		<div class="flex items-center">
			<input type="range" on:input={setVolume} bind:value={volume} />
		</div>
	</div>
</div>
