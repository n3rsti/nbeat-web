<script lang="ts">
	import { onMount } from 'svelte';
	import { createPersistentStore } from '../../stores';
	import { type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	let accessTokenStore: Writable<string>;

	onMount(() => {
		accessTokenStore = createPersistentStore('accessToken', '');
	});

	function logout() {
		accessTokenStore.set('');
		goto('/login');
	}
</script>

<nav class="flex items-center gap-4 overflow-hidden">
	<a href="/">Home</a>
	{#if $accessTokenStore == ''}
		<a
			class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
			href="/login"
		>
			Log in
		</a>

		<a
			class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
			href="/register"
		>
			Register
		</a>
	{:else}
		<button
			on:click={logout}
			class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
		>
			Log out
		</button>
	{/if}
</nav>
