import { fetchApi } from "../utils.js";

export async function removeFriend(friendId: number) {
	try {
		const header = new Headers();

		await fetchApi(`http://localhost:8000/friends/${friendId}`, {
			method: "DELETE",
			headers: header,
		});

	} catch (error) {
		console.error("Error: ", error);
	}
}