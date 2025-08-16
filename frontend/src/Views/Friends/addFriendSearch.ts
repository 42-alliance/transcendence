import { createConversation } from "../../Chat/createConversation.js";
import { addFriend } from "../../Friends/addFriend.js";
import { getAllUsers } from "../../User/getAllUsers.js";
import { getUserInfos } from "../../User/me.js";
import { navigateTo } from "../viewManager.js";

// Handles the "add friend" search bar logic
export async function setupAddFriendSearchBar() {
	const all_users = await getAllUsers();
	if (!all_users) return;

	all_users.sort((a, b) => a.name!.localeCompare(b.name!));

	const me = await getUserInfos();
	if (!me || !me.friends) return;

	const friendsList = me.friends;
	const myFriends = friendsList.map(friend => friend.name!);

	setupAddFriendButton();
	setupCloseSearchButton();
	setupSearchInput(all_users, me, myFriends);
	setupSuggestionsClickHandlers(me);
	setupOutsideClickHandler();
}

function setupAddFriendButton() {
	document.getElementById("add-friend-btn")?.addEventListener("click", function () {
		const searchBar = document.getElementById("search-bar");
		if (!searchBar) return;
		searchBar.classList.remove("hidden", "opacity-0", "translate-y-2");
		searchBar.classList.add("opacity-100", "translate-y-0");
		document.getElementById("friend-search-input")?.focus();
	});
}

function setupCloseSearchButton() {
	document.getElementById("close-search")?.addEventListener("click", function () {
		const searchBar = document.getElementById("search-bar");
		if (!searchBar) return;
		const input = document.getElementById("friend-search-input") as HTMLInputElement;
		if (input) {
			input.value = "";
			input.blur();
		}
		searchBar.classList.add("opacity-0", "translate-y-2");
		setTimeout(() => searchBar.classList.add("hidden"), 300);
	});
}

function setupSearchInput(all_users: any[], me: any, myFriends: string[]) {
	['input', 'focus'].forEach(eventType => {
		document.getElementById("friend-search-input")?.addEventListener(eventType, function (event) {
			const input = event.target as HTMLInputElement;
			const searchValue = input.value.toLowerCase();
			const suggestionsBox = document.getElementById("friend-search-suggestions") as HTMLDivElement;

			const html = buildSuggestionsHtml(all_users, me, myFriends, searchValue);
			const matchCount = countMatches(all_users, me, searchValue);

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
	});
}

function buildSuggestionsHtml(all_users: any[], me: any, myFriends: string[], searchValue: string): string {
	let html = "";
	all_users.forEach(user => {
		if (!user.name) {
			console.error("User without name found:", user);
			return;
		}
		if (
			user.name.toLowerCase().includes(searchValue) &&
			user.name.toLowerCase() !== me.name!.toLowerCase()
		) {
			const isFriend = myFriends.includes(user.name);
			html += `
				<div class="suggestion flex items-center gap-3 p-3 hover:bg-orange-500/10 border-b border-orange-500/5 last:border-b-0" data-name="${user.name}">
					<img src="${user.picture}" class="w-9 h-9 rounded-full border border-orange-400/30" alt="picture">
					<div class="flex-1 min-w-0">
						<div class="text-white font-medium truncate">${user.name}</div>
					</div>
					${
						isFriend
						? chatButtonHtml(user)
						: sendRequestButtonHtml(user)
					}
					${moreOptionsHtml(user)}
				</div>
			`;
		}
	});
	return html;
}

function countMatches(all_users: any[], me: any, searchValue: string): number {
	let count = 0;
	all_users.forEach(user => {
		if (
			user.name &&
			user.name.toLowerCase().includes(searchValue) &&
			user.name.toLowerCase() !== me.name!.toLowerCase()
		) {
			count++;
		}
	});
	return count;
}

function chatButtonHtml(user: any): string {
	return `
		<button 
			class="chat-btn flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold shadow transition-all duration-200 ml-2"
			title="Ouvrir le chat"
			data-name="${user.name}" data-id="${user.id}"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/>
			</svg>
		</button>
	`;
}

function sendRequestButtonHtml(user: any): string {
	return `
		<button 
			class="send-request-btn flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold shadow transition-all duration-200 ml-2"
			title="Envoyer une demande"
			data-name="${user.name}" data-id="${user.id}"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"></path>
				<path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22L11 13L2 9l20-7z"></path>
			</svg>
		</button>
	`;
}

function moreOptionsHtml(user: any): string {
	return `
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
			<div class="dropdown-menu absolute right-0 top-10 mt-1 w-44 bg-gray-800 border border-orange-500/10 rounded-lg shadow-lg z-50 hidden">
				<button class="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-orange-500/20 hover:text-orange-400 transition-colors ban-user-btn">Bloquer cet utilisateur</button>
				<button class="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-orange-500/20 hover:text-orange-400 transition-colors quick-match-btn">Demander une partie rapide</button>
			</div>
		</div>
	`;
}

function setupSuggestionsClickHandlers(me: any) {
	document.getElementById("friend-search-suggestions")?.addEventListener("click", async function(e) {
		const input = document.getElementById('friend-search-input') as HTMLInputElement;
		const target = e.target as HTMLElement;

		if (target.closest('.send-request-btn')) {
			const name = (target.closest('.send-request-btn') as HTMLElement).getAttribute('data-name');
			if (!name) return;
			await addFriend(name);
			return;
		}

		if (target.closest('.chat-btn')) {
			const name = (target.closest('.chat-btn') as HTMLElement).getAttribute('data-name');
			if (!name) return;

			const conv_id = await createConversation([me.name!, name]);
			navigateTo(`/chat/${conv_id}`);
			return;
		}

		if (target.closest('.more-options-btn')) {
			const name = (target.closest('.more-options-btn') as HTMLElement).getAttribute('data-name');
			// TODO: Implement more options logic
			console.log('Plus d’options pour', name);
			return;
		}

		const suggestion = target.closest('.suggestion') as HTMLDivElement | null;
		if (suggestion && input && !target.closest('button')) {
			const name = suggestion.getAttribute('data-name') || "";
			input.value = name;
			(this as HTMLDivElement).classList.add('hidden');
		}
	});
}

function setupOutsideClickHandler() {
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
}
