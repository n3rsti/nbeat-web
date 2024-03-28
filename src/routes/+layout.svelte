<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { user, jwtStore } from '../stores';
	import { decodeJwt } from '$lib/jwt';

	onMount(() => {
		jwtStore.subscribe((value) => {
			if (value !== '') {
				const decodedJwt = decodeJwt(value);
				$user = decodedJwt?.id || '';
			}
		});
	});

	$: console.log('store', $jwtStore);
</script>

<slot />
