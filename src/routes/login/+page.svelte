<script lang="ts">
	import { API } from '$lib/data';

	let username: string = '';
	let password: string = '';

	async function handleLogin() {
		console.log(username, password);

		const request = await API.login(username, password);
		if (request.status === 200) {
			const data = await request.json();
			const accessToken = data.access_token;

			localStorage.setItem('accessToken', accessToken);
		}
	}
</script>

<input type="text" bind:value={username} />
<input type="password" bind:value={password} />
<button on:click={handleLogin}>Login</button>
