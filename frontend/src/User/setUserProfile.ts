import { me } from "./me.js";
import { nbGames, nbWins } from "../utils.js";

function closeDropdown() {
  const dd = document.getElementById("dropdown-user");

  dd?.classList.remove("animate-slide-up");
  dd?.classList.add("animate-slide-down");

  setTimeout(() => {
    dd?.classList.add("hidden");
  }, 300);
}

function openDropdown(): void {
  const dd = document.getElementById("dropdown-user");
  dd?.classList.remove("hidden", "animate-slide-down");
  dd?.classList.add("animate-slide-up");
}

function manageDropdownClick() {
  const userButton = document.getElementById("user-button-navbar");
  const dropDown = document.getElementById("dropdown-user");

  if (!userButton || !dropDown) return;

  userButton.onclick = () => {
    const expanded = userButton.getAttribute("aria-expanded") === "true";

    if (expanded) {
      closeDropdown();
      userButton.setAttribute("aria-expanded", "false");
    } else {
      openDropdown();
      userButton.setAttribute("aria-expanded", "true");
    }
  };

  // clic extérieur
  document.addEventListener("click", (event) => {
    const isClickInside =
      dropDown.contains(event.target as Node) ||
      userButton.contains(event.target as Node);

    if (!isClickInside && !dropDown.classList.contains("hidden")) {
      closeDropdown();
      userButton.setAttribute("aria-expanded", "false");
    }
  });
}


export async function setUserProfile() {
	const userNameSpan = document.getElementById("username-navbar");
	const profilePicture = document.getElementById("profile-picture-navbar") as HTMLImageElement;
	const usernameDropdown = document.getElementById("username-dropdown");
	const emailDropdown = document.getElementById("email-dropdown");

	if (!userNameSpan || !profilePicture || !usernameDropdown || !emailDropdown)
		return;
	

	const user = await me();

	if (!user || !user.name || !user.picture || !user.email || !user.id || !user.games)
		return;

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

