import { showToast } from "../Views/triggerToast.js";
import { webSockets } from "../Views/viewManager.js";
import { getAccessToken } from "../utils.js";


export async function setupUserWebsocket() {
	const wsUrl = `ws://localhost:8000/ws/users`

	const token = getAccessToken();
	if (!token) return;

	webSockets.user = new WebSocket(wsUrl, ["Authorization", token]);

  
  webSockets.user.onopen = () => {
	console.log('WebSocket connection established');
  };


  webSockets.user.onmessage = (event) => {
	// TODO: faire une truc

	if (!event.data) return;

	const msg = JSON.parse(event.data);

	if (msg.type === "friend_request") {

		console.log("📩 Friend request received => ", msg);
		const friend = msg.friend;
		showToast({
			text: `${friend.name} send you a friend request !`,
			img: friend.picture,
			buttons: [
				{ label: "Accepter", onClick: () => alert("Partie acceptée !") },
				{ label: "Refuser", onClick: () => alert("Refusé !") }
			],
			duration: 8000 // 0 = ne s’enlève pas tant qu’on ferme pas
		});
	}
	
	console.log('Message from server:', event.data);
  };

  webSockets.user.onerror = (error) => {
	console.error('WebSocket error:', error);
  };

  webSockets.user.onclose = () => {
	console.log('WebSocket connection closed');
	setTimeout(setupUserWebsocket, 3000);

  };
}