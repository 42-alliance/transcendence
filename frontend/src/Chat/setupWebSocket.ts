import { getUserInfos } from "../User/me.js";
import { getAccessToken } from "../fetchApi.js";
import { showToast } from "../Views/triggerToast.js";
import { gameWsClass, navigateTo, webSockets } from "../Views/viewManager.js";
import { timeAgo } from "../Views/User/User.js";
import { Message, UserData } from "../types.js";
import { renderBlockedMessage, renderMessage } from "../Views/Chat/renderChat.js";
import { isBlock } from "typescript";

function callToast(msg: Message) {
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

export function setupChatWebSocket() {
	const wsUrl = `ws://localhost:8000/ws/chat`;
	const token = getAccessToken();
	if (!token) return;

	webSockets.chat = new WebSocket(wsUrl, ["Authorization", token]);

	webSockets.chat.onopen = () => {
		console.log(`✅ Connecté a la websocket de chat`);
	};

	webSockets.chat.onmessage = async event => {
		const msg: Message = JSON.parse(event.data);
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
			handleNewMessage(msg, me, isMe);
		} else if (msg.type === "invitation_game") {
			handleInvitationGame(msg, me, isMe);
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

async function handleNewMessage(msg: Message, me: UserData, isMe: boolean) {
	const chatHistory = document.getElementById("chat-history");
	if (!chatHistory) {
		if (!isMe) {
			callToast(msg);
		}
		return;
	}

	putConversationToTop(msg.conversationId);

	const conversationId = chatHistory?.getAttribute("data-conversation-id");
	if (!conversationId) {
		handleUnreadBadge(msg);
		return;
	}

	if (
		Number(conversationId) !== msg.conversationId &&
		!isMe
	) {
		handleUnreadBadge(msg);
		return;
	} else {
		const isBlocked = me.blocked?.some(
			blockedUser => blockedUser.id === msg.userId
		);

		if (isBlocked) {
			chatHistory.innerHTML += renderBlockedMessage(msg.createdAt);
			return;
		} else {
			appendMessageToChatHistory(chatHistory, msg, isMe);
		}
	}
}

function putConversationToTop(conversationId: number) {
	const conv_list = document.getElementById("conversation-list");
	if (!conv_list) {
		return;
	}

	const li = conv_list.querySelector(
		`li[data-conversation-id="${conversationId}"]`
	);
	if (li) {
		conv_list.prepend(li);
	}
}

function handleUnreadBadge(msg: Message) {
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
}

function appendMessageToChatHistory(chatHistory: HTMLElement, msg: Message, isMe: boolean) {
	chatHistory.innerHTML += renderMessage(msg, isMe);
	setTimeout(() => {
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}, 0);
}

function handleInvitationGame(msg: Message, me: any, isMe: boolean) {
	const conversationId = msg.conversationId;
	const content = msg.content;

	if (content && !isMe) {
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

		appendEphemeralInvitation(msg, me, conversationId, content);
	}
}

function appendEphemeralInvitation(
	msg: Message,
	me: any,
	conversationId: number,
	content: string
) {
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
