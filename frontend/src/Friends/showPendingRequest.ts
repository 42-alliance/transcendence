import { UserData } from "../types.js";
import { getUserInfos } from "../User/me.js";
import { removePendingFriendRequest } from "../User/setupWebsockets.js";
import { navigateTo } from "../Views/viewManager.js";
import { updateFriendStatus } from "./updateFriendStatus.js";

export function createPendingFriendLeftSection(friend: UserData): HTMLDivElement {
	if (!friend || !friend.name || !friend.picture) {
		console.error("Invalid friend data provided");
		return document.createElement("div");
	}

	const profileImg = document.createElement("img");
	profileImg.classList.add("w-10", "h-10", "rounded-full");
	profileImg.src = friend.picture;
	profileImg.alt = `${friend.name}'s profile picture`;

	const profileText = document.createElement("span");
	profileText.classList.add("ml-2", "text-white", "text-base", "font-medium");
	profileText.innerText = friend.name.length > 7 ? friend.name.slice(0, 6) + "." : friend.name;

	const leftSection = document.createElement("div");
	leftSection.classList.add("flex", "items-center", "gap-2");
	leftSection.appendChild(profileImg);
	leftSection.appendChild(profileText);

	return leftSection;
}

export function createPendingFriendRightSection(friend: UserData): HTMLDivElement {
	const acceptBtn = document.createElement("button");
	acceptBtn.className = "p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition";
	acceptBtn.title = "Accepter";
	acceptBtn.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
		</svg>
	`;
	acceptBtn.onclick = async () => {
		await updateFriendStatus(friend.id!, "accepted");
		removePendingFriendRequest(friend);
	};

	const rejectBtn = document.createElement("button");
	rejectBtn.className = "p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition";
	rejectBtn.title = "Refuser";
	rejectBtn.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
		</svg>
	`;
	rejectBtn.onclick = async () => {
		await updateFriendStatus(friend.id!, "rejected");
		removePendingFriendRequest(friend);
	};

	const rightSection = document.createElement("div");
	rightSection.classList.add("flex", "items-center", "gap-2");
	rightSection.appendChild(acceptBtn);
	rightSection.appendChild(rejectBtn);

	return rightSection;
}

export function pendingFriendSidebarCard(friend: UserData): HTMLLIElement {
	const li = document.createElement("li");
	li.classList.add(`incoming-friend-${friend.id}`);

	const friendDiv = document.createElement("div");
	friendDiv.classList.add("flex", "items-center", "justify-between", "px-4", "py-3", "bg-[#645d59]", "rounded-lg", "hover:bg-[#8a807b]", "cursor-pointer", "transition-colors", "duration-200");

	const leftSection = createPendingFriendLeftSection(friend);
	const rightSection = createPendingFriendRightSection(friend);

	friendDiv.appendChild(leftSection);
	friendDiv.appendChild(rightSection);

	friendDiv.onclick = () => {
		navigateTo(`/${friend.name}`);
	};

	li.appendChild(friendDiv);
	return li;
}

export async function showPendingFriends() {
	const pendingFriendsDiv = document.getElementById("pending-requests");
	if (!pendingFriendsDiv) return;

	const me = await getUserInfos();
	if (!me || !me.incoming_friends || !me.outgoing_friends) {
		console.error("User data is incomplete or not loaded.");
		return;
	}

	const incomingFriends = me.incoming_friends;
	if (!incomingFriends || incomingFriends.length === 0) return;

	pendingFriendsDiv.innerHTML = `
		<div class="flex justify-around items-center p-2 rounded-lg">
			<span class="ms-3 text-gray-900 dark:text-white">Pending Requests</span>
		</div>
	`;

	incomingFriends.forEach(friend => {
		const li = pendingFriendSidebarCard(friend.user);
		pendingFriendsDiv.appendChild(li);
	});
}
