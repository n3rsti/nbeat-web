<script lang="ts">
	import { page } from '$app/stores';
	import Player from '$lib/Player.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { API } from '$lib/data';
	import { ChannelModel, ChannelBuilder } from '$lib/models/channel.model';
	import { MessageBuilder, type MessageModel } from '$lib/models/message.model';
	import { SongBuilder } from '$lib/models/song.model';
	import { onMount, tick } from 'svelte';
	import { createPersistentStore } from '../../../stores';
	import { decodeJwt } from '$lib/jwt';

	let ws: WebSocket;
	let id = $page.params.id;
	const wsUrl = `ws://localhost:8080/ws/channel/${id}`;

	const tokenStore = createPersistentStore('accessToken', '');
	let token = '';
	let user = '';
	let authorized = false;
	let subscribed = false;

	let channel: ChannelModel = new ChannelBuilder();
	let message: string = '';

	let player: Player;

	let chatElement: HTMLElement;

	tokenStore.subscribe((value) => {
		token = value;
		const decodedJwt = decodeJwt(token);
		user = decodedJwt?.id || '';
		authorized = token !== '';
	});

	async function addMessage(message: MessageModel) {
		channel.messages = [...channel.messages, message];
		scrollDown();
	}

	async function handleNewMessage(data: any) {
		const { content, author, id, type } = data;
		let song = null;

		if (type === 'song') {
			const songData = content;
			song = new SongBuilder()
				.setId(songData.id)
				.setSongId(songData.song_id)
				.setDuration(songData.duration)
				.setName(songData.title)
				.setThumbnail(songData.thumbnail)
				.setStartTime(songData.song_start_time)
				.build();
		}

		const newMessage = new MessageBuilder()
			.setId(id)
			.setAuthor(author)
			.setContent(content)
			.setType(type)
			.setSong(song || new SongBuilder().build())
			.build();

		addMessage(newMessage);
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

	function handleWebsocketConnection() {
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			const accessToken = localStorage.getItem('accessToken');
			if (accessToken) {
				ws.send(`Bearer ${accessToken}`);
			}
		};
		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.type === 'song') {
				handleNewSong(data);
			}

			handleNewMessage(data);
		};
		ws.onerror = (error) => console.error('WebSocket error:', error);
		ws.onclose = () => console.log('WebSocket connection closed');
	}

	onMount(async () => {
		try {
			const data: ChannelModel = await API.getChannel(id);
			channel = data;

			scrollDown();

			const secondsElapsed = (Date.now() - channel.lastSong.startTime) / 1000;
			player.playSong(channel.lastSong, secondsElapsed);
			player.addToQueue(...channel.queue);

			handleWebsocketConnection();
		} catch (err) {
			console.error(err);
		}
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

	async function subscribe() {
		subscribed = true;

		const response = await API.subscribeToChannel(channel.id);
		if (response.status !== 200) {
			subscribed = false;
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
			<div class="flex gap-4">
				<h1 class="text-2xl font-bold">{channel.name}</h1>
				{#if authorized && channel.owner != user && subscribed === false}
					<button
						on:click={subscribe}
						class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 rounded-md px-4 py-2"
					>
						Subscribe
					</button>
				{:else if subscribed}
					<button
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-gray-100 h-10 px-4 py-2 bg-gray-50"
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
							class="h-4 w-4"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						<span class="ml-2"> Subscribed </span>
					</button>
				{/if}
			</div>
		</div>
		<Nav />
	</header>

	<Player bind:this={player} />
	<h2 class="px-8 mb-4 text-xl font-semibold">Chat</h2>
	<div bind:this={chatElement} class="flex flex-grow pt-4 px-8 overflow-y-auto custom-scrollbar">
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
							<p class="break-all">
								{message.content}
							</p>
						</div>
					{:else if message.type === 'song'}
						<div>
							<div class="text-xs text-gray-500 dark:text-gray-400">
								{message.humanReadableTimestamp}
							</div>
							<div class="flex gap-3 items-center flex-wrap">
								<span class="text-gray-700">Added to queue</span>
								<div class="flex gap-4">
									<img
										src={message.song.thumbnail}
										class="w-6 h-6 object-cover rounded-lg"
										alt=""
									/>
									<span class="font-semibold">
										{message.song.name}
										<span class="text-xs text-gray-500">
											({message.song.readableDuration})
										</span>
									</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	{#if authorized}
		<div class="w-full flex items-center justify-center bg-white mt-4">
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
