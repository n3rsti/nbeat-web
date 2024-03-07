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

<nav>
	<a href="/">Home</a>
	{#if $accessTokenStore == ''}
		<a href="/login">Login</a>
		<a href="/register">Register</a>
	{:else}
		<button on:click={logout}>Logout</button>
	{/if}
</nav>
