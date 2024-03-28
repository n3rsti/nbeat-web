<script lang="ts">
	import { type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createPersistentStore, user } from '../../stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Exit } from 'svelte-radix';
	import { tick } from 'svelte';

	async function logout() {
		createPersistentStore('accessToken', '').set('');
		await tick();
		localStorage.removeItem('accessToken');
		goto('/login');
	}
</script>

<header class="flex items-center h-[60px] px-4 border-b md:px-8 md:pl-16 relative">
	<div class="flex flex-1 mr-4 flex-row items-center gap-6">
		<a class="inline-flex justify-center items-center gap-2 text-xl font-semibold" href="/">
			<span class="material-symbols-outlined text-gray-700"> home </span>
			Home
		</a>
	</div>
	<div class="flex gap-4 items-center justify-center">
		<div
			class="flex items-center gap-2 text-sm font-medium rounded-md hover:underline focus-visible:outline-none dark:hover:underline"
		>
			{#if $user == ''}
				<Button href="/login" class="mr-8">Login</Button>
			{:else}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<button class="flex items-center">
							{$user}
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
								class="ml-2 w-4 h-4 opacity-60"
							>
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item class="flex gap-2 cursor-pointer" on:click={logout}
								><Exit class="w-4 h-4 opacity-60" />
								Log out
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	</div>
</header>
