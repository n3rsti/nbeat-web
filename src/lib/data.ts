import { goto } from "$app/navigation";
import { ChannelBuilder, ChannelModel } from "./models/channel.model";
import { MessageBuilder } from "./models/message.model";
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

			console.log(data);
			const lastSong = data.channel.lastPlayedSong;

			const channel = new ChannelBuilder()
				.setId(data.channel._id)
				.setName(data.channel.name)
				.setOwner(data.channel.owner)
				.setLastSong(
					new SongBuilder()
						.setId(lastSong.id)
						.setSongId(lastSong.song_id)
						.setDuration(lastSong.duration)
						.setName(lastSong.title)
						.setThumbnail(lastSong.thumbnail)
						.setStartTime(lastSong.song_start_time)
						.build()
				)
				.setMessages(
					data.channel.messages.map((message) => {
						let newMessage = new MessageBuilder()
						newMessage.setId(message.id)
							.setAuthor(message.author)
							.setContent(message.content)
							.setType(message.type)

						if (newMessage.type === "song") {
							let songDetails = message.songDetails;
							if (songDetails.length > 0) {
								songDetails = songDetails[0];

								newMessage = newMessage.setSong(
									new SongBuilder()
										.setId(songDetails.id)
										.setSongId(songDetails.song_id)
										.setDuration(songDetails.duration)
										.setName(songDetails.title)
										.setThumbnail(songDetails.thumbnail)
										.setStartTime(songDetails.song_start_time)
										.build()
								)
							}

						}

						return newMessage.build()
					})
				)
				.setQueue(
					data.queue.songs.map((song) => {
						return new SongBuilder()
							.setId(song.id)
							.setSongId(song.song_id)
							.setDuration(song.duration)
							.setName(song.title)
							.setThumbnail(song.thumbnail)
							.setStartTime(song.song_start_time)
							.build()
					})
				)
				.build()

			console.log(channel)

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
