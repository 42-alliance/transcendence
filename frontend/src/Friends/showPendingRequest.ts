import { getPendingFriendRequest } from "./getPendingFriendRequest.js";


export async function showPendingFriends() {
		const onlineFriendsDiv = document.getElementById("pending-requests");
	
		if (!onlineFriendsDiv)
			return;
	
		const friends = await getPendingFriendRequest();


		if (!friends ||  friends.incoming.length === 0)
			return;
	
		 friends.incoming.forEach(friend => {
			const li = document.createElement("li");
	
			const friendDiv = document.createElement("div");
			friendDiv.classList.add("flex", "items-center", "justify-between", "px-4", "py-3", "bg-[#645d59]", "rounded-lg", "hover:bg-[#8a807b]");
	
			// Image de profil
			const profileImg = document.createElement("img");
			profileImg.classList.add("w-10", "h-10", "rounded-full");
			profileImg.src = friend.user.picture || "";
			profileImg.alt = `${friend.user.name}'s profile picture`;
	
			// Nom (proche de l'image)
			const profileText = document.createElement("span");
			profileText.classList.add("ml-2", "text-white", "text-base", "font-medium");
			profileText.innerText = friend.user.name || "";
	
			// Container gauche (image + nom)
			const leftSection = document.createElement("div");
			leftSection.classList.add("flex", "items-center", "gap-2");
			leftSection.appendChild(profileImg);
			leftSection.appendChild(profileText);
	
			// Point vert
			const onlineCircle = document.createElement("div");
			onlineCircle.classList.add("w-3", "h-3", "bg-green-500", "rounded-full");
	
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