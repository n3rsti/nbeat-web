import { goto } from "$app/navigation";
import { ChannelBuilder, ChannelModel } from "./models/channel.model";
import { SongBuilder, SongModel } from "./models/song.model";

const ENDPOINT = "http://localhost:8080/api"

async function fetchAuthenticated(url: string, options?: RequestInit): Promise<Response> {
	const token = localStorage.getItem("accessToken");

	if (token) {
		if (!options) {
			options = {};
		}
		if (!options.headers) {
			options.headers = {};
		}
		options.headers['Authorization'] = `Bearer ${token}`;
	}

	const request = await fetch(url, options);
	if (request.status === 401) {
		goto("/login")
	}

	return request


}


export const API = {
	async login(username: string, password: string) {
		const body = {
			id: username,
			password: password
		};
		const response = await fetch(`${ENDPOINT}/login`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		return response
	},

	async register(username: string, password: string) {
		const body = {
			id: username,
			password: password
		};
		const response = await fetch(`${ENDPOINT}/register`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		return response
	},

	async createChannel(name: string) {
		const body = {
			name: name,
		}

		const response = await fetchAuthenticated(`${ENDPOINT}/channel`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		return response
	},

	async getChannel(id: string): Promise<ChannelModel> {
		const response = await fetch(`${ENDPOINT}/channel/${id}`)

		if (response.status === 200) {
			const data = await response.json();

			const channel = new ChannelBuilder()
				.setId(data._id)
				.setName(data.name)
				.setOwner(data.owner)
				.setLastSong(data.last_song)
				.setLastSongPlayedAt(data.last_song_played_at)
				.build()

			return channel
		}

		throw new Error();
	},

	async getSongData(id: string): Promise<SongModel> {
		const response = await fetch(`${ENDPOINT}/song/${id}`)

		if (response.status === 200) {
			const data = await response.json();

			const parsedContent = data.items[0];
			const song = new SongBuilder()
				.setId(parsedContent.id)
				.setName(parsedContent.snippet.title)
				.setThumbnail(parsedContent.snippet.thumbnails.default.url)
				.setDuration(parsedContent.contentDetails.duration)
				.build();

			return song

		}

		throw new Error();
	}
}
