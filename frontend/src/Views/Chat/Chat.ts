import { Conversation, getAllConversations, Member } from "../../Chat/getAllConversations.js";
import { getAllMessages, Message } from "../../Chat/getAllMessages.js";
import { IUser } from "../../types.js";
import { getUserInfos } from "../../User/me.js";
import AView from "../AView.js";
import { webSockets } from "../viewManager.js";

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

function createConversationName(otherMembers: Member[]): string {

	let str = "";
	otherMembers.forEach(member => {
			str += member.name + ", ";
	});
	if (str.length > 0) {
		str = str.slice(0, -2); // Remove trailing comma and space
	}
	return str;
}

async function renderConversations() {
	const conversations = await getAllConversations();
	if (!conversations) return;

	const conversationList = document.getElementById("conversation-list");
	if (!conversationList) return;

	const userInfos = await getUserInfos();
	if (!userInfos) {
		console.error("User information could not be retrieved.");
		return;
	}
	const my_name = userInfos.name || "Unknown User";

	conversationList.innerHTML = ""; // Clear existing conversations

	conversations.forEach(conversation => {
		console.log("Conversation:", conversation);
		// 1. Création du <li>
		const li = document.createElement("li");
		li.className = "flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-gray-700 transition group";
		li.dataset.conversationId = conversation.id.toString();

		// 2. Avatar (prend le premier membre autre que moi, ou image de groupe par défaut)
		const otherMembers = (conversation.members || []).filter((m: any) => m.name !== my_name);

		const avatarImg = document.createElement("img");
		avatarImg.className = "w-11 h-11 rounded-full border border-orange-400/30";
		if (otherMembers.length === 1) {
			avatarImg.src = otherMembers[0].picture
			avatarImg.alt =  otherMembers[0].name +  " avatar";
		} else {
			avatarImg.src = "assets/group_default.jpg"; // <-- met une image de groupe
			avatarImg.alt = "Group conversation";
		}

		// 3. Partie centrale (nom + dernier message)
		const center = document.createElement("div");
		center.className = "flex-1 min-w-0";
		const nameDiv = document.createElement("div");
		nameDiv.className = "font-semibold text-white truncate";
		nameDiv.textContent = conversation.name || createConversationName(otherMembers);
		const lastMessageDiv = document.createElement("div");
		lastMessageDiv.className = "text-xs text-gray-400 truncate";
		lastMessageDiv.textContent =  conversation.messages.length != 0 ? conversation.messages[0].content : "Aucun message";
		center.appendChild(nameDiv);
		center.appendChild(lastMessageDiv);

		// 5. Montage final
		li.appendChild(avatarImg);
		li.appendChild(center);

		li.addEventListener("click", async () => {
			console.log(`Selected conversation ID: ${conversation.id}`);
			await renderChat(conversation, userInfos); // Tu déclares la fonction plus bas
			// Charge les messages, etc.
		});

		conversationList.appendChild(li);
	});
}

export function getUserPicture(conversation: Conversation, userId: number): string {
	console.log("getUserPicture called with userId:", userId);
	console.log("Conversation members:", conversation.members);

	const userInfos = conversation.members.find((m: Member) => m.userId === userId);
	if (!userInfos) {
		console.warn(`User with ID ${userId} not found in conversation.`);
		return "assets/default.jpeg"; // Default picture if user not found
	}
	return userInfos.picture;
}

async function renderChat(conversation: Conversation, userInfos: IUser) {
	const chatHeader = document.getElementById("chat-header");
	const chatHistory = document.getElementById("chat-history");
	const chatInputArea = document.getElementById("chat-input-area");
	if (!chatHeader || !chatHistory || !chatInputArea) return;

	// Trouver les autres membres pour le header
	const my_name = userInfos.name || "Unknown User";
	const otherMembers = (conversation.members || []).filter((m: any) => m.name !== my_name);

	// HEADER
	chatHeader.innerHTML = "";
	if (otherMembers.length === 1) {
		chatHeader.innerHTML = `
			<img src="${otherMembers[0].picture || "assets/default.jpeg"}" class="w-11 h-11 rounded-full border border-orange-400/30" alt="${otherMembers[0].name} avatar">
			<div>
				<div class="font-semibold text-white text-lg">${otherMembers[0].name}</div>
				<div class="text-xs text-gray-400">En ligne</div>
			</div>
		`;
	} else {
		chatHeader.innerHTML = `
			<img src="assets/group_default.jpg" class="w-11 h-11 rounded-full border border-orange-400/30" alt="Group conversation">
			<div>
				<div class="font-semibold text-white text-lg">${conversation.name || createConversationName(otherMembers)}</div>
				<div class="text-xs text-gray-400">${otherMembers.length} membres</div>
			</div>
		`;
	}

	// HISTORIQUE
	chatHistory.innerHTML = "";
	const myId = userInfos.id;

	const messages = (await getAllMessages(conversation.id)).reverse(); // Récupère les messages et les inverse pour afficher les plus récents en bas`
	if (messages.length === 0) {
		chatHistory.innerHTML = `<div class="text-gray-500 text-center">Aucun message dans cette conversation.</div>`;
	} else {

		messages.forEach((msg: Message) => {
			const isMe = msg.userId === myId;
			chatHistory.innerHTML += `
				<div class="flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}">
					<img src="${getUserPicture(conversation, msg.userId)}" 
						class="w-8 h-8 rounded-full border border-orange-400/30" alt="avatar">
					<div>
						<div class="${isMe ? "bg-gradient-to-br from-orange-500 to-yellow-400 text-black" : "bg-gray-800 text-white"} px-4 py-2 rounded-2xl max-w-md break-words">${msg.content || "[Pièce jointe]"}</div>
						<div class="text-xs text-gray-500 mt-1 ${isMe ? "text-right" : ""}">${msg.createdAt || ""}</div>
					</div>
				</div>
			`;
		});
		// Scroll en bas
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}

	// ZONE DE SAISIE
	chatInputArea.innerHTML = `
		<form id="send-message-form" class="flex items-center gap-3">
			<input type="text" id="chat-input" class="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Écris ton message..." autocomplete="off" />
			<button type="submit" class="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold px-6 py-2 rounded-lg shadow flex items-center gap-2">
				<i class="fa fa-paper-plane"></i>
			</button>
		</form>
	`;

	// Handler pour l'envoi de message (mock ici)
	const form = document.getElementById("send-message-form") as HTMLFormElement;
	const input = document.getElementById("chat-input") as HTMLInputElement;
	if (form && input) {
		form.onsubmit = (e) => {
			e.preventDefault();
			const value = input.value.trim();
			if (!value) return;

			webSockets.chat?.send(JSON.stringify({
				conversationId: conversation.id,
				content: value,
			}));

			input.value = "";
		};
	}
}


export async function ChatViewListener(conversationId?: number) {

	renderConversations();

	if (conversationId) {
		const conversations = await getAllConversations();
		if (!conversations) return;

		const conversation = conversations.find(c => c.id === conversationId);
		if (!conversation) {
			console.error(`Conversation with ID ${conversationId} not found.`);
			return;
		}

		const userInfos = await getUserInfos();
		if (!userInfos) {
			console.error("User information could not be retrieved.");
			return;
		}

		await renderChat(conversation, userInfos);
	}


}
