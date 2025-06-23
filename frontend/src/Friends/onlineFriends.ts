import { UserData } from "../types.js";
import { GetUserByName } from "../User/getUserByName.js";
import { getAllFriends } from "./getAllFriends.js";

let isUpdatingFriendList = false;

export async function showOnlineFriends() {
	if (isUpdatingFriendList) {
		console.warn("showOnlineFriends already running, skipping...");
		return;
	}
	isUpdatingFriendList = true;
	const onlineFriendsDiv = document.getElementById("online-friends");
	console.log("showOnlineFriends called");

	if (!onlineFriendsDiv) return;

	const friends = await getAllFriends();

	if (!friends || friends.length === 0) return;

	onlineFriendsDiv.innerHTML = `
	<li>
							<div
								class="flex justify-around items-center p-2 rounded-lg">
								<span class="ms-3 text-gray-900 dark:text-white"
									>Online Friends</span
								>
							</div>
						</li>
	`; // Clear previous content
	let i = 0;
	for (const friend of friends) {
		console.error("i => ", i);
		if (i >= friends.length) {
			console.error("find a duplication");
			return;
		}
		i += 1;

		// Check if a friend li with the same class already exists
		if (document.getElementById(`friend-${friend.id}`)) {
			console.error("find a duplication");
			continue; // Skip this friend instead of returning
		}
		const li = document.createElement("li");
		li.id = `friend-${friend.id}`;

		const friendDiv = document.createElement("div");
		friendDiv.classList.add(
			"flex",
			"items-center",
			"justify-between",
			"px-2",
			"py-1",
			"bg-[#645d59]",
			"rounded-lg",
			"hover:bg-[#8a807b]",
			"cursor-pointer"
		);
		friendDiv.id = `friend${friend.id}`;

		// Image de profil imbriquée avec le point de statut
		const profileWrapper = document.createElement("div");
		profileWrapper.classList.add("relative", "w-10", "h-10", "flex-shrink-0");

		const profileImg = document.createElement("img");
		profileImg.classList.add("w-10", "h-10", "rounded-full");
		profileImg.src = friend.picture!;
		profileImg.alt = `${friend.name}'s profile picture`;

		const f = await GetUserByName(friend.name!);
		const onlineCircle = document.createElement("div");
		onlineCircle.classList.add(
			"absolute",
			"bottom-0",
			"right-0",
			"w-3",
			"h-3",
			f?.status === "online" ? "bg-green-500" : f?.status === "away" ? "bg-yellow-500" : "bg-gray-500",
			"rounded-full",
			"border-2",
			"border-[#645d59]"
		);

		profileWrapper.appendChild(profileImg);
		profileWrapper.appendChild(onlineCircle);

		// Nom (proche de l'image)
		const profileText = document.createElement("span");
		profileText.classList.add(
			"ml-2",
			"text-white",
			"text-base",
			"font-medium"
		);
		profileText.innerText = friend.name!;

		// Container gauche (image + nom)
		const leftSection = document.createElement("div");
		leftSection.classList.add("flex", "items-center", "gap-2");
		leftSection.appendChild(profileWrapper);
		leftSection.appendChild(profileText);

		// Container droite (peut contenir d'autres éléments à droite)
		const rightSection = document.createElement("div");
		rightSection.classList.add("flex", "items-center", "gap-3");

		friendDiv.appendChild(leftSection);
		friendDiv.appendChild(rightSection);

		friendDiv.addEventListener('click', () => {
			window.location.href = `/${friend.name}`;
		})
		li.appendChild(friendDiv);

		onlineFriendsDiv.appendChild(li);
	}
}
