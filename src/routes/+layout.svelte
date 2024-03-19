<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { createPersistentStore, user } from '../stores';
	import { decodeJwt } from '$lib/jwt';

	onMount(() => {
		const accessTokenStore = createPersistentStore('accessToken', '');
		accessTokenStore.subscribe((value) => {
			const decodedJwt = decodeJwt(value);
			$user = decodedJwt?.id || '';
		});
	});
</script>

<slot />
