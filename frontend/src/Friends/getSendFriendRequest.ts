import { fetchApi } from "../utils.js";

interface SendRequestUser {
	receiver: {
		id: number;
		name: string;
		picture: string;
		banner: string;
		bio: string;
		created_at: Date;
	};
	request_sinced: Date;
}

export async function getSendFriendRequest(): Promise< SendRequestUser[] | null > {
	try {
		const header = new Headers();

		const response = await fetchApi("http://localhost:8000/friends/requests/send", {
			method: "GET",
			headers: header,
		});

		const sendRequests: SendRequestUser[] = await response.json();
		console.log("sendRequests: ", sendRequests);
		return sendRequests;
	} catch (error) {
		console.error("Error: ", error);
		return null;
	}
}
