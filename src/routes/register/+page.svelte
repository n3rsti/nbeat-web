<script lang="ts">
	import { goto } from '$app/navigation';
	import { API } from '$lib/data';

	let username: string = '';
	let password: string = '';

	let error = '';

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();

		const request = await API.register(username, password);
		if (request.status === 201) {
			goto('/login');
		} else {
			error = 'error';
		}
	}
</script>

<h1>Register</h1>
<form action="" on:submit={handleRegister}>
	<input type="text" bind:value={username} />
	<input type="password" bind:value={password} />
	<button>Register</button>
</form>
{error}
