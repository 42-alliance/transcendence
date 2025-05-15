import { getAllFriends } from "./getAllFriends.js";

export async function showOnlineFriends() {
	const onlineFriendsDiv = document.getElementById("online-friends");
	
	if (!onlineFriendsDiv)
		return;
	
	const friends = await getAllFriends();
	
	if (!friends || friends.length == 0)
		return;

	friends.forEach(friend => {
		const friendDiv = document.createElement('div');
		friendDiv.classList.add("flex", "items-center", "justify-between", "px-4", "py-3", "bg-amber-900", "rounded-lg");

		const profileImg = document.createElement('img');
		profileImg.classList.add("w-10", "rounded-full");
		profileImg.src = friend.picture;

		const profileText = document.createElement('span');
		profileText.innerText = friend.name;

		const onlineCircle = document.createElement('div');
		onlineCircle.classList.add("w-3", "h-3", "bg-green-500", "rounded-full");

		friendDiv.appendChild(profileImg);
		friendDiv.appendChild(profileText);
		friendDiv.appendChild(onlineCircle);

		onlineFriendsDiv.appendChild(friendDiv);
	});
}
