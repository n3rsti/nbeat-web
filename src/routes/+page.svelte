<script lang="ts">
	import { goto } from '$app/navigation';
	import Nav from '$lib/components/Nav.svelte';
	import { API } from '$lib/data';
	import type { ChannelModel } from '$lib/models/channel.model';
	import { onMount } from 'svelte';
	import { pageTitle } from '../stores';

	let channelName = '';

	let followedChannels: ChannelModel[] = [];

	async function createChannel(event: SubmitEvent) {
		event.preventDefault();

		const request = await API.createChannel(channelName);
		if (request.status === 201) {
			const data = await request.json();
			goto(`channel/${data._id}`);
		}
	}

	onMount(async () => {
		pageTitle.set('Home');
		await API.getUserFollowedChannels('n3rstix').then((data: ChannelModel[]) => {
			followedChannels = data;
		});
	});
</script>

<Nav />
<!-- <form action="" on:submit={createChannel}> -->
<!-- 	<input type="text" bind:value={channelName} /> -->
<!-- 	<button>Create</button> -->
<!-- </form> -->

<div class="w-full p-8 md:px-16">
	<div class="flex mb-10 items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">Followed Channels</h1>
		<button
			class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-white hover:bg-zinc-900/90 h-11 rounded-md px-8"
		>
			Create Channel
		</button>
	</div>

	<div class="grid grid-cols-4 gap-4">
		{#each followedChannels as channel}
			<a
				href="/channel/{channel.id}"
				class="rounded-lg border bg-card text-card-foreground shadow-sm"
				data-v0-t="card"
			>
				<div class="p-4 hover:bg-gray-50 transition-colors duration-75">
					<div class="grid gap-2">
						<div class="flex items-center gap-2">
							<div class="flex flex-col">
								<h3 class="font-semibold">{channel.name}</h3>
							</div>
						</div>
						<div class="grid gap-2">
							<div class="flex items-center gap-2">
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
									class="w-4 h-4 opacity-60"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg
								><span class="text-sm text-gray-900 font-semibold"> Now playing </span>
							</div>
							<div class="flex items-center gap-2">
								<img
									src={channel.lastSong.thumbnail}
									class="w-6 h-6 object-cover rounded-lg"
									alt=""
								/>
								<span class="text-sm text-gray-500">
									{channel.lastSong.name}
								</span>
							</div>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
