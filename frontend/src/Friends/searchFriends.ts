
export function openFriendSearch() {
	const friendSearchModal = document.getElementById("searchFriendsModal");

	if (!friendSearchModal)
		return;
	friendSearchModal.classList.remove("hidden");
}

export function closeFriendSearch() {
	const friendSearchModal = document.getElementById("searchFriendsModal");

	if (!friendSearchModal)
		return;
	friendSearchModal.classList.add("hidden");
}