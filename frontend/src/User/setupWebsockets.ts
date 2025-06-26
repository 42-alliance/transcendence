import { updateFriendStatus } from "../Friends/updateFriendStatus.js";
import { displayAllFriendsDynamically, displayPendingFriendsDynamically } from "../Views/Friends/Friends.js";
import { showToast } from "../Views/triggerToast.js";
import { addAttribute, goChat, miniPendingUserCard, writeStatus } from "../Views/userCard/userCard.js";
import { gameWsClass, navigateTo, webSockets } from "../Views/viewManager.js";
import { getAccessToken } from "../fetchApi.js";
import { sidebar_visibility } from "../sidebar.js";
import { createConversation } from "../Chat/createConversation.js";
import { getUserInfos } from "./me.js";
import { showPendingFriends } from "../Friends/showPendingRequest.js";

async function insertPendingFriendRequest(friend: any) {
	const incoming_card = document.getElementById("friend-list-card-incoming");
	if (!incoming_card) return;

	if (!friend || !friend.id || !friend.name || !friend.picture) {
		console.error("Invalid friend data:", friend);
		return;
	}

	const me = await getUserInfos();
	if (!me) return;

	const card = miniPendingUserCard(
		friend,
		async () => { await updateFriendStatus(friend.id, "accepted"); removePendingFriendRequest(friend); },
		async () => { await updateFriendStatus(friend.id, "rejected"); removePendingFriendRequest(friend); },
		async () => { navigateTo(`/game`);
				gameWsClass?.sendMessage("create_inv_game", {
					user: friend,
					type: "create_inv_game",
					conversationId: await createConversation([me.name, friend.name]),
				}); },
		async () => { await goChat(friend); }, // go chat
		async () => { navigateTo(`/${friend.name}`)},
	);

	let incomingFriendLengthElem = document.getElementById("incoming-friend-length");
	if (incomingFriendLengthElem) {
		const newLength = parseInt(incomingFriendLengthElem.innerHTML) + 1;
		incomingFriendLengthElem.innerHTML = newLength.toString();
	}

	document.getElementById("no-incoming-friend")?.classList.add("hidden");

	incoming_card.prepend(card);
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

function handleFriendRequest(msg: any) {
	const friend = msg.friend;
	showPendingFriends();

	showToast({
		text: `${friend.name} send you a friend request !`,
		img: friend.picture,
		buttons: [
			{ label: "Accept", onClick: async () => { await updateFriendStatus(friend.id, "accepted"); removePendingFriendRequest(friend) } },
			{ label: "Refuse", onClick: async () => { await updateFriendStatus(friend.id, "rejected"); removePendingFriendRequest(friend) } }
		],
		duration: 8000
	});
	insertPendingFriendRequest(friend);
}

function handleFriendRemoved(msg: any) {
	const id = msg.data.friend_id;
	removeFriendDiv(id);
	console.log("📩 Friend removed => ", msg);
}

function handleFriendshipStatusUpdate(msg: any) {
	const status = msg.data.status;
	if (status === "accepted") {
		const friend = msg.data.friend;
		showToast({
			text: `${friend.name} accepted your friend request !`,
			img: friend.picture,
			buttons: [],
			duration: 5000
		});
		sidebar_visibility();
		displayAllFriendsDynamically();
	} else if (status === "rejected") {
		console.log("📩 Friend request rejected => ", msg);
		displayPendingFriendsDynamically();
	}
}

function handleOnlineStatus(msg: any) {
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

function handleUserWebsocketMessage(event: MessageEvent) {
	if (!event.data) return;

	const msg = JSON.parse(event.data);

	console.log("msg.type == ", msg.type);

	switch (msg.type) {
		case "friend_request":
			handleFriendRequest(msg);
			break;
		case "friend_removed":
			handleFriendRemoved(msg);
			break;
		case "friendship_status_update":
			handleFriendshipStatusUpdate(msg);
			break;
		case "online_status":
			handleOnlineStatus(msg);
			break;
		default:
			console.log('Unknown message type:', msg.type);
	}

}

export async function setupUserWebsocket() {
	const wsUrl = `ws://localhost:8000/ws/users`;

	const token = getAccessToken();
	if (!token) return;

	webSockets.user = new WebSocket(wsUrl, ["Authorization", token]);

	webSockets.user.onopen = () => {
		console.log('WebSocket connection established');
	};

	webSockets.user.onmessage = handleUserWebsocketMessage;

	webSockets.user.onerror = (error) => {
		console.error('WebSocket error:', error);
	};

	webSockets.user.onclose = () => {
		console.log('WebSocket connection closed');
		setTimeout(setupUserWebsocket, 3000);
	};
}