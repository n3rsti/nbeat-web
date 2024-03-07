

import { YOUTUBE_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const { id } = params;
	const API_KEY = YOUTUBE_API_KEY;

	const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${API_KEY}&part=snippet`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		if (data.items.length > 0) {
			return json(data.items[0]);
		} else {
			throw new Error('Video not found');
		}
	} catch (error) {
		console.error('Failed to fetch video title:', error);
		throw error;
	}
}
