import { get } from "http";
import AView from "../AView.js";
import { getAllFriends } from "../../Friends/getAllFriends.js";
import { getUserInfos } from "../../User/me.js";
import { miniUserCard } from "../userCard/userCard.js";
import { getAllUsers } from "../../User/getAllUsers.js";
import { addFriend } from "../../Friends/addFriend.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("My Friends");
	}

	async getHtml() {
		try {
			const response = await fetch("src/Views/Friends/Friends.html");
			if (!response.ok) {
				throw new Error(
					`Failed to load HTML file: ${response.statusText}`
				);
			}
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Error loading content</p>`;
		}
	}
}

export async function injectFriends() {
	const test_card = document.getElementById("friend-list-card");
	if (!test_card) {
		return;
	}

	const friendsList = await getAllFriends();
	if (!friendsList) {
		return;
	}

	friendsList.forEach(friend => {
		miniUserCard(test_card, friend);
	});

	let all = document.getElementById("all-button");
	let pending = document.getElementById("pending-button");
	SetUpNotifs(all, pending);
}

export async function SetUpNotifs(all : HTMLElement | null, pending : HTMLElement | null) {
	const friends = await getAllFriends();
	let all_notifs = document.createElement("span");
	let pending_notifs = document.createElement("span");
	if (friends) {
		all_notifs.textContent = `${friends.length}`;
		all_notifs.className = "ml-1 px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded-full text-xs";
		pending_notifs.textContent = `${friends.filter(friend => friend.status === "pending").length}`;
		pending_notifs.className = "ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-orange-500/20 group-hover:text-orange-300";
	}
	

	all?.appendChild(all_notifs);
	pending?.appendChild(pending_notifs);
}

export async function FriendViewListener() {
	const all_users = await getAllUsers();
	if (!all_users) {
		return;
	}

	all_users.sort((a, b) => a.name.localeCompare(b.name));
	const me = await getUserInfos();
	if (!me) {
		return;
	}
	const friendsList = await getAllFriends();
	if (!friendsList) {
		return;
	}

	const myFriends = friendsList.map(friend => friend.name);

	document
		.getElementById("add-friend-btn")
		?.addEventListener("click", function () {
			const searchBar = document.getElementById("search-bar");
			if (!searchBar) return;
			searchBar.classList.remove("hidden", "opacity-0", "translate-y-2");
			searchBar.classList.add("opacity-100", "translate-y-0");
			document.getElementById("friend-search-input")?.focus();
		});

	document
		.getElementById("close-search")
		?.addEventListener("click", function () {
			const searchBar = document.getElementById("search-bar");
			if (!searchBar) return;
			const input = document.getElementById(
				"friend-search-input"
			) as HTMLInputElement;
			if (input) {
				input.value = "";
				input.blur();
			}
			searchBar.classList.add("opacity-0", "translate-y-2");
			setTimeout(() => searchBar.classList.add("hidden"), 300);
		});


	
	['input', 'focus'].forEach(eventType => {
	document
		.getElementById("friend-search-input")
		?.addEventListener(eventType, function (event) {
			const input = event.target as HTMLInputElement;
			const searchValue = input.value.toLowerCase();
			const suggestionsBox = document.getElementById(
				"friend-search-suggestions"
			) as HTMLDivElement;

			let html = "";
			let matchCount = 0;

			all_users.forEach(user => {
	if (
		user.name.toLowerCase().includes(searchValue) &&
		user.name.toLowerCase() !== me.name?.toLowerCase()
	) {
		const isFriend = myFriends.includes(user.name); // ou user.id si tu veux
		html += `
			<div class="suggestion flex items-center gap-3 p-3 hover:bg-orange-500/10 border-b border-orange-500/5 last:border-b-0" data-name="${user.name}">
				<img src="${user.picture}" class="w-9 h-9 rounded-full border border-orange-400/30" alt="picture">
				<div class="flex-1 min-w-0">
					<div class="text-white font-medium truncate">${user.name}</div>
				</div>
				${
					isFriend
					? `
					<!-- Bouton chat -->
					<button 
						class="chat-btn flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold shadow transition-all duration-200 ml-2"
						title="Ouvrir le chat"
						data-name="${user.name}"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/>
						</svg>
					</button>
					`
					: `
					<!-- Bouton Envoyer (ajouter comme ami) -->
					<button 
						class="send-request-btn flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold shadow transition-all duration-200 ml-2"
						title="Envoyer une demande"
						data-name="${user.name}"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"></path>
							<path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22L11 13L2 9l20-7z"></path>
						</svg>
					</button>
					`
				}
				<div class="relative">
					<button 
						class="more-options-btn flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-700/40 text-gray-400 hover:text-yellow-400 transition-all duration-200"
						title="Plus d'options"
						data-name="${user.name}"
						tabindex="0"
						type="button"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<circle cx="5" cy="12" r="1.5"></circle>
							<circle cx="12" cy="12" r="1.5"></circle>
							<circle cx="19" cy="12" r="1.5"></circle>
						</svg>
					</button>
					<!-- Dropdown -->
					<div class="dropdown-menu absolute right-0 top-10 mt-1 w-44 bg-gray-800 border border-orange-500/10 rounded-lg shadow-lg z-50 hidden">
						<button class="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-orange-500/20 hover:text-orange-400 transition-colors ban-user-btn">Bloquer cet utilisateur</button>
						<button class="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-orange-500/20 hover:text-orange-400 transition-colors quick-match-btn">Demander une partie rapide</button>
					</div>
				</div>
			</div>
		`;
		matchCount++;
	}
});


			if (!searchValue) {
				suggestionsBox.innerHTML = "";
				suggestionsBox.classList.add("hidden");
				return;
			}

			if (matchCount === 0) {
				suggestionsBox.innerHTML = `<div class="p-3 text-gray-400">No results found.</div>`;
				suggestionsBox.classList.remove("hidden");
				return;
			}

			suggestionsBox.innerHTML = html;
			suggestionsBox.classList.remove("hidden");
		});
	}
	);

	// BONUS : gestion du clic sur une suggestion (remplit l'input)
	document
		.getElementById("friend-search-suggestions")
		?.addEventListener("click", function (e) {
			const input = document.getElementById(
				"friend-search-input"
			) as HTMLInputElement;
			const target = e.target as HTMLElement;
			const suggestion = target.closest(
				".suggestion"
			) as HTMLDivElement | null;
			if (suggestion && input) {
				const name = suggestion.getAttribute("data-name") || "";
				input.value = name;
				(this as HTMLDivElement).classList.add("hidden");
				// Tu peux déclencher une action ici (ajouter l'ami, ouvrir profil, etc.)
			}
		});

	// BONUS : cacher suggestions si on clique ailleurs
	document.addEventListener("click", function (e) {
		const input = document.getElementById("friend-search-input");
		const box = document.getElementById("friend-search-suggestions");
		if (
			input &&
			box &&
			!input.contains(e.target as Node) &&
			!box.contains(e.target as Node)
		) {
			box.classList.add("hidden");
		}
	});

	document.getElementById('friend-search-suggestions')?.addEventListener('click', async function(e) {
	const input = document.getElementById('friend-search-input') as HTMLInputElement;
	const target = e.target as HTMLElement;

	if (target.closest('.send-request-btn')) {
		const name = (target.closest('.send-request-btn') as HTMLElement).getAttribute('data-name');
		if (!name) return;
		await addFriend(name);
		return;
	}

	// Clic sur bouton "3 points"
	if (target.closest('.more-options-btn')) {
		const name = (target.closest('.more-options-btn') as HTMLElement).getAttribute('data-name');
		// Remplace ce log par ton menu/options
		console.log('Plus d’options pour', name);
		// Optionnel : ouvrir un menu contextuel, etc.
		return;
	}

	// Clic sur la suggestion (hors boutons)
	const suggestion = target.closest('.suggestion') as HTMLDivElement | null;
	if (suggestion && input && !target.closest('button')) {
		const name = suggestion.getAttribute('data-name') || "";
		input.value = name;
		(this as HTMLDivElement).classList.add('hidden');
		// Tu peux déclencher une action ici (afficher profil, etc.)
	}
	});
	
}
