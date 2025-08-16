import { sidebar_visibility } from "../sidebar.js";
import { fetchApi } from "../fetchApi.js";
import { displayAllFriendsDynamically, displayPendingFriendsDynamically } from "../Views/Friends/Friends.js";

enum FriendState {
	"accepted",
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

		const response = await fetchApi(`/friends/requests/${friendId}/status`, {
			method: "POST",
			headers: header,
			body: JSON.stringify({ status: state }),
		});

		const result = await response.json();

		console.log("Friend status updated:", result);
		await displayPendingFriendsDynamically();
		await displayAllFriendsDynamically();
		await sidebar_visibility();
	} catch (error) {
		console.error("Error: ", error);
	}
}
