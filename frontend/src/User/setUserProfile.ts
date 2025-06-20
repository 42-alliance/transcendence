import { getUserInfos } from "./me.js";
import { userIsLogin } from "./userIsLogin.js";

function ifUserIsNotLog() {
	const userButton = document.getElementById("user-button-navbar");
	if (!userButton) return;

	userButton.innerHTML = "";
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
	const userButton = document.getElementById("user-button-navbar");
	const dropDown = document.getElementById("dropdown-user");

	if (!userNameSpan || !profilePicture || !usernameDropdown || !emailDropdown || !userButton || !dropDown !)
		return;

	const user = await getUserInfos();
	if (!user || !user.name || !user.picture || !user.email)
		return;

	const profileLink = document.getElementById("profile-link") as HTMLAnchorElement;
	if (profileLink)
		profileLink.href = `/${user.name}`;

	const nb_wins = document.getElementById("nb-wins");
	if (nb_wins) {
		nb_wins.innerText = user.games?.filter(game => game.winner === user.id).length.toString() || "0";
	}

	const nb_games = document.getElementById("nb-games");
	if (nb_games) {
		nb_games.innerText = user.games?.length.toString() || "0";
	}

	userNameSpan.innerText = user.name;
	profilePicture.src = user.picture;
	usernameDropdown.innerText = user.name;
	emailDropdown.innerText = user.email;

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
		}
	});
}

