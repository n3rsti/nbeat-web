import { browser } from '$app/environment';
import { get, writable, type Writable } from 'svelte/store';

function createPersistentStore(key: string, startValue: string): Writable<string> {
	const item = localStorage.getItem(key);
	const initialValue: string = item ? item : startValue;

	const store: Writable<string> = writable(initialValue);

	store.subscribe((value: string) => {
		localStorage.setItem(key, value);
	});

	return store;
}

const user = writable('');

const storage = <T>(key: string, initValue: T): Writable<T> => {
	const store = writable(initValue);
	if (!browser) return store;

	const storedValueStr = localStorage.getItem(key);
	if (storedValueStr != null) store.set(JSON.parse(storedValueStr));

	store.subscribe((val) => {
		if ([null, undefined].includes(val)) {
			localStorage.removeItem(key)
		} else {
			if (typeof val === "string") {

				localStorage.setItem(key, val);
			} else {

				localStorage.setItem(key, JSON.stringify(val))
			}
		}
	})

	window.addEventListener('storage', () => {
		const storedValueStr = localStorage.getItem(key);
		if (storedValueStr == null) return;

		const localValue: T = JSON.parse(storedValueStr)
		if (localValue !== get(store)) store.set(localValue);
	});

	return store;
}


const stringStorage = (key: string, initValue: string): Writable<string> => {
	const store = writable(initValue);
	if (!browser) return store;

	const storedValueStr = localStorage.getItem(key);
	if (storedValueStr != null) store.set(storedValueStr);

	store.subscribe((val) => {
		localStorage.setItem(key, val);
	})

	window.addEventListener('storage', () => {
		const storedValueStr = localStorage.getItem(key);
		if (storedValueStr == null) return;

		const localValue = storedValueStr
		if (localValue !== get(store)) store.set(localValue);
	});

	return store;
}

const jwtStore = stringStorage("accessToken", "");

export { createPersistentStore, user, storage, stringStorage, jwtStore };
