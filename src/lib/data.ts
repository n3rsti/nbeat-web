
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

	return fetch(url, options);
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
	}
}
