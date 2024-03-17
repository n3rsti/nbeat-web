<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { SongBuilder, SongModel } from './models/song.model';
	import songPlaceholder from '$lib/assets/song-placeholder.png';

	let currentSong: SongModel = new SongBuilder()
		.setName('Nothing playing...')
		.setThumbnail(songPlaceholder)
		.setStartTime(0)
		.build();

	let muted = true;
	let volume = 20;
	let elapsed = 0;
	let formattedElapsed = '00:00';

	let player: YT.Player;

	let queue: SongModel[] = [];

	$: console.log('QUEUE', queue);

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
			elapsed = currentSong.duration;
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
						if (currentSong) {
							const ts = new Date().getTime();
							const elapsed = (ts - currentSong.startTime) / 1000;
							playSong(currentSong, elapsed);
						}
					},
					onStateChange: (event) => {
						if (event.data === YT.PlayerState.ENDED) {
							const song = queue.shift();
							queue = queue;
							if (song) {
								const ts = new Date().getTime();
								const elapsed = (ts - song.startTime) / 1000;
								playSong(song, elapsed);
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

	export function playSong(song: SongModel, startSeconds: number = 0) {
		console.log(song);
		currentSong = song;

		if (player && player.loadVideoById) {
			player.loadVideoById(song.songId, startSeconds, 'small');
		}
	}

	export function addToQueue(...songs: SongModel[]) {
		const ts = new Date().getTime();

		const PLAYING = currentSong.startTime + currentSong.duration * 1000 > ts;
		if (queue.length > 0 || PLAYING) {
			queue = [...queue, ...songs];
		} else if (songs.length > 0) {
			playSong(songs[0]);
		}
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

<div class="flex flex-col md:flex-row">
	<div class="grid gap-4 px-8 my-8 w-full md:w-[700px]">
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
					<h2 class="text-xl font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap">
						{currentSong.name}
					</h2>
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
						max={currentSong.duration}
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
	<div class="w-full md:w-[600px] max-w-3xl p-4 border rounded-lg flex flex-col gap-4">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2 w-full">
				<div class="bg-gray-100 rounded-lg p-1 min-w-[64px]">
					<img
						src={currentSong.thumbnail}
						width="64"
						height="64"
						class="rounded-lg"
						alt="Album cover"
						style="aspect-ratio: 64 / 64; object-fit: cover;"
					/>
				</div>
				<div class="flex flex-col max-w-[60%]">
					<h3 class="text-sm font-bold text-blue-600 overflow-hidden whitespace-nowrap">
						{currentSong.name}
					</h3>
				</div>

				<p class="ml-auto text-sm text-gray-500">{currentSong.readableDuration}</p>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-2 w-full">
			{#each queue as song}
				<div class="grid grid-cols-[4fr_1fr] items-center justify-between gap-2">
					<div class="flex items-center gap-2">
						<img
							src={song.thumbnail}
							width="32"
							height="32"
							class="rounded-lg"
							alt="Album cover"
							style="aspect-ratio: 32 / 32; object-fit: cover;"
						/>
						<div class="flex flex-col">
							<h3 class="text-sm font-bold whitespace-nowrap overflow-hidden overflow-ellipsis">
								{song.name}
							</h3>
						</div>
					</div>
					<p class="ml-auto text-sm text-gray-500">{song.readableDuration}</p>
				</div>
			{/each}
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2"></div>
			</div>
		</div>
	</div>
</div>
