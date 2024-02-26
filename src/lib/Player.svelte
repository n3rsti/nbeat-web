<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let ws: WebSocket;
	let id: string = '';

	let player: YT.Player;

	let messages: string[] = [];

	onMount(() => {
		if (
			!document.querySelector('script[src="https://www.youtube.com/iframe_api?mute=1&controls=0"]')
		) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			document.head.appendChild(tag);

			window.onYouTubeIframeAPIReady = () => {
				player = new YT.Player('player', {
					height: '390',
					width: '640',
					videoId: '', // Replace with your video ID
					events: {
						onStateChange: (event) => {
							if (event.data === YT.PlayerState.PLAYING) {
								console.log(`Video Duration: ${player.getDuration()} seconds`);
							}
						}
					}
				});
			};
		}

		id = $page.params.id;

		const wsUrl = `ws://localhost:8080/ws/channel/${id}`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => console.log('WebSocket connection established');
		ws.onmessage = (event) => {
			console.log('Message received:', event.data);
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
