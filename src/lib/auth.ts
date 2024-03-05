import { browser } from "$app/environment";
import { writable } from "svelte/store";

export const jwtToken = writable("")

if (browser) {
	jwtToken.set(localStorage.getItem("accessToken") || "");
}
