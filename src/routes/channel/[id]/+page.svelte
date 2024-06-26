<script lang="ts">
	import { page } from '$app/stores';
	import Player from '$lib/Player.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { API } from '$lib/data';
	import { ChannelModel, ChannelBuilder } from '$lib/models/channel.model';
	import { MessageBuilder, type MessageModel } from '$lib/models/message.model';
	import { SongBuilder } from '$lib/models/song.model';
	import { onMount, tick } from 'svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { user } from '../../../stores';
	import { goto } from '$app/navigation';

	let ws: WebSocket;
	let channelId = $page.params.id;
	const wsUrl = `ws://localhost:8080/ws/channel/${channelId}`;

	$: authorized = $user !== '';
	let subscribed = false;

	let channel: ChannelModel = new ChannelBuilder().setName('.');
	let message: string = '';

	let loaded = false;

	let player: Player;

	let chatElement: HTMLElement;

	async function addMessage(message: MessageModel) {
		channel.messages = [...channel.messages, message];
		scrollDown();
	}

	async function deleteChannel() {
		const response = await API.deleteChannel(channelId);

		if (response.status === 204) {
			goto('/');
		}
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
				ws.send(JSON.stringify({ type: 'auth', content: `Bearer ${accessToken}` }));
			}
		};
		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.type === 'song') {
				handleNewSong(data);
			} else if (data.type === 'time') {
				player.changeElapsed(Number(data.content));
				return;
			}

			handleNewMessage(data);
		};
		ws.onerror = (error) => console.error('WebSocket error:', error);
		ws.onclose = () => console.log('WebSocket connection closed');
	}

	onMount(async () => {
		try {
			const data: ChannelModel = await API.getChannel(channelId);
			channel = data;

			await API.getUserFollowedChannelIds($user)
				.then((data: string[]) => {
					subscribed = data.includes(channelId);
				})
				.catch((error: Error) => {
					console.error(error);
				});

			scrollDown();

			const secondsElapsed = (Date.now() - channel.lastSong.startTime) / 1000;
			if (channel.lastSong.id) {
				player.playSong(channel.lastSong, secondsElapsed);
			}
			player.addToQueue(...channel.queue);

			handleWebsocketConnection();
		} catch (err) {
			console.error(err);
		}

		loaded = true;
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
			ws.send(JSON.stringify({ type: 'text', content: message }));
			message = '';
		}
	}

	function changeSongTime(event: CustomEvent<number>) {
		ws.send(JSON.stringify({ type: 'time', content: event.detail }));
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

<div class="h-screen flex flex-col">
	<Nav />
	<div class="p-8 flex flex-col flex-1 overflow-auto">
		<header class="flex flex-col justify-center px-8 mb-4">
			<div class="flex items-center gap-4 w-full">
				<div class="flex justify-between gap-4 w-full">
					<h1 class="text-2xl font-bold">{channel.name}</h1>
					{#if loaded && authorized && channel.owner != $user && subscribed === false}
						<Button on:click={subscribe}>Subscribe</Button>
					{:else if loaded && subscribed && channel.owner != $user}
						<Button variant="outline">
							<span class="material-symbols-outlined text-primary text-base mr-2"> done </span>
							Subscribed
						</Button>
					{:else if channel.owner == $user}
						<Dialog.Root>
							<Dialog.Trigger>
								<Button variant="destructive">Delete channel</Button>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Delete channel</Dialog.Title>
									<Dialog.Description>
										Are you sure you want to delete the channel <strong>{channel.name}</strong>?
									</Dialog.Description>
								</Dialog.Header>
								<Dialog.Footer>
									<Button type="submit" variant="destructive" on:click={deleteChannel}
										>Delete</Button
									>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					{/if}
				</div>
			</div>
			<p class="text-sm text-muted-foreground">
				{channel.description}
			</p>
		</header>

		<Player bind:this={player} on:changeSongTime={changeSongTime} />
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
</div>
