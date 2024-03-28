import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { ChannelBuilder, ChannelModel } from "./models/channel.model";
import { MessageBuilder } from "./models/message.model";
import { SongBuilder, SongModel } from "./models/song.model";
import { jwtStore } from "../stores";

import songPlaceholder from '$lib/assets/song-placeholder.png';

const ENDPOINT = "http://localhost:8080/api"

const JSON_HEADERS = {
	'Content-Type': 'application/json'
}

function formatResponseError(func: CallableFunction, response: Response) {
	return new Error(`Function: ${func.name}\n
	Status: ${response.status}, ${response.statusText}}\n
	Body: ${response.body}`)
}

async function fetchAuthenticated(url: string, options?: RequestInit): Promise<Response> {
	const token = get(jwtStore);

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
		jwtStore.set('')
		localStorage.removeItem('accessToken');
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
			headers: JSON_HEADERS
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
			headers: JSON_HEADERS
		});

		return response
	},

	async createChannel(channel: ChannelModel) {
		const body = {
			name: channel.name,
			description: channel.description,
		}

		const response = await fetchAuthenticated(`${ENDPOINT}/channel`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: JSON_HEADERS
		})

		return response
	},

	async getChannel(id: string): Promise<ChannelModel> {
		const response = await fetch(`${ENDPOINT}/channel/${id}`)

		if (response.status === 200) {
			const data = await response.json();
			console.log(data)

			const lastSong = data.channel.lastPlayedSong;
			console.log(lastSong);

			const channel = new ChannelBuilder()
				.setId(data.channel._id)
				.setName(data.channel.name)
				.setOwner(data.channel.owner)
				.setDescription(data.channel.description || "")
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
			if (lastSong) {
				channel.setLastSong(
					new SongBuilder()
						.setId(lastSong.id)
						.setSongId(lastSong.song_id)
						.setDuration(lastSong.duration)
						.setName(lastSong.title)
						.setThumbnail(lastSong.thumbnail)
						.setStartTime(lastSong.song_start_time)
						.build()
				)
			}


			return channel.build();
		}

		throw formatResponseError(this.getChannel, response);
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

		throw formatResponseError(this.getSongData, response);
	},

	async subscribeToChannel(id: string) {
		const response = await fetchAuthenticated(`${ENDPOINT}/channel/${id}/subscribe`, {
			method: 'POST',
			headers: JSON_HEADERS,
		})

		return response;
	},

	async getUserFollowedChannelIds(id: string) {
		const response = await fetch(`${ENDPOINT}/user/${id}/followedChannelIds`);

		if (response.status === 200) {
			const data = await response.json();

			return data.followedChannels || [];
		}

		throw formatResponseError(this.getUserFollowedChannelIds, response);
	},

	async getUserFollowedChannels(id: string) {
		const response = await fetch(`${ENDPOINT}/user/${id}/followedChannels`);

		if (response.status === 200) {
			const data = await response.json();

			interface Channel {
				_id: string,
				name: string,
				owner: string,
				lastPlayedSong: any,
			}

			const channels: ChannelModel[] = data.channels.map((channel: Channel) => {
				const lastSong = channel.lastPlayedSong;

				const c = new ChannelBuilder()
					.setId(channel._id)
					.setName(channel.name)
					.setOwner(channel.owner)

					.setLastSong(
						new SongBuilder().setId('').setName('Nothing playing...').setThumbnail(songPlaceholder).build()
					)

				if (lastSong) {
					c
						.setLastSong(
							new SongBuilder().setId(lastSong.id).setName(lastSong.title).setThumbnail(lastSong.thumbnail).build()
						)
				}

				return c.build();
			});

			return channels || [];

		}

		throw formatResponseError(this.getUserFollowedChannels, response);

	},

	async deleteChannel(channelId: string) {
		const response = await fetchAuthenticated(`${ENDPOINT}/channel/${channelId}`, {
			method: "DELETE"
		})

		return response;
	}
}
