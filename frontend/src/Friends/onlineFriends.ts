import { on } from "events";
import { getAllFriends } from "./getAllFriends.js";

async function setupSearchFriendButton() {
	const searchFriendButton = document.getElementById("search-friend-button");
	if (!searchFriendButton) return;

	searchFriendButton.onclick = () => {
		const searchFriendModal = document.getElementById(
			"search-friend-modal"
		);
		if (!searchFriendModal) return;

		searchFriendModal.classList.remove("hidden");
	};
}

export async function showOnlineFriends() {
	await setupSearchFriendButton();

	const onlineFriendsDiv = document.getElementById("online-friends");

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
								<svg
									id="search-friend-button"
									class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 640 512">
									<path
										d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
								</svg>
							</div>
						</li>
	`; // Clear previous content
	friends.forEach(friend => {
		const li = document.createElement("li");
		li.classList.add(`friend-${friend.id}`);

		const friendDiv = document.createElement("div");
		friendDiv.classList.add(
			"flex",
			"items-center",
			"justify-between",
			"px-4",
			"py-3",
			"bg-[#645d59]",
			"rounded-lg",
			"hover:bg-[#8a807b]"
		);

		// Image de profil
		const profileImg = document.createElement("img");
		profileImg.classList.add("w-10", "h-10", "rounded-full");
		profileImg.src = friend.picture;
		profileImg.alt = `${friend.name}'s profile picture`;

		// Nom (proche de l'image)
		const profileText = document.createElement("span");
		profileText.classList.add(
			"ml-2",
			"text-white",
			"text-base",
			"font-medium"
		);
		profileText.innerText = friend.name;

		// Container gauche (image + nom)
		const leftSection = document.createElement("div");
		leftSection.classList.add("flex", "items-center", "gap-2");
		leftSection.appendChild(profileImg);
		leftSection.appendChild(profileText);

		// Point vert
		const onlineCircle = document.createElement("div");
		onlineCircle.classList.add(
			"w-3",
			"h-3",
			"bg-green-500",
			"rounded-full"
		);

		// Container droite (point vert + enveloppe)
		const rightSection = document.createElement("div");
		rightSection.classList.add("flex", "items-center", "gap-3");
		rightSection.appendChild(onlineCircle);

		friendDiv.appendChild(leftSection);
		friendDiv.appendChild(rightSection);

		li.appendChild(friendDiv);

		onlineFriendsDiv.appendChild(li);
	});
}
