import { fetchApi } from "../fetchApi.js";

export async function getFriendStatus(friendId: number) {
	try {
		const header = new Headers();
		
		const response = await fetchApi(`friends/status/${friendId}`, {
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
