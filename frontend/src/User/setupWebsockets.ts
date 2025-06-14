import { updateFriendStatus } from "../Friends/updateFriendStatus.js";
import { showToast } from "../Views/triggerToast.js";
import { goChat, miniPendingUserCard } from "../Views/userCard/userCard.js";
import { webSockets } from "../Views/viewManager.js";
import { getAccessToken } from "../utils.js";

function insertPendingFriendRequest(friend: any) {
	const incoming_card = document.getElementById("friend-list-card-incoming");
	if (!incoming_card) return;

	if (!friend || !friend.id || !friend.name || !friend.picture) {
		console.error("Invalid friend data:", friend);
		return;
	}

	const card = miniPendingUserCard(
		friend,
		async () => { await updateFriendStatus(friend.id, "accepted"); },
		async () => { await updateFriendStatus(friend.id, "rejected"); },
		async () => {}, // invite to play
		async () => { await goChat(friend); }, // go chat
		async () => {}, // show profile
	);

	let incomingFriendLengthElem = document.getElementById("incoming-friend-length");
	if (incomingFriendLengthElem) {
		console.log("Current incoming friend length:", incomingFriendLengthElem);
		const newLength = parseInt(incomingFriendLengthElem.innerHTML) + 1;
		incomingFriendLengthElem.innerHTML = newLength.toString();
	}

	document.getElementById("no-incoming-friend")?.remove();

	incoming_card.prepend(card);
}

export async function setupUserWebsocket() {
	const wsUrl = `ws://localhost:8000/ws/users`

	const token = getAccessToken();
	if (!token) return;

	webSockets.user = new WebSocket(wsUrl, ["Authorization", token]);

  
  webSockets.user.onopen = () => {
	console.log('WebSocket connection established');
  };


  webSockets.user.onmessage = (event) => {
	if (!event.data) return;

	const msg = JSON.parse(event.data);

	if (msg.type === "friend_request") {

		console.log("📩 Friend request received => ", msg);
		const friend = msg.friend;
		console.log("Friend request from: ", friend);
		showToast({
			text: `${friend.name} send you a friend request !`,
			img: friend.picture,
			buttons: [
				{ label: "Accept", onClick: async () => await updateFriendStatus(friend.id, "accepted") },
				{ label: "Refuse", onClick: async () => await updateFriendStatus(friend.id, "rejected") }
			],
			duration: 8000 // 0 = ne s’enlève pas tant qu’on ferme pas
		});
		insertPendingFriendRequest(friend);
	}

	if (msg.type === "friend_removed") {
		const id = msg.data.friend_id;
		const friendElement = document.querySelectorAll(`.friend-${id}`);
		if (friendElement) {
			friendElement.forEach((el) => {
				el.remove();
			});
		}
		console.log("📩 Friend removed => ", msg);
	}

	console.log(msg);
	if (msg.type === "friendship_status_update" && msg.data.status === "accepted") {
		console.log("📩 Friend request accepted => ", msg);
		const friend = msg.data.friend;
		showToast({
			text: `${friend.name} accepted your friend request !`,
			img: friend.picture,
			buttons: [] ,
			duration: 5000 // 0 = ne s’enlève pas tant qu’on ferme pas
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