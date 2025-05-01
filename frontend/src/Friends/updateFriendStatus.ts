import { fetchApi } from "../utils.js";

enum FriendState {
	"accepted",
	"blocked",
	"rejected",
}

function isValidFriendState(state: any): state is FriendState {
	return Object.values(FriendState).includes(state);
}

export async function updateFriendStatus(friendId: number, state: any): Promise<void> {
	try {
		if (!isValidFriendState(state)) {
			throw new Error(`Invalid friend state: ${state}`);
		}

		const header = new Headers();
		header.append('Content-Type', 'application/json');

		const response = await fetchApi(`http://localhost:8000/friends/requests/${friendId}/status`, {
			method: "POST",
			headers: header,
			body: JSON.stringify({ status: state }),
		});

		const result = await response.json();
		console.log(result.message);
	} catch (error) {
		console.error("Error: ", error);
	}
}
