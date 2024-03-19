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

<!--
// v0 by Vercel.
// https://v0.dev/t/0jpodu8ukJh
-->
<div class="flex items-center min-h-screen px-6">
	<div class="w-full max-w-sm space-y-4 mx-auto">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Login</h1>
			<p class="text-gray-500 dark:text-gray-400">
				Enter your email below to login to your account
			</p>
		</div>
		<form class="space-y-4" on:submit={handleLogin}>
			<div class="space-y-2">
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					for="username">Username</label
				><input
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="username"
					placeholder="Enter username..."
					required
					type="text"
					bind:value={username}
				/>
			</div>
			<div class="space-y-2">
				<div class="flex items-center">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="password">Password</label
					>
				</div>
				<input
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="password"
					required
					type="password"
					bind:value={password}
				/>
			</div>
			<button
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
				type="submit"
			>
				Login
			</button>
		</form>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a class="underline" href="/register"> Sign up </a>
		</div>
	</div>
</div>
