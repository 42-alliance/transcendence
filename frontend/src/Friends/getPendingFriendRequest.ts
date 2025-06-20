import { UserData } from "../types.js";
import { fetchApi } from "../utils.js";

export interface FriendUser {
	user: UserData,
}

export interface PendingRequestUser {
	incoming: FriendUser[];
	outgoing: FriendUser[];
}

export async function getPendingFriendRequest(): Promise< PendingRequestUser | null > {
	try {
		const header = new Headers();

		const response = await fetchApi("http://localhost:8000/friends/requests/pending", {
			method: "GET",
			headers: header,
		});

		const pendingRequest: PendingRequestUser = await response.json(); 
		console.log("pendingRequest: ", pendingRequest);
		return pendingRequest;
	} catch (error) {
		console.error("Error: ", error);
		return null;
	}
}
