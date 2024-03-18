<script lang="ts">
	import { onMount } from 'svelte';
	import { createPersistentStore, pageTitle } from '../../stores';
	import { type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { decodeJwt } from '$lib/jwt';

	let accessTokenStore: Writable<string>;
	let user = '';

	onMount(() => {
		accessTokenStore = createPersistentStore('accessToken', '');
		accessTokenStore.subscribe((value) => {
			const decodedJwt = decodeJwt(value);
			user = decodedJwt?.id || '';
		});
	});

	function logout() {
		accessTokenStore.set('');
		goto('/login');
	}
</script>

<header class="flex items-center h-[60px] px-4 border-b md:px-8 md:pl-16">
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
			{user}
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
				class="w-4 h-4 ml-auto opacity-60"
			>
				<path d="m6 9 6 6 6-6"></path>
			</svg>
		</div>
		<!-- <div
			class="mt-2 w-56 py-1.5 flex flex-col gap-1 rounded-lg border shadow-lg absolute top-full right-0 bg-gray-50 p-0 text-xs z-10 dark:bg-gray-950"
		>
			<div>
				<a
					class="flex gap-2 px-3.5 py-1.5 rounded-md hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50"
					href="#"
				>
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
						class="w-4 h-4 opacity-60"
					>
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
					</svg>
					Profile
				</a>
			</div>
			<div>
				<a
					class="flex gap-2 px-3.5 py-1.5 rounded-md hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50"
					href="#"
				>
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
						class="w-4 h-4 opacity-60"
					>
						<path
							d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
						></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
					Settings
				</a>
			</div>
			<div>
				<a
					class="flex gap-2 px-3.5 py-1.5 rounded-md hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50"
					href="#"
				>
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
						class="w-4 h-4 opacity-60"
					>
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
						<polyline points="16 17 21 12 16 7"></polyline>
						<line x1="21" x2="9" y1="12" y2="12"></line>
					</svg>
					Log out
				</a>
			</div>
		</div>
	</div> -->
	</div>
</header>
