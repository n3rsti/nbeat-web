<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { SongBuilder, SongModel } from './models/song.model';
	import songPlaceholder from '$lib/assets/song-placeholder.png';
	import { user } from '../stores';

	const dispatch = createEventDispatcher();

	$: authorized = $user !== '';

	let currentSong: SongModel = new SongBuilder()
		.setName('Nothing playing...')
		.setThumbnail(songPlaceholder)
		.setStartTime(0)
		.build();

	let muted = true;
	let volume = 20;
	let ready = false;
	$: {
		if (ready) {
			setVolume();
		}
	}

	let elapsed = 0;
	$: arrElapsed = [elapsed];

	let formattedElapsed = '00:00';

	let player: YT.Player;
	let queue: SongModel[] = [];

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

		return hours > 0
			? `${hours}:${paddedMinutes}:${paddedSeconds}`
			: `${paddedMinutes}:${paddedSeconds}`;
	}

	setInterval(updateElapsed, 1000);

	function updateElapsed() {
		if (player && player.getCurrentTime && player.getPlayerState() === YT.PlayerState.PLAYING) {
			elapsed = Math.ceil(player.getCurrentTime());
		} else if (
			player &&
			player.getPlayerState &&
			player.getPlayerState() === YT.PlayerState.ENDED
		) {
			elapsed = currentSong.duration;
		}

		if (elapsed <= currentSong.duration) {
			formattedElapsed = formatSongDuration(elapsed);
		} else {
			formattedElapsed = formatSongDuration(currentSong.duration);
		}
	}

	function onPlayerReady() {
		if (currentSong) {
			const ts = new Date().getTime();
			const elapsed = (ts - currentSong.startTime) / 1000;
			playSong(currentSong, elapsed);
		}
	}

	function onPlayerStateChange(event) {
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

	function loadYtPlayer() {
		player = new YT.Player('player', {
			height: '0',
			width: '0',
			videoId: '',
			playerVars: {
				autoplay: 1,
				controls: 1,
				mute: 1
			},
			events: {
				onReady: onPlayerReady,
				onStateChange: (event) => {
					onPlayerStateChange(event);
				}
			}
		});
	}

	onMount(() => {
		if (window.YT) {
			loadYtPlayer();
		} else {
			window.onYouTubeIframeAPIReady = loadYtPlayer;
		}
	});

	export function playSong(song: SongModel, startSeconds: number = 0) {
		elapsed = startSeconds;
		updateElapsed();
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
		} else {
			player.mute();
		}

		muted = !muted;
	}

	export function setVolume() {
		console.log(volume);
		if (player) {
			player.setVolume(volume);
			if (muted) {
				toggleMute();
			}
		}
	}

	function changeSongTime() {
		dispatch('changeSongTime', `${Number(arrElapsed) - elapsed}`);
	}

	export function changeElapsed(timeDiff: number) {
		elapsed += timeDiff;
		seekTo(elapsed);
	}

	function seekTo(seconds: number) {
		if (player) {
			player.seekTo(seconds, true);
		}
	}
</script>

<div id="player" class="hidden"></div>
<svelte:head>
	<script src="https://www.youtube.com/iframe_api"></script>
</svelte:head>

<div class="grid grid-cols-1 md:grid-cols-2">
	<div class="grid gap-4 px-8 my-8 w-full">
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
					<h2
						class="text-xl font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap"
						title={currentSong.name}
					>
						{currentSong.name}
					</h2>
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
						min={0}
						max={currentSong.duration}
						step={1}
						bind:value={arrElapsed}
						class="w-1/3"
						on:input={changeSongTime}
						disabled={!authorized}
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

					<!-- <Slider class="w-32" min={0} max={100} step={1} bind:value={arrVolume} /> -->
				</div>
			</div>
		</div>
	</div>
	<div class="p-4 border rounded-lg flex flex-col gap-4">
		<div class="flex items-center gap-4">
			<div class="grid grid-cols-queue gap-2 w-full items-center">
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
				<div class="flex flex-col">
					<h3
						class="text-sm font-bold text-blue-600 overflow-hidden whitespace-nowrap overflow-ellipsis"
						title={currentSong.name}
					>
						{currentSong.name}
					</h3>
				</div>

				<p class="ml-auto text-sm text-gray-500 px-4">{currentSong.readableDuration}</p>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-2 w-full overflow-y-auto max-h-[150px] custom-scrollbar">
			{#each queue as song}
				<div class="grid grid-cols-queue items-center gap-4">
					<div class="flex items-center gap-2">
						<img
							src={song.thumbnail}
							width="32"
							height="32"
							class="rounded-lg"
							alt="Album cover"
							style="aspect-ratio: 32 / 32; object-fit: cover;"
						/>
					</div>
					<div class="flex flex-col">
						<h3
							class="text-sm font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis"
							title={song.name}
						>
							{song.name}
						</h3>
					</div>
					<p class="ml-auto text-sm text-gray-500 px-4">{song.readableDuration}</p>
				</div>
			{/each}
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2"></div>
			</div>
		</div>
	</div>
</div>
