import { me } from "./me.js";
import { nbGames, nbWins } from "../utils.js";
import { initTwoFaToggle } from "./TwoFa/initTwoFaToggle.js";

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
	document.addEventListener("click", event => {
		const isClickInside =
			dropDown.contains(event.target as Node) ||
			userButton.contains(event.target as Node);

		if (!isClickInside && !dropDown.classList.contains("hidden")) {
			closeDropdown();
			userButton.setAttribute("aria-expanded", "false");
		}
	});

	// clic sur un élément du dropdown
	dropDown.querySelectorAll("a, button").forEach(el => {
		el.addEventListener("click", () => {
			closeDropdown();
			userButton.setAttribute("aria-expanded", "false");
		});
	});
}

export async function setUserProfile() {
	const userNameSpan = document.getElementById("username-navbar");
	const profilePicture = document.getElementById(
		"profile-picture-navbar"
	) as HTMLImageElement;
	const usernameDropdown = document.getElementById("username-dropdown");
	const emailDropdown = document.getElementById("email-dropdown");

	if (!userNameSpan || !profilePicture || !usernameDropdown || !emailDropdown)
		return;

	const user = await me();

	if (
		!user ||
		!user.name ||
		!user.picture ||
		!user.email ||
		!user.id ||
		!user.games
	)
		return;

	const nb_wins = document.getElementById("nb-wins");
	if (nb_wins) {
		nb_wins.innerText = nbWins(user.games, user.id).toString();
	}

	const nb_games = document.getElementById("nb-games");
	if (nb_games) {
		nb_games.innerText = nbGames(user.games).toString();
	}

	if (!user.is_google_account) {
		const twofa_toggle = document.getElementById("2fa-toggle");
		if (!twofa_toggle) return;
		twofa_toggle.classList.remove("hidden");
		twofa_toggle.classList.add(
			"flex",
			"items-center",
			"justify-between",
			"px-4",
			"py-3",
			"text-gray-300",
			"hover:bg-white",
			"hover:bg-opacity-5",
			"rounded-xl",
			"transition-all",
			"duration-300"
		);
		twofa_toggle.innerHTML = `
		<div class="flex items-center gap-3">
										<i
											class="fas fa-shield-alt text-green-400"></i>
										<span
											class="font-medium"
											data-i18n="settings-twofa"
											>Two-Factor Auth</span
										>
									</div>
									<label
										class="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											id="toggle-2fa"
											class="sr-only peer" />
										<div
											class="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
									</label>
		`;

  		initTwoFaToggle();
		}

	userNameSpan.innerText = user.name;
	profilePicture.src = user.picture;
	usernameDropdown.innerText = user.name;
	emailDropdown.innerText = user.email;

	manageDropdownClick();
}
