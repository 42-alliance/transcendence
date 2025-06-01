import { getAllConversations } from "../../Chat/getAllConversations.js";
import AView from "../AView.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Chat");
	}
	
	async getHtml() {
		try {
			const response = await fetch("src/Views/Chat/Chat.html");
			if (!response.ok) {
				throw new Error(`Failed to load HTML file: ${response.statusText}`);
			}
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Error loading content</p>`;
		}
	}
}

export async function ChatViewListener() {
	
	const conversations = await getAllConversations();
	if (!conversations) {
		return;
	}

	const conversationList = document.getElementById("conversation-list");
	if (!conversationList) {
		return;
	}

	conversationList.innerHTML = ""; // Clear existing conversations
	conversations.forEach(conversation => {
		const conversationItem = document.createElement("div");
		conversationItem.className = "conversation-item";
		conversationItem.textContent = conversation.name || `Conversation ${conversation.id}`;
		conversationItem.dataset.conversationId = conversation.id.toString();
		
		conversationItem.addEventListener("click", () => {
			// Handle conversation click, e.g., load messages
			console.log(`Selected conversation ID: ${conversation.id}`);
		});
		
		conversationList.appendChild(conversationItem);
	}
	);
}