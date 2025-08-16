import { Message } from "../types.js";
import { fetchApi } from "../fetchApi.js";

export async function getAllMessages(conversationId: number): Promise<Message[]> {
	try {
		const response = await fetchApi(`/chat/conversations/${conversationId}`, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(`Error fetching messages: ${response.statusText}`);
		}

		const data: Message[] = await response.json();

		return data;
	} catch (error) {
		console.error("Failed to fetch messages:", error);
		throw error;
	}
}
