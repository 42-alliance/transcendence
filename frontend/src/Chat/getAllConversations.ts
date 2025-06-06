import { fetchApi } from "../utils.js";
import { Message } from "./getAllMessages.js";

export interface Member {
  userId: number;
  name: string;
  picture: string;
  conversationId: number;
  isAdmin: boolean;
}

export interface Conversation {
  id: number;
  name: string | null;
  isGroup: boolean;
  members: Member[]
  messages: Message[];
}

/**
 * Fetches all conversations from the server.
 * @returns {Promise<Conversation[]>} A promise that resolves to the list of conversations.
 * @throws {Error} If the fetch operation fails or the response is not ok.
 */

export async function getAllConversations(): Promise<Conversation[]> {
  try {
	const response = await fetchApi("http://localhost:8000/chat/conversations", {
	  method: "GET",
	});

	if (!response.ok) {
	  throw new Error(`Error fetching conversations: ${response.statusText}`);
	}

	const data: Conversation[] = await response.json();
	return data;
  } catch (error) {
	console.error("Failed to fetch conversations:", error);
	throw error;
  }
}
