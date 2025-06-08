import { fetchApi } from "../utils.js";
import { Conversation } from "./getAllConversations.js";

/**
 * Creates a new conversation with the specified members.
 * @param {string[]} members - An array of member IDs to include in the conversation.
 * @returns {Promise<Conversation>} - A promise that resolves to the created conversation object.
 * @throws {Error} - Throws an error if the conversation creation fails.
 */
export async function createConversation(members: string[]): Promise<number> {
	const response = await fetchApi("http://localhost:8000/chat/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			members
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to create conversation");
	}
	const conversation = await response.json();
	if (!conversation) {
		throw new Error("Invalid conversation data received");
	}
	if (conversation.message = "Une conversation existe déjà avec ces membres.") {
		return conversation.conversationId;
	}
	else {
		return conversation.conversation.id;
	}
}
