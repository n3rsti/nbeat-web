<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	interface QueuedMusic {
		id: string;
		timestamp: number;
	}

	let ws: WebSocket;
	let id: string = '';

	let player: YT.Player;

	let messages: string[] = [];
	let queue: QueuedMusic[] = [];

	onMount(() => {
		if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			document.head.appendChild(tag);

			window.onYouTubeIframeAPIReady = () => {
				player = new YT.Player('player', {
					height: '600',
					width: '400',
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
			};
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
		if (player) {
			player.loadVideoById(id, startSeconds, 'small');
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
<ul>
	{#each messages as message}
		<li>{message}</li>
	{/each}
</ul>
