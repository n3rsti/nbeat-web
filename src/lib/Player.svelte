<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { SongBuilder, SongModel } from './models/song.model';
	import songPlaceholder from '$lib/assets/song-placeholder.png';

	interface QueuedMusic {
		id: string;
		timestamp: number;
	}

	let currentSong: SongModel = new SongBuilder()
		.setName('Nothing playing...')
		.setThumbnail(songPlaceholder)
		.build();

	let muted = true;
	let volume = 20;
	let elapsed = 0;
	let formattedElapsed = '00:00';

	let player: YT.Player;

	let queue: QueuedMusic[] = [];

	onDestroy(() => {
		if (player && player.destroy) {
			player.destroy();
		}
	});

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

	setInterval(() => {
		if (player && player.getCurrentTime && player.getPlayerState() === YT.PlayerState.PLAYING) {
			elapsed = Math.ceil(player.getCurrentTime());
		} else if (player && player.getPlayerState() === YT.PlayerState.ENDED) {
			elapsed = currentSong.durationSeconds;
		}

		formattedElapsed = formatSongDuration(elapsed);
	}, 1000);

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
					onReady: () => {
						if (queue.length > 0) {
							const song = queue.shift();
							if (song) {
								playSongById(song.id, song.timestamp);
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
	});

	export function playSongById(id: string, startSeconds = 0) {
		if (player && player.loadVideoById) {
			player.loadVideoById(id, startSeconds, 'small');
		} else {
			queue = [...queue, { id: id, timestamp: startSeconds }];
		}
	}

	export function playSong(song: SongModel, startSeconds: number = 0) {
		playSongById(song.id, startSeconds);
		currentSong = song;
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
		if (player.isMuted()) {
			toggleMute();
		}
	}
</script>

<div id="player" class="hidden"></div>
<svelte:head>
	<script src="https://www.youtube.com/iframe_api"></script>
</svelte:head>

<div class="grid gap-4 px-8 my-8">
	<div class="grid gap-2">
		<div class="flex items-center gap-4">
			<img
				src={currentSong.thumbnail}
				width="100"
				height="100"
				alt="Album art"
				class="rounded-lg"
				style="aspect-ratio: 100 / 100; object-fit: cover;"
			/>
			<div class="grid gap-1.5">
				<h2 class="text-xl font-semibold">{currentSong.name}</h2>
				<!-- 				<p class="text-sm text-gray-500 dark:text-gray-400">{songDescription}</p> -->
			</div>
		</div>
	</div>
	<div class="grid gap-2">
		<div class="grid gap-2">
			<div class="flex items-center justify-between">
				<div class="text-xs text-gray-500 dark:text-gray-400">
					{formattedElapsed} / {currentSong.readableDuration}
				</div>
			</div>
			<div class="flex">
				<input
					type="range"
					min="0"
					max={currentSong.durationSeconds}
					step="1"
					bind:value={elapsed}
					class="w-1/3 bg-blue-200"
					disabled
				/>

				<button on:click={toggleMute} class="flex items-center justify-center">
					{#if muted}
						<span class="material-symbols-outlined mx-4 text-gray-600"> volume_off</span>
					{:else}
						<span class="material-symbols-outlined mx-4 text-gray-600"> volume_up </span>
					{/if}
				</button>

				<input
					type="range"
					min="0"
					max="100"
					step="1"
					class="w-32"
					on:input={setVolume}
					bind:value={volume}
				/>
			</div>
		</div>
	</div>
</div>
