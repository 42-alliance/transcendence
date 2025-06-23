import { getUserInfos } from "./me.js";
import { userIsLogin } from "./userIsLogin.js";
import { nbGames, nbWins } from "../utils.js";

function ifUserIsNotLog() {
	const userButton = document.getElementById("user-button-navbar");
	if (!userButton) return;

	userButton.innerHTML = "";
}

function manageDropdownClick() {
	const userButton = document.getElementById("user-button-navbar");
	const dropDown = document.getElementById("dropdown-user");

	if (!userButton || !dropDown) return;

	userButton.onclick = () => {
		const expanded = userButton.ariaExpanded === "true";
		userButton.ariaExpanded = expanded ? "false" : "true";
		dropDown.classList.toggle("hidden", expanded);
	};

	document.addEventListener("click", (event) => {
		const isClickInside = dropDown.contains(event.target as Node) || userButton.contains(event.target as Node);
		if (!isClickInside && !dropDown.classList.contains("hidden")) {
			dropDown.classList.add("hidden");
			userButton.ariaExpanded = "false";
		} else if (dropDown.contains(event.target as Node)) {
			dropDown.classList.add("hidden");
			userButton.ariaExpanded = "false";
		}
	});
}

export async function setUserProfile() {
	if (await userIsLogin() === false) {
		ifUserIsNotLog();
		return;
	}

	const userNameSpan = document.getElementById("username-navbar");
	const profilePicture = document.getElementById("profile-picture-navbar") as HTMLImageElement;
	const usernameDropdown = document.getElementById("username-dropdown");
	const emailDropdown = document.getElementById("email-dropdown");
	const profil_link_sidebar = document.getElementById("profile-link-sidebar") as HTMLAnchorElement;

	if (!userNameSpan || !profilePicture || !usernameDropdown || !emailDropdown || !profil_link_sidebar)
		return;

	const user = await getUserInfos();
	if (!user || !user.name || !user.picture || !user.email || !user.id || !user.games)
		return;

	profil_link_sidebar.href = `/${user.name}`;

	const nb_wins = document.getElementById("nb-wins");
	if (nb_wins) {
		nb_wins.innerText = nbWins(user.games, user.id).toString();
	}

	const nb_games = document.getElementById("nb-games");
	if (nb_games) {
		nb_games.innerText = nbGames(user.games).toString();
	}

	userNameSpan.innerText = user.name;
	profilePicture.src = user.picture;
	usernameDropdown.innerText = user.name;
	emailDropdown.innerText = user.email;

	manageDropdownClick();
}

