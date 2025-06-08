import { getUserInfos } from "../User/me.js";
import { getAccessToken } from "../utils.js";
import { getUserPicture } from "../Views/Chat/Chat.js";
import { webSockets } from "../Views/viewManager.js";
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

	webSockets.chat.onmessage = async (event) => {
		const msg: ChatMessage = JSON.parse(event.data);
		console.log("📩 Message reçu => ", msg);
		// TODO: faire un truc

		const me = await getUserInfos();
		if (!me) {
			console.error("⚠️ Impossible de récupérer les informations de l'utilisateur.");
			return;
		}

		if (msg.type === "new_message") {
			const chatHistory = document.getElementById("chat-history");
			if (chatHistory) {
				const conversationId = chatHistory.getAttribute("data-conversation-id");
				if (conversationId && msg.data.conversationId !== parseInt(conversationId)) {
					return;
				}
				const isMe = msg.data.userId === me.id;
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

	};

	webSockets.chat.onclose = (event) => {
		console.log("❌ WebSocket déconnecté !", event);
		setTimeout(setupChatWebSocket, 3000);
	};

	webSockets.chat.onerror = (error) => {
		console.error("⚠️ Erreur WebSocket :", error);
	};
}
