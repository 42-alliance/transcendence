import { fetchApi, getHeader } from "../utils.js";

export interface Friends {
	id: number;
	name: string;
	picture: string;
	banner: string;
	status: string;
	date: string;
	type: string;
	bio: string;
}

export async function getAllFriends(): Promise< Friends[] | null> {
	try {
		const header = getHeader();

		const response = await fetchApi("http://localhost:8000/friends/list", {
			method: "GET",
			headers: header,
		});

		if (!response.ok) {
			throw new Error("Response fail friend/list: " + response.statusText);
		}

		return await response.json();
	} catch (error) {
		console.log("Error: ", error);
	}
	return null;
}
