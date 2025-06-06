import { fetchApi } from "../utils.js";
import Me from "../Views/Me/Me.js";
import { Conversation } from "./getAllConversations.js";

export interface Message {
	id: number;
	createdAt: string;
	content: string;
	conversationId: number;
	userId: number;
	readBy: number[];
	conversation: Conversation;
}

export async function getAllMessages(conversationId: number): Promise<Message[]> {
	try {
		const response = await fetchApi(`http://localhost:8000/chat/conversations/${conversationId}`, {
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