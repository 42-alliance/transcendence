import { getUserInfos } from "../User/me.js";
import { getAccessToken } from "../utils.js";
import Chat, { getUserPicture } from "../Views/Chat/Chat.js";
import Me from "../Views/Me/Me.js";
import { showToast } from "../Views/triggerToast.js";
import { navigateTo, router, webSockets } from "../Views/viewManager.js";
import { Message } from "./getAllMessages.js";

interface ChatMessage {
	type: "new_message";
	data: {
		id: number;
		createdAt: Date;
		content: string;
		conversationId: number;
		userId: number;
		picture: string;
		name: string;
	};
}

export function setupChatWebSocket() {
	const wsUrl = `ws://localhost:8000/ws/chat`
	
	const token = getAccessToken();

	if (!token)
		return;

	webSockets.chat = new WebSocket(wsUrl, ["Authorization", token]);

	webSockets.chat.onopen = () => {
		console.log(`✅ Connecté a la websocket de chat`);
	}

	function callToast(msg:	ChatMessage) {
		showToast({
					text: `${msg.data.name} send you a new message !`,
					img: msg.data.picture,
					buttons: [
						{ label: "Go chat", onClick: () => navigateTo(`/chat/${msg.data.conversationId}`) },
					],
					duration: 5000 // 0 = ne s’enlève pas tant qu’on ferme pas
				});
	}

	webSockets.chat.onmessage = async (event) => {
    const msg: ChatMessage = JSON.parse(event.data);
    console.log("📩 Message reçu => ", msg);

    const me = await getUserInfos();
    if (!me) {
        console.error("⚠️ Impossible de récupérer les informations de l'utilisateur.");
        return;
    }

    const isMe = msg.data.userId === me.id;

    if (msg.type === "new_message") {
        const chatHistory = document.getElementById("chat-history");
		if (!chatHistory) {
			if (!isMe) {
				callToast(msg);
			}
			return;
		}
		else {
			const conv_list = document.getElementById("conversation-list");
			if (!conv_list) {
				return;
			}
			const li = conv_list?.querySelector(`li[data-conversation-id="${msg.data.conversationId}"]`);
			if (!li) {
				return;
			}
			conv_list.prepend(li);
			
			console.log("li", li);
			const conversationId = chatHistory?.getAttribute("data-conversation-id");
			if (!conversationId) {
				callToast(msg);
				const unread_badge = document.getElementById(`unread-badge-${msg.data.conversationId}`);
				if (!unread_badge) {
					return
				}
				unread_badge.innerHTML = (Number(unread_badge.innerHTML) + 1).toString();
				unread_badge.classList.remove("hidden");
				return;
			}
			
			if (Number(conversationId) !== msg.data.conversationId && !isMe) {
				// Si la conversation ouverte n'est pas celle du message, on ne l'affiche pas
				callToast(msg);
				const unread_badge = document.getElementById(`unread-badge-${msg.data.conversationId}`);
				if (!unread_badge) {
					return
				}
				unread_badge.innerHTML = (Number(unread_badge.innerHTML) + 1).toString();
				unread_badge.classList.remove("hidden");
				return;
			}
			else {
				chatHistory.innerHTML += `
					<div class="flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}">
						<img src="${msg.data.picture}" 
							class="w-8 h-8 rounded-full border border-orange-400/30" alt="avatar">
						<div>
							<div class="${isMe ? "bg-gradient-to-br from-orange-500 to-yellow-400 text-black" : "bg-gray-800 text-white"} px-4 py-2 rounded-2xl max-w-md break-words">${msg.data.content || "[Pièce jointe]"}</div>
							<div class="text-xs text-gray-500 mt-1 ${isMe ? "text-right" : ""}">${msg.data.createdAt || ""}</div>
						</div>
					</div>
				`;
				setTimeout(() => {
					chatHistory.scrollTop = chatHistory.scrollHeight;
				}, 0);
			}
		}
    }
};


	webSockets.chat.onclose = (event) => {
		console.log("❌ WebSocket déconnecté !", event);
		setTimeout(setupChatWebSocket, 3000);
	};

	webSockets.chat.onerror = (error) => {
		console.error("⚠️ Erreur WebSocket :", error);
	};
}
