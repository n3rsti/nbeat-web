<script lang="ts">
	import { goto } from '$app/navigation';
	import { API } from '$lib/data';
	import { createPersistentStore } from '../../stores';

	let username: string = '';
	let password: string = '';

	let error = '';

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		const request = await API.login(username, password);
		if (request.status === 200) {
			const data = await request.json();
			const accessToken = data.access_token;
			console.log(accessToken);

			createPersistentStore('accessToken', accessToken);

			goto('/');
		} else {
			error = 'error';
		}
	}
</script>

<h1>Login</h1>
<form action="" on:submit={handleLogin}>
	<input type="text" bind:value={username} />
	<input type="password" bind:value={password} />
	<button class="text-2xl">Login</button>
</form>
{error}
