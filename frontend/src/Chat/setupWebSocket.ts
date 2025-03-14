import { getAccessToken } from "../utils.js";
import { webSockets } from "../Views/viewManager.js";

export function setupChatWebSocket() {
	const wsUrl = `ws://localhost:8000/ws/chat`
	
	const token = getAccessToken();

	if (!token)
		return;

	webSockets.chat = new WebSocket(wsUrl, ["Authorization", token]);

	webSockets.chat.onopen = () => {
		console.log(`✅ Connecté a la websocket de chat`);
	}

	webSockets.chat.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("📩 Message reçu => ", data);
		// TODO: faire un truc
	};

	webSockets.chat.onclose = (event) => {
		console.log("❌ WebSocket déconnecté !", event);
		setTimeout(setupChatWebSocket, 3000);
	};

	webSockets.chat.onerror = (error) => {
		console.error("⚠️ Erreur WebSocket :", error);
	};
}
