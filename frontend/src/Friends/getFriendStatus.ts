import { fetchApi } from "../utils.js";

export async function getFriendStatus(friendId: number) {
	try {
		const header = new Headers();
		
		const response = await fetchApi(`http://localhost:8000/friends/status/${friendId}`, {
			method: "GET",
			headers: header,
		});

		const result = await response.json();
		console.log("friend status == ", result.status);
		return result.status;
	} catch (error) {
		console.error("Error: ", error);
		return null;
	}
}
