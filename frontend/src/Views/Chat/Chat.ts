import { tracingChannel } from "diagnostics_channel";
import { createConversation } from "../../Chat/createConversation.js";
import { getAllConversations } from "../../Chat/getAllConversations.js";
import { getAllMessages } from "../../Chat/getAllMessages.js";
import { Conversation, Member, Message, UserData } from "../../types.js";
import { getUserInfos, me } from "../../User/me.js";
import AView from "../AView.js";
import { navigateTo, webSockets } from "../viewManager.js";
import { conversationById } from "../../Chat/conversationById.js";
import { getAllUsers } from "../../User/getAllUsers.js";
import { showToast } from "../triggerToast.js";
import { GetUserBlockedListByName } from "../../User/getUserByName.js";
import { createConversationNameNoClick } from "./ChatUtils.js";
import { renderChat } from "./renderChat.js";

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




async function renderConversations() {
	const conversationList = document.getElementById("conversation-list");
	if (!conversationList) return;

	const conversations = await getAllConversations();
	if (!conversations) return;

	const me = await getUserInfos();
	if (!me || !me.name) {
		console.error("User information could not be retrieved.");
		return;
	}
	const my_name = me.name;

	conversationList.innerHTML = ""; // Clear existing conversations

	conversations.forEach(conversation => {
		// Création du <li>
		// ici on check si l'utilisateur est bloquer
		if (conversation.members.some(m => me.blocked?.includes(m))) {
			return
		}
		
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
			conversation.name || createConversationNameNoClick(otherMembers);
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
							const found = allUsers.find(
								user => user.name!.toLowerCase() === name.toLowerCase()
							);
							return found ? found.name : name;
						})
						.filter((name, idx, arr) => arr.indexOf(name) === idx) // éviter les doublons
						.filter((name): name is string => typeof name === "string" && name !== undefined); // filter out undefined

					if (members.length === 0) return;

					const userInfos = await getUserInfos();
					if (!userInfos || !userInfos.name) {
						console.error(
							"User information could not be retrieved."
						);
						return;
					}

					members.push(userInfos.name);

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
						showToast({
							text: "Error creating conversation.",
							buttons: [],
							duration: 5000,
						})
						console.error("Error creating conversation:", error);
					}

					input.value = ""; // Réinitialise l'input après l'envoi
				}
			}
		});
	}
}
