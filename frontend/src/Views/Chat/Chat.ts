import { tracingChannel } from "diagnostics_channel";
import { createConversation } from "../../Chat/createConversation.js";
import {
	Conversation,
	getAllConversations,
	Member,
} from "../../Chat/getAllConversations.js";
import { getAllMessages, Message } from "../../Chat/getAllMessages.js";
import { IUser } from "../../types.js";
import { getUserInfos } from "../../User/me.js";
import AView from "../AView.js";
import { navigateTo, webSockets } from "../viewManager.js";
import { conversationById } from "../../Chat/conversationById.js";
import { getAllUsers } from "../../User/getAllUsers.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Chat");
	}

	async getHtml() {
		try {
			const response = await fetch("/src/Views/Chat/Chat.html");
			if (!response.ok) {
				throw new Error(
					`Failed to load HTML file: ${response.statusText}`
				);
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
		// Création du <li>
		const li = document.createElement("li");
		li.className =
			"flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-gray-700 transition group";
		li.dataset.conversationId = conversation.id.toString();

		// Préparation du container avatar
		const avatarContainer = document.createElement("div");
		avatarContainer.className = "flex-shrink-0";

		const otherMembers = (conversation.members || []).filter(
			(m: any) => m.name !== my_name
		);

		if (otherMembers.length === 1) {
			// Affiche l'avatar de l'autre membre
			const avatarImg = document.createElement("img");
			avatarImg.className =
				"w-11 h-11 rounded-full border border-orange-400/30";
			avatarImg.src = otherMembers[0].picture || "assets/default.jpeg";
			avatarImg.alt = otherMembers[0].name + " avatar";
			avatarContainer.appendChild(avatarImg);
		} else {
			// SVG groupe blanc
			avatarContainer.innerHTML = `
			  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"
				   class="w-11 h-11 rounded-full border border-orange-400/30 text-white bg-gray-700"
				   fill="currentColor" alt="Group conversation">
				<path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/>
			  </svg>
			`;
		}

		// Partie centrale (nom + dernier message)
		const center = document.createElement("div");
		center.className = "flex-1 min-w-0";
		const nameDiv = document.createElement("div");
		nameDiv.className = "font-semibold text-white truncate";
		nameDiv.textContent =
			conversation.name || createConversationName(otherMembers);
		const lastMessageDiv = document.createElement("div");
		lastMessageDiv.className = "text-xs text-gray-400 truncate";
		lastMessageDiv.textContent =
			conversation.messages && conversation.messages.length != 0
				? conversation.messages[0].content
				: "Aucun message";
		center.appendChild(nameDiv);
		// center.appendChild(lastMessageDiv);

		// Badge messages non lus
		const unreadCount = conversation.unreadCount || 0;
		const unreadBadge = document.createElement("span");
		unreadBadge.className =
			"flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 hidden";
		unreadBadge.id = `unread-badge-${conversation.id}`;
		unreadBadge.textContent = unreadCount.toString();
		if (unreadCount > 0) {
			unreadBadge.classList.remove("hidden");
		}

		// Montage final dans un <a>
		const a = document.createElement("a");
		a.href = `/chat/${conversation.id}`;
		a.className = "flex items-center gap-3 w-full h-full";
		a.setAttribute("data-link", "");

		a.appendChild(avatarContainer);
		a.appendChild(center);
		a.appendChild(unreadBadge);

		li.appendChild(a);

		conversationList.appendChild(li);
	});
}

export function getUserPicture(
	conversation: Conversation,
	userId: number
): string {
	console.log("getUserPicture called with userId:", userId);
	console.log("Conversation members:", conversation.members);

	const userInfos = conversation.members.find(
		(m: Member) => m.userId === userId
	);
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
	const otherMembers = (conversation.members || []).filter(
		(m: any) => m.name !== my_name
	);

	document
		.getElementById(`unread-badge-${conversation.id}`)
		?.classList.add("hidden"); // Cacher le badge de non-lu

	// HEADER
	chatHeader.innerHTML = "";
	chatHistory.setAttribute(
		"data-conversation-id",
		conversation.id.toString()
	);

	let inviteBtnHTML = `
    <button id="invite-to-play-btn" 
        class="ml-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-orange-500/90 transition text-sm font-bold text-white shadow focus:outline-none"
        title="Invite to play">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="hidden sm:inline">Invite to play</span>
    </button>
`;

	if (otherMembers.length === 1) {
		chatHeader.innerHTML = `
        <img src="${
			otherMembers[0].picture || "/assets/default.jpeg"
		}" class="w-11 h-11 rounded-full border border-orange-400/30" alt="${
			otherMembers[0].name
		} avatar">
        <div>
            <div class="font-semibold text-white text-lg">${
				otherMembers[0].name
			}</div>
            <div class="text-xs text-gray-400">En ligne</div>
        </div>
        ${inviteBtnHTML}
    `;
	} else {
		chatHeader.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="w-11 h-11 rounded-full border border-orange-400/30 text-white" fill="currentColor" alt="Group conversation"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>
        <div>
            <div class="font-semibold text-white text-lg">${
				conversation.name || createConversationName(otherMembers)
			}</div>
            <div class="text-xs text-gray-400">${
				otherMembers.length
			} membres</div>
        </div>
        ${inviteBtnHTML}
    `;
	}

	// ... (le reste de la fonction inchangé)

	// HISTORIQUE
	chatHistory.innerHTML = "";
	const myId = userInfos.id;

	const messages = (await getAllMessages(conversation.id)).reverse(); // Récupère les messages et les inverse pour afficher les plus récents en bas`
	if (messages.length === 0) {
		chatHistory.innerHTML = `<div class="text-gray-500 text-center">Beginning of conversation.</div>`;
	} else {
		messages.forEach((msg: Message) => {
			const isMe = msg.userId === myId;
			chatHistory.innerHTML += `
				<div class="flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}">
					<img src="${getUserPicture(conversation, msg.userId)}" 
						class="w-8 h-8 rounded-full border border-orange-400/30" alt="avatar">
					<div>
						<div class="${
							isMe
								? "bg-gradient-to-br from-orange-500 to-yellow-400 text-black"
								: "bg-gray-800 text-white"
						} px-4 py-2 rounded-2xl max-w-md break-words">${
				msg.content || "[Pièce jointe]"
			}</div>
						<div class="text-xs text-gray-500 mt-1 ${isMe ? "text-right" : ""}">${
				msg.createdAt || ""
			}</div>
					</div>
				</div>
			`;
		});
		// Scroll en bas
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}

	setTimeout(() => {
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}, 0);

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
	const form = document.getElementById(
		"send-message-form"
	) as HTMLFormElement;
	const input = document.getElementById("chat-input") as HTMLInputElement;
	if (form && input) {
		form.onsubmit = e => {
			e.preventDefault();
			const value = input.value.trim();
			if (!value) return;

			webSockets.chat?.send(
				JSON.stringify({
					conversationId: conversation.id,
					content: value,
				})
			);

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

	const chatHeaderBar = document.getElementById("chat-header-bar");
	const newChatSearchBar = document.getElementById("new-chat-search-bar");
	const openBtn = document.getElementById("open-new-chat");
	const closeBtn = document.getElementById("close-new-chat-search");
	const input = document.getElementById(
		"search-new-chat-input"
	) as HTMLInputElement;

	if (openBtn && chatHeaderBar && newChatSearchBar && closeBtn && input) {
		// Quand on clique sur "+"
		openBtn.addEventListener("click", () => {
			chatHeaderBar.classList.add("hidden");
			newChatSearchBar.classList.remove("hidden");
			input.value = "";
			setTimeout(() => input.focus(), 150);
		});

		// Quand on ferme la barre de recherche
		closeBtn.addEventListener("click", () => {
			newChatSearchBar.classList.add("hidden");
			chatHeaderBar.classList.remove("hidden");
		});

		const allUsers = await getAllUsers();
		if (!allUsers) {
			console.error("Failed to retrieve user list.");
			return;
		}

		// Quand on appuie sur "Escape" ou "Enter" dans la barre de recherche
		input.addEventListener("keydown", async e => {
			if (e.key === "Escape") {
				newChatSearchBar.classList.add("hidden");
				chatHeaderBar.classList.remove("hidden");
			}
			if (e.key === "Enter") {
				e.preventDefault(); // Empêche le formulaire de se soumettre
				newChatSearchBar.classList.add("hidden");
				chatHeaderBar.classList.remove("hidden");
				const searchValue = input.value.trim();
				if (searchValue) {
					// Logique pour démarrer une nouvelle conversation avec le nom recherché

					const members = searchValue
						.split(" ")
						.map(name => name.trim())
						.filter(name => name !== "")
						.map(name => {
							// Recherche dans allUsers par nom insensible à la casse
							const found = allUsers.find(
								user =>
									user.name.toLowerCase() ===
									name.toLowerCase()
							);
							return found ? found.name : name; // Utilise la vraie casse si trouvé, sinon le nom entré
						})
						.filter((name, idx, arr) => arr.indexOf(name) === idx); // éviter les doublons

					if (members.length === 0) return;

					const userInfos = await getUserInfos();
					if (!userInfos || !userInfos.name) {
						console.error(
							"User information could not be retrieved."
						);
						return;
					}

					members.push(userInfos.name);
					console.log("Creating conversation with members:", members);

					try {
						const conversationId = await createConversation(
							members
						);
						// Une fois la conversation créée, on peut rediriger vers la nouvelle conversation

						console.log(
							"Conversation created with ID:",
							conversationId
						);
						navigateTo(
							`/chat/${conversationId}`
						);
					} catch (error) {
						console.error("Error creating conversation:", error);
					}

					input.value = ""; // Réinitialise l'input après l'envoi
				}
			}
		});
	}
}
