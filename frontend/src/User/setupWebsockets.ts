import { updateFriendStatus } from "../Friends/updateFriendStatus.js";
import { displayAllFriendsDynamically, displayPendingFriendsDynamically } from "../Views/Friends/Friends.js";
import { showToast } from "../Views/triggerToast.js";
import { addAttribute, goChat, miniPendingUserCard, writeStatus } from "../Views/userCard/userCard.js";
import { webSockets } from "../Views/viewManager.js";
import { getAccessToken } from "../utils.js";
import { sidebar_visibility } from "../sidebar.js";

function insertPendingFriendRequest(friend: any) {
	const incoming_card = document.getElementById("friend-list-card-incoming");
	if (!incoming_card) return;

	if (!friend || !friend.id || !friend.name || !friend.picture) {
		console.error("Invalid friend data:", friend);
		return;
	}

	const card = miniPendingUserCard(
		friend,
		async () => { await updateFriendStatus(friend.id, "accepted"); removePendingFriendRequest(friend); },
		async () => { await updateFriendStatus(friend.id, "rejected"); removePendingFriendRequest(friend); },
		async () => {}, // TODO: invite to play
		async () => { await goChat(friend); }, // go chat
		async () => {}, // TODO: show profile
	);

	let incomingFriendLengthElem = document.getElementById("incoming-friend-length");
	if (incomingFriendLengthElem) {
		console.log("Current incoming friend length:", incomingFriendLengthElem);
		const newLength = parseInt(incomingFriendLengthElem.innerHTML) + 1;
		incomingFriendLengthElem.innerHTML = newLength.toString();
	}

	document.getElementById("no-incoming-friend")?.classList.add("hidden");

	incoming_card.prepend(card);

	console.log("Inserted pending friend request for:", friend.name);
	// console.log("Inserting pending friend request for:", friend);
	// const li = pendingFriendSidebarCard(friend);

	// const header = document.getElementById("pending-friend-header");
	// if (!header) return;

	// header.after(li);
}

export function removePendingFriendRequest(friend: any) {
	const incomingFriendElem = document.querySelectorAll(`.incoming-friend-${friend.id}`);
	if (!incomingFriendElem) return;

	incomingFriendElem.forEach((elem) => {
		elem.remove();
	});

	let incomingFriendLengthElem = document.getElementById("incoming-friend-length");
	if (incomingFriendLengthElem) {
		const newLength = parseInt(incomingFriendLengthElem.innerHTML) - 1;
		incomingFriendLengthElem.innerHTML = newLength.toString();

		if (newLength <= 0) {
			document.getElementById("no-incoming-friend")?.classList.remove("hidden");
		}
	}
}

function changeStatusOnline(userId: number, status: string) {
	const userStatusElem = document.querySelectorAll(`.status-indicator-${userId}`);
	if (!userStatusElem) return;

	if (status === "online") {
		userStatusElem.forEach((elem) => {
			addAttribute(elem, "online");
		});
	}
	else if (status === "offline") {
		userStatusElem.forEach((elem) => {
			addAttribute(elem, "offline");
		});
	}
	else if (status === "away") {
		userStatusElem.forEach((elem) => {
			addAttribute(elem, "away");
		});
	}
	else if (status === "inGame") {
		userStatusElem.forEach((elem) => {
			addAttribute(elem, "inGame");
		});
	}
}

export function removeFriendDiv(friendId: number) {
	const friendElement = document.querySelectorAll(`.friend-${friendId}`);
	if (friendElement) {
		friendElement.forEach((el) => {
			el.remove();
		});
	}
}

export async function setupUserWebsocket() {
	const wsUrl = `ws://localhost:8000/ws/users`

	const token = getAccessToken();
	if (!token) return;

	webSockets.user = new WebSocket(wsUrl, ["Authorization", token]);

  
  webSockets.user.onopen = () => {
	console.log('WebSocket connection established');
  };


  webSockets.user.onmessage = async (event) => {
	if (!event.data) return;

	const msg = JSON.parse(event.data);


	console.log("msg.type == ", msg.type)
	if (msg.type === "friend_request") {

		console.log("📩 Friend request received => ", msg);
		const friend = msg.friend;
		console.log("Friend request from: ", friend);
		await sidebar_visibility();

		showToast({
			text: `${friend.name} send you a friend request !`,
			img: friend.picture,
			buttons: [
				{ label: "Accept", onClick: async () => { await updateFriendStatus(friend.id, "accepted"); removePendingFriendRequest(friend) } },
				{ label: "Refuse", onClick: async () => { await updateFriendStatus(friend.id, "rejected"); removePendingFriendRequest(friend) } }
			],
			duration: 8000 // 0 = ne s’enlève pas tant qu’on ferme pas
		});
		insertPendingFriendRequest(friend);
	}

	else if (msg.type === "friend_removed") {
		const id = msg.data.friend_id;
		removeFriendDiv(id);
		console.log("📩 Friend removed => ", msg);
	}

	else if (msg.type === "friendship_status_update" && msg.data.status === "accepted") {
		console.log("📩 Friend request accepted => ", msg);
		const friend = msg.data.friend;
		showToast({
			text: `${friend.name} accepted your friend request !`,
			img: friend.picture,
			buttons: [] ,
			duration: 5000 // 0 = ne s’enlève pas tant qu’on ferme pas
		});
		sidebar_visibility();
		displayAllFriendsDynamically();
	}
	else if (msg.type === "friendship_status_update" && msg.data.status === "rejected") {
		console.log("📩 Friend request rejected => ", msg);
		displayPendingFriendsDynamically();
	}
	else if (msg.type === "online_status") {
		const userId = msg.user_id;
		const status = msg.status;
		
		const all_indicators = document.querySelectorAll(`.status-indicator-${userId}`);
		if (all_indicators) {
			all_indicators.forEach((elem) => {
				addAttribute(elem, status);
			});
		}

		const all_status_texts = document.querySelectorAll(`.status-text-${userId}`);
		if (all_status_texts) {
			all_status_texts.forEach((elem) => {
				writeStatus(elem, status);
			});
		}
		sidebar_visibility();
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