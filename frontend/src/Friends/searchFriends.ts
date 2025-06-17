import { IUser } from "../types.js";
import { getAllUsers, User } from "../User/getAllUsers.js";
import { getUserInfos } from "../User/me.js";
import { displayAllFriendsDynamically, displayPendingFriendsDynamically } from "../Views/Friends/Friends.js";
import { showToast } from "../Views/triggerToast.js";
import { addFriend } from "./addFriend.js";
import { Friends, getAllFriends } from "./getAllFriends.js";

let searchInputHandler: ((event: Event) => void) | null = null;
let originalUserOrder: Map<number, number> = new Map(); // Stocker l'ordre d'origine

function renderUsers(filteredUsers: User[], me: IUser, searchUsersDiv: HTMLElement, userElements: Map<number, HTMLElement>) {
    const filteredUserIds = new Set(filteredUsers.map(user => user.id));

    for (const [userId, userDiv] of userElements) {
        if (!filteredUserIds.has(userId)) {
            userDiv.remove();
            userElements.delete(userId);
        }
    }

    filteredUsers.sort((a, b) => (originalUserOrder.get(a.id) || 0) - (originalUserOrder.get(b.id) || 0));

    filteredUsers.forEach(user => {
        if (user.id !== me.id && !userElements.has(user.id)) {
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
				console.log("Adding friend: ", user.name);
                await addFriend(user.name);
            };

            userDiv.appendChild(userImg);
            userDiv.appendChild(userSpan);
            userDiv.appendChild(userAdd);

            const existingElements = Array.from(searchUsersDiv.children);
            let inserted = false;

            for (let i = 0; i < existingElements.length; i++) {
                const existingId = Number(existingElements[i].getAttribute("data-user-id"));
                if (originalUserOrder.get(user.id)! < originalUserOrder.get(existingId)!) {
                    searchUsersDiv.insertBefore(userDiv, existingElements[i]);
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                searchUsersDiv.appendChild(userDiv);
            }

            userDiv.setAttribute("data-user-id", user.id.toString());
            userElements.set(user.id, userDiv);
        }
    });
}

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

    const userElements = new Map<number, HTMLElement>();

    originalUserOrder = new Map(users.map((user, index) => [user.id, index]));

    renderUsers(users, me, searchUsersDiv, userElements);

    const searchFriendsInput = document.getElementById('searchFriendsInput') as HTMLInputElement | null;
    if (!searchFriendsInput) return;

    searchInputHandler = (event: Event) => {
        const target = event.target as HTMLInputElement | null;
        if (!target) return;
        const searchValue = target.value.toLowerCase();
        const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchValue));
        renderUsers(filteredUsers, me, searchUsersDiv, userElements);
    };

    searchFriendsInput.addEventListener('input', searchInputHandler);
}

export function closeFriendSearch() {
    const friendSearchModal = document.getElementById("searchFriendsModal");
    if (!friendSearchModal) return;

    const searchFriendsInput = document.getElementById('searchFriendsInput') as HTMLInputElement | null;
    if (!searchFriendsInput) return;

    if (searchInputHandler) {
        searchFriendsInput.removeEventListener('input', searchInputHandler);
        searchInputHandler = null;
    }

    friendSearchModal.classList.add("hidden");
}

function renderFriendsList(friends: Friends[]) {
    console.log("RENDER FRIENDS");
    for (const friend of friends) {
        console.log("RENDER => ", friend.name);
        const userDiv = document.createElement("div");
            userDiv.classList.add("flex", "w-max", "items-center", "justify-between", "p-2", "bg-gray-100", "rounded-lg", "shadow", "friends-list-element");

            const userImg = document.createElement("img");
            userImg.classList.add("w-10", "h-10", "rounded-full", "mr-3");
            userImg.src = friend.picture;
            userImg.alt = `${friend.name} picture`;

            const userSpan = document.createElement("span");
            userSpan.innerText = friend.name;
            userSpan.classList.add("flex-1", "text-black");

            const userAdd = document.createElement("i");

            console.log("DEBUG STATUS ==> ", friend.status);
            if (friend.status === "pending") {
                userAdd.classList.add("fa-solid", "fa-clock", "cursor-pointer", "text-blue-500", "hover:text-blue-700");                
            } else {
                userAdd.classList.add("fa-solid", "fa-user-plus", "cursor-pointer", "text-blue-500", "hover:text-blue-700");
            }

            // userAdd.onclick = async () => {
            //     await addFriend(friend.name);
            // };

            userDiv.appendChild(userImg);
            userDiv.appendChild(userSpan);
            userDiv.appendChild(userAdd);

            const parentDiv = document.getElementById("friends-map");
            parentDiv?.appendChild(userDiv);
    }
}

export async function openFriendList() {
    console.log("OPEN FRIENDS LIST");
    const friendListModal = document.getElementById("friends-list-modal");
    if (!friendListModal) return;
    friendListModal.classList.remove("hidden");

    const friends = await getAllFriends();
    console.log("Friends => ", friends);
    if (!friends || friends.length === 0) return;

    const searchUsersDiv = document.getElementById("searchUsersFriends");
    if (!searchUsersDiv) return;
    searchUsersDiv.innerHTML = "";

    renderFriendsList(friends);
}

export function closeFriendList() {
    const friendSearchModal = document.getElementById("friends-list-modal");
    if (!friendSearchModal) return;

    friendSearchModal.querySelectorAll(".friends-list-element").forEach(div => div.remove());

    friendSearchModal.classList.add("hidden");
}