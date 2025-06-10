import { fetchApi } from "../utils.js";
import { UserData } from "../Views/userCard/userCard.js";

// export interface PendingRequestUser {
// 	sender: {
// 		id: number;
// 		name: string;
// 		picture: string;
// 		banner: string;
// 		bio: string;
// 		created_at: Date;
// 	}
// 	request_sinced: Date;
// }

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
