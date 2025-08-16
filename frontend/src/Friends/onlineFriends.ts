import { UserData } from "../types.js";
import { GetUserByName } from "../User/getUserByName.js";
import { getUserInfos, me } from "../User/me.js";
import { navigateTo } from "../Views/viewManager.js";

let isUpdatingFriendList = false;

export async function showOnlineFriends() {
	if (isUpdatingFriendList) {
		console.warn("showOnlineFriends already running, skipping...");
		return;
	}
	isUpdatingFriendList = true;
	const onlineFriendsDiv = document.getElementById("online-friends");
	if (!onlineFriendsDiv) {
		isUpdatingFriendList = false;
		return;
	}

	const my_infos = await me();
	if (!my_infos) {
		console.warn("User is not logged in or user data is incomplete.");
		isUpdatingFriendList = false;
		return;
	}

	const friends = my_infos.friends;
	if (!friends || friends.length === 0) {
		clearOnlineFriendsList(onlineFriendsDiv);
		isUpdatingFriendList = false;
		return;
	}

	renderOnlineFriendsHeader(onlineFriendsDiv);

	for (const friend of friends) {
		if (document.getElementById(`friend-${friend.id}`)) {
			continue;
		}
		const li = await createFriendListItem(friend);
		onlineFriendsDiv.appendChild(li);
	}

	isUpdatingFriendList = false;
}

function clearOnlineFriendsList(container: HTMLElement) {
	container.innerHTML = "";
}

function renderOnlineFriendsHeader(container: HTMLElement) {
	container.innerHTML = `
		<li>
			<div class="flex justify-around items-center p-2 rounded-lg">
				<span class="ms-3 text-gray-900 dark:text-white">Online Friends</span>
			</div>
		</li>
	`;
}

async function createFriendListItem(friend: UserData): Promise<HTMLLIElement> {
	const li = document.createElement("li");
	li.id = `friend-${friend.id}`;

	const friendDiv = document.createElement("div");
	friendDiv.className = [
		"flex items-center justify-between px-2 py-1",
		"bg-[#645d59] rounded-lg hover:bg-[#8a807b] cursor-pointer"
	].join(" ");
	friendDiv.id = `friend${friend.id}`;

	const leftSection = await createFriendLeftSection(friend);

	friendDiv.appendChild(leftSection);

	friendDiv.addEventListener("click", () => {
		navigateTo(`/${friend.name}`);
	}); 

	li.appendChild(friendDiv);
	return li;
}

async function createFriendLeftSection(friend: UserData): Promise<HTMLDivElement> {
	if (!friend || !friend.name || !friend.picture) {
		console.warn("Friend data is incomplete or missing.");
		return document.createElement("div");
	}

	const leftSection = document.createElement("div");
	leftSection.className = "flex items-center gap-2";

	const profileWrapper = document.createElement("div");
	profileWrapper.className = "relative w-10 h-10 flex-shrink-0";

	const profileImg = document.createElement("img");
	profileImg.className = "w-10 h-10 rounded-full";
	profileImg.src = friend.picture;
	profileImg.alt = `${friend.name}'s profile picture`;

	const userData = await GetUserByName(friend.name);
	const statusColor =
		userData?.status === "online"
			? "bg-green-500"
			: userData?.status === "away"
			? "bg-yellow-500"
			: "bg-gray-500";

	const onlineCircle = document.createElement("div");
	onlineCircle.className = [
		"absolute bottom-0 right-0 w-3 h-3",
		statusColor,
		"rounded-full border-2 border-[#645d59]"
	].join(" ");

	profileWrapper.appendChild(profileImg);
	profileWrapper.appendChild(onlineCircle);

	const profileText = document.createElement("span");
	profileText.className = "ml-2 text-white text-base font-medium";
	profileText.innerText = friend.name;

	leftSection.appendChild(profileWrapper);
	leftSection.appendChild(profileText);

	return leftSection;
}

