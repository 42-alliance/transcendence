import { fetchApi } from "../fetchApi.js";

export async function removeFriend(friendId: number) {
	try {
		const header = new Headers();

		await fetchApi(`/friends/${friendId}`, {
			method: "DELETE",
			headers: header,
		});

	} catch (error) {
		console.error("Error: ", error);
	}
}