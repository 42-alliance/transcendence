import { getUserInfos } from "../User/me.js";
import { getAccessToken } from "../utils.js";
import { showToast } from "../Views/triggerToast.js";
import { gameWsClass, navigateTo, webSockets } from "../Views/viewManager.js";

interface ChatMessage {
	type: "new_message" | "invitation_game";
	id: number;
	createdAt: Date;
	content: string;
	conversationId: number;
	userId: number;
	picture: string;
	name: string;
}

export function setupChatWebSocket() {
	const wsUrl = `ws://localhost:8000/ws/chat`;

	const token = getAccessToken();

	if (!token) return;

	webSockets.chat = new WebSocket(wsUrl, ["Authorization", token]);

	webSockets.chat.onopen = () => {
		console.log(`✅ Connecté a la websocket de chat`);
	};

	function callToast(msg: ChatMessage) {
		showToast({
			text: `${msg.name} send you a new message !`,
			img: msg.picture,
			buttons: [
				{
					label: "Go chat",
					onClick: () =>
						navigateTo(`/chat/${msg.conversationId}`),
				},
			],
			duration: 5000, // 0 = ne s’enlève pas tant qu’on ferme pas
		});
	}

	webSockets.chat.onmessage = async event => {
		const msg: ChatMessage = JSON.parse(event.data);
		console.log("📩 Message reçu => ", msg);

		const me = await getUserInfos();
		if (!me) {
			console.error(
				"⚠️ Impossible de récupérer les informations de l'utilisateur."
			);
			return;
		}

		
		const isMe = msg.userId === me.id;
		if (msg.type === "new_message") {
			const chatHistory = document.getElementById("chat-history");
			if (!chatHistory) {
				if (!isMe) {
					callToast(msg);
				}
				return;
			} else {
				const conv_list = document.getElementById("conversation-list");
				if (!conv_list) {
					return;
				}

				const me = await getUserInfos();
				if (!me) return;

				const isblocked = me.blocked?.some(
					blockedUser => blockedUser.id === msg.userId
				);
				if (isblocked) {
					return;
				}

				const li = conv_list?.querySelector(
					`li[data-conversation-id="${msg.conversationId}"]`
				);
				if (!li) {
					return;
				}
				conv_list.prepend(li);

				console.log("li", li);
				const conversationId = chatHistory?.getAttribute(
					"data-conversation-id"
				);
				if (!conversationId) {
					callToast(msg);
					const unread_badge = document.getElementById(
						`unread-badge-${msg.conversationId}`
					);
					if (!unread_badge) {
						return;
					}
					unread_badge.innerHTML = (
						Number(unread_badge.innerHTML) + 1
					).toString();
					unread_badge.classList.remove("hidden");
					return;
				}

				if (
					Number(conversationId) !== msg.conversationId &&
					!isMe
				) {
					// Si la conversation ouverte n'est pas celle du message, on ne l'affiche pas
					callToast(msg);
					const unread_badge = document.getElementById(
						`unread-badge-${msg.conversationId}`
					);
					if (!unread_badge) {
						return;
					}
					unread_badge.innerHTML = (
						Number(unread_badge.innerHTML) + 1
					).toString();
					unread_badge.classList.remove("hidden");
					return;
				} else {
					chatHistory.innerHTML += `
					<div class="flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}">
						<img src="${msg.picture}" 
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
					setTimeout(() => {
						chatHistory.scrollTop = chatHistory.scrollHeight;
					}, 0);
				}
			}
		}
		else if (msg.type === "invitation_game") {
			const conversationId = msg.conversationId;
			const content = msg.content;

			if (content && !isMe) {
				// Affiche un toast classique
				showToast({
					text: `You have been invited to play a game!`,
					img: msg.picture,
					buttons: [
						{
							label: "Join Game",
							onClick: () => {
								navigateTo(`/game`);
								gameWsClass?.sendMessage("join_inv_game", {
									user: me,
									type: "join_inv_game",
									conversationId: conversationId,
									uuid_room: content,
								});
							},
						},
					],
					duration: 5000,
				});

				// Affiche un message éphémère dans le chat (2 minutes)
				const chatHistory = document.getElementById("chat-history");
				if (chatHistory) {
					const ephemeralId = `ephemeral-invitation-${Date.now()}`;
					const ephemeralDiv = document.createElement("div");
					ephemeralDiv.id = ephemeralId;
					ephemeralDiv.className = "flex items-end gap-3";
					ephemeralDiv.innerHTML = `
						<img src="${msg.picture}" 
							class="w-8 h-8 rounded-full border border-orange-400/30" alt="avatar">
						<div>
							<div class="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-md break-words flex items-center gap-2">
								<span>${msg.name} invited you to play a game!</span>
								<button class="ml-2 px-2 py-1 bg-orange-400 text-black rounded hover:bg-orange-500 transition" id="${ephemeralId}-btn">Join Game</button>
							</div>
							<div class="text-xs text-gray-400 mt-1">Ephemeral message (2 min)</div>
						</div>
					`;
					chatHistory.appendChild(ephemeralDiv);
					setTimeout(() => {
						ephemeralDiv.remove();
					}, 2 * 60 * 1000);

					// Ajoute l'event sur le bouton
					const btn = document.getElementById(`${ephemeralId}-btn`);
					if (btn) {
						btn.addEventListener("click", () => {
							navigateTo(`/game`);
							gameWsClass?.sendMessage("join_inv_game", {
								user: me,
								type: "join_inv_game",
								conversationId: conversationId,
								uuid_room: content,
							});
						});
					}
					setTimeout(() => {
						chatHistory.scrollTop = chatHistory.scrollHeight;
					}, 0);
				}
			}
		}
	};

	webSockets.chat.onclose = event => {
		console.log("❌ WebSocket déconnecté !", event);
		setTimeout(setupChatWebSocket, 3000);
	};

	webSockets.chat.onerror = error => {
		console.error("⚠️ Erreur WebSocket :", error);
	};
}
