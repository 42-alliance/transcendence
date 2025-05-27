import { deleteUser } from "./deleteUser.js";
import { getUserInfos } from "./me.js";

export async function setUserProfile() {
	const userNameSpan = document.getElementById("username-navbar");
	if (!userNameSpan) return;

	const profilePicture = document.getElementById(
		"profile-picture-navbar"
	) as HTMLImageElement;
	if (!profilePicture) return;

	const user = await getUserInfos();
	if (!user || !user.name || !user.picture) return;

	userNameSpan.innerText = user.name;
	profilePicture.src = user.picture;

	const usernameDropdown = document.getElementById("username-dropdown");
	if (!usernameDropdown) return;

	usernameDropdown.innerText = user.name;

	const userButton = document.getElementById("user-button-navbar");
	if (!userButton) return;

	userButton.onclick = async () => {
		const dropDown = document.getElementById("dropdown-user");
		if (!dropDown) return;

		if (userButton.ariaExpanded === "false") {
			dropDown.classList.remove("hidden");

			userButton.ariaExpanded = "true";
		} else {
			dropDown.classList.add("hidden");
			userButton.ariaExpanded = "false";
		}
	};
}
