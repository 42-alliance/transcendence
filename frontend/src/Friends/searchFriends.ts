import { getAllUsers } from "../User/getAllUsers.js";
import { getUserInfos } from "../User/me.js";
import { addFriend } from "./addFriend.js";

export async function openFriendSearch() {
    const friendSearchModal = document.getElementById("searchFriendsModal");
    
    if (!friendSearchModal) return;
    friendSearchModal.classList.remove("hidden");

    const users = await getAllUsers();
    
    if (!users || users.length === 0) return;

    const searchUsersDiv = document.getElementById("searchUsersFriends");
    
    if (!searchUsersDiv) return;

    searchUsersDiv.innerHTML = "";

	const me = await getUserInfos();
	if (!me || !me.id) return;

    users.forEach(user => {
		if (user.id != me.id) {
			const userDiv = document.createElement("div");
			userDiv.classList.add("flex", "items-center", "justify-between", "p-2", "bg-gray-100", "rounded-lg", "shadow");
	
			const userImg = document.createElement("img");
			userImg.classList.add("w-10", "h-10", "rounded-full", "mr-3");
			userImg.src = user.picture;
			userImg.alt = `${user.name} picture`;
	
			const userSpan = document.createElement("span");
			userSpan.innerText = user.name;
			userSpan.classList.add("flex-1", "text-black");
	
			const userAdd = document.createElement("i");
			userAdd.classList.add("fa-solid", "fa-user-plus", "cursor-pointer", "text-blue-500", "hover:text-blue-700");

	
			userAdd.onclick = async () => {
				await addFriend(user.name);
			};
	
			userDiv.appendChild(userImg);
			userDiv.appendChild(userSpan);
			userDiv.appendChild(userAdd);
	
			searchUsersDiv.appendChild(userDiv);
		}
    });
}


export function closeFriendSearch() {
	const friendSearchModal = document.getElementById("searchFriendsModal");

	if (!friendSearchModal)
		return;
	friendSearchModal.classList.add("hidden");
}
