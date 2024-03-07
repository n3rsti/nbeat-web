import { writable, type Writable } from 'svelte/store';

function createPersistentStore(key: string, startValue: string): Writable<string> {
	const item = localStorage.getItem(key);
	const initialValue: string = item ? item : startValue;

	const store: Writable<string> = writable(initialValue);

	// Subscribe to the store's changes and update localStorage accordingly
	store.subscribe((value: string) => {
		localStorage.setItem(key, value);
	});

	return store;
}

export { createPersistentStore };
