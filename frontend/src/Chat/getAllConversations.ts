import { Conversation } from "../types.js";
import { fetchApi } from "../fetchApi.js";



/**
 * Fetches all conversations from the server.
 * @returns {Promise<Conversation[]>} A promise that resolves to the list of conversations.
 * @throws {Error} If the fetch operation fails or the response is not ok.
 */

export async function getAllConversations(): Promise<Conversation[]> {
  try {
	const response = await fetchApi("/chat/conversations", {
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
