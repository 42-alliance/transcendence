import { fetchApi } from "../utils.js";
import { Conversation } from "./getAllConversations.js";


export async function conversationById(conversationId: number): Promise<Conversation> {
	const response = await fetchApi(`http://localhost:8000/chat/conversations/${conversationId}/infos`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch conversation");
	}

	const conversation = await response.json();
	if (!conversation) {
		throw new Error("Invalid conversation data received");
	}

	return conversation;
}
