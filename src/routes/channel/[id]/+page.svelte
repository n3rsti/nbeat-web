<script lang="ts">
	import { page } from '$app/stores';
	import Player from '$lib/Player.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { API } from '$lib/data';
	import { ChannelModel, ChannelBuilder } from '$lib/models/channel.model';
	import { MessageBuilder, type MessageModel } from '$lib/models/message.model';
	import { SongBuilder, SongModel } from '$lib/models/song.model';
	import { onMount, tick } from 'svelte';
	import { createPersistentStore } from '../../../stores';
	import { get } from 'svelte/store';

	let ws: WebSocket;

	let id = $page.params.id;
	let player: Player;

	let message: string = '';

	let channel: ChannelModel = new ChannelBuilder();
	let chatElement: HTMLElement;

	const token = createPersistentStore('accessToken', '');
	let authorized = get(token) !== '';

	async function addMessage(message: MessageModel) {
		channel.messages = [...channel.messages, message];

		console.log(channel.messages);
		scrollDown();
	}

	async function handleNewMessage(data: any) {
		const content = data.content;
		const author = data.author;
		const id = data.id;
		const type = data.type;
		const songData = data.content;
		let song = new SongBuilder().build();

		if (type === 'song') {
			song = new SongBuilder()
				.setId(songData.id)
				.setSongId(songData.song_id)
				.setDuration(songData.duration)
				.setName(songData.title)
				.setThumbnail(songData.thumbnail)
				.setStartTime(songData.song_start_time)
				.build();
		}

		const message = new MessageBuilder()
			.setId(id)
			.setAuthor(author)
			.setContent(content)
			.setType(type)
			.setSong(song)
			.build();

		addMessage(message);
	}

	function handleNewSong(data: any) {
		const songData = data.content;

		const song = new SongBuilder()
			.setId(songData.id)
			.setSongId(songData.song_id)
			.setDuration(songData.duration)
			.setName(songData.title)
			.setThumbnail(songData.thumbnail)
			.setStartTime(songData.song_start_time)
			.build();

		player.addToQueue(song);
	}

	function handleWebsocketConnection(id: string) {
		const wsUrl = `ws://localhost:8080/ws/channel/${id}`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			const accessToken = localStorage.getItem('accessToken');
			if (accessToken) {
				ws.send(`Bearer ${accessToken}`);
			}
		};
		ws.onmessage = (event) => {
			console.log(event.data);
			const data = JSON.parse(event.data);
			console.log(data);

			if (data.type === 'song') {
				handleNewSong(data);
			}

			handleNewMessage(data);
		};
		ws.onerror = (error) => console.error('WebSocket error:', error);
		ws.onclose = () => console.log('WebSocket connection closed');

		return () => {
			ws.close();
		};
	}

	onMount(() => {
		API.getChannel(id)
			.then((data: ChannelModel) => {
				channel = data;

				scrollDown();

				const secondsElapsed = (Date.now() - channel.lastSong.startTime) / 1000;

				console.log('c', channel.lastSong);
				player.playSong(channel.lastSong, secondsElapsed);
				player.addToQueue(...channel.queue);
			})
			.catch((err) => {
				console.log(err);
			});

		id = $page.params.id;

		handleWebsocketConnection(id);
	});

	async function scrollDown() {
		if (chatElement) {
			await tick();
			chatElement.scrollTop = chatElement.scrollHeight;
		}
	}

	function sendMessage(event: SubmitEvent) {
		event.preventDefault();
		if (message) {
			ws.send(message);
			message = '';
		}
	}
</script>

<!--
// v0 by Vercel.
// https://v0.dev/t/sk10Pyu7PnP
-->
<div class="p-8 h-screen flex flex-col">
	<header class="flex justify-between items-center px-8 mb-4">
		<div class="flex items-center gap-4">
			<!-- <img
					src="/placeholder.svg"
					width="80"
					height="80"
					alt="Channel logo"
					class="rounded-full aspect-square object-cover border"
				/> -->
			<div class="grid gap-1.5">
				<h1 class="text-2xl font-bold">{channel.name}</h1>
				<div class="flex items-center gap-2 text-sm">
					<button
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-9 rounded-md px-3"
					>
						Subscribe
					</button>
					<button
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
					>
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
							class="w-4 h-4"
						>
							<path
								d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
							></path>
						</svg>
						Like
					</button>
					<button
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
					>
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
							class="w-4 h-4"
						>
							<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
							<polyline points="16 6 12 2 8 6"></polyline>
							<line x1="12" x2="12" y1="2" y2="15"></line>
						</svg>
						Share
					</button>
				</div>
			</div>
		</div>
		<Nav />
	</header>

	<Player bind:this={player} />
	<h2 class="px-8 mb-4 text-xl font-semibold">Chat</h2>
	<div bind:this={chatElement} class="flex flex-grow pt-4 px-8 overflow-y-auto mb-16">
		<div class="flex flex-col gap-4">
			{#each channel.messages as message}
				<div class="flex items-start gap-2">
					<!-- <img
								width="32"
								height="32"
								alt="Avatar"
								class="rounded-full object-cover"
								style="aspect-ratio: 32 / 32; object-fit: cover;"
							/> -->

					{#if message.type === 'message'}
						<div>
							<div class="flex items-center gap-2">
								<div class="font-semibold">{message.author}</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">
									{message.humanReadableTimestamp}
								</div>
							</div>
							<p>
								{message.content}
							</p>
						</div>
					{:else if message.type === 'song'}
						<div>
							<div class="text-xs text-gray-500 dark:text-gray-400">
								{message.humanReadableTimestamp}
							</div>
							<div class="flex gap-3 items-center">
								<span class="text-gray-700"> Now playing </span>
								<img src={message.song.thumbnail} class="w-6 h-6 object-cover rounded-lg" alt="" />
								<span class="font-semibold">
									{message.song.name}
								</span>
								<span class="text-xs text-gray-500">
									({message.song.readableDuration})
								</span>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
		{#if authorized}
			<div
				class="fixed left-0 bottom-0 w-screen h-20 flex items-center justify-center bg-white px-16"
			>
				<form action="" on:submit={sendMessage} class="w-full flex items-center justify-center">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only"
						for="message"
					>
						Message
					</label>

					<input
						type="text"
						id="default-input"
						class="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder:text-black w-full"
						placeholder="Type your message..."
						bind:value={message}
						autocomplete="off"
					/>
				</form>
			</div>
		{/if}
	</div>
</div>
