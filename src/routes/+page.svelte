<script lang="ts">
	import { goto } from '$app/navigation';
	import Nav from '$lib/components/Nav.svelte';
	import { API } from '$lib/data';
	import { ChannelBuilder, type ChannelModel } from '$lib/models/channel.model';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import Button from '$lib/components/ui/button/button.svelte';
	import { user } from '../stores';

	let channelName = '';
	let channelDescription = '';

	let followedChannels: ChannelModel[] = [];

	async function createChannel(event: SubmitEvent) {
		event.preventDefault();

		const newChannel = new ChannelBuilder()
			.setName(channelName)
			.setDescription(channelDescription)
			.build();
		const request = await API.createChannel(newChannel);
		if (request.status === 201) {
			const data = await request.json();
			goto(`channel/${data._id}`);
		}
	}

	$: {
		if ($user) {
			API.getUserFollowedChannels($user)
				.then((data: ChannelModel[]) => {
					followedChannels = data;
					console.log(data);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}
</script>

<Nav />
<div class="w-full p-8 md:px-16">
	<div class="flex mb-10 items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">Followed Channels</h1>

		<Dialog.Root>
			<Dialog.Trigger>
				<button
					class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-white hover:bg-zinc-900/90 h-11 rounded-md px-8"
				>
					Create Channel
				</button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create a new channel</Dialog.Title>
					<Dialog.Description>
						This action will create a new music channel for you.
					</Dialog.Description>
				</Dialog.Header>

				<form action="" on:submit={createChannel}>
					<Label for="name">Channel name</Label>
					<Input
						name="name"
						class="mt-2 mb-3"
						placeholder="Enter channel name."
						bind:value={channelName}
					/>

					<Label for="name">Description</Label>
					<Textarea
						placeholder="Enter short description."
						class="mt-2 mb-2"
						rows={3}
						bind:value={channelDescription}
					/>
					<div class="flex justify-end">
						<Button class="ml-auto px-5" type="submit">Create</Button>
					</div>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
		{#each followedChannels as channel}
			<a
				href="/channel/{channel.id}"
				class="rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-gray-50 transition-colors duration-75"
				data-v0-t="card"
			>
				<div class="p-4 h-full">
					<div class="flex flex-col justify-between gap-2 w-full h-full">
						<div class="flex items-center gap-2">
							<div class="flex flex-col">
								<h3 class="font-semibold">{channel.name}</h3>
								<p class="text-sm text-muted-foreground h-fit">
									{channel.description}
								</p>
							</div>
						</div>
						<div class="flex flex-col gap-2">
							{#if channel.lastSong.id}
								<div class="flex items-center gap-2">
									{#if channel.lastSong.isPlaying}
										<span class="material-symbols-outlined text-xl text-muted-foreground">
											headphones
										</span>
										<span class="text-sm text-gray-900 font-semibold">Now playing </span>
									{:else}
										<span class="material-symbols-outlined text-xl text-muted-foreground">
											artist
										</span>
										<span class="text-sm text-gray-900 font-semibold">Last played</span>
									{/if}
								</div>
								<div class="grid grid-cols-[auto_1fr] items-center gap-2 w-full">
									<img
										src={channel.lastSong.thumbnail}
										class="w-6 h-6 object-cover rounded-lg"
										alt=""
									/>
									<span
										class="text-sm text-gray-500 whitespace-nowrap overflow-hidden overflow-ellipsis"
									>
										{channel.lastSong.name}
									</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
