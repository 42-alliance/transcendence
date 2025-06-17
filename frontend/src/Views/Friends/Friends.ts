import AView from "../AView.js";
import { getAllFriends } from "../../Friends/getAllFriends.js";
import { getUserInfos } from "../../User/me.js";
import { goChat, miniPendingUserCard, miniUserCard, UserData } from "../userCard/userCard.js";
import { getAllUsers } from "../../User/getAllUsers.js";
import { addFriend } from "../../Friends/addFriend.js";
import { getPendingFriendRequest } from "../../Friends/getPendingFriendRequest.js";
import { showToast } from "../triggerToast.js";
import { updateFriendStatus } from "../../Friends/updateFriendStatus.js";
import { createConversation } from "../../Chat/createConversation.js";
import { navigateTo } from "../viewManager.js";
import { removeFriendDiv, removePendingFriendRequest } from "../../User/setupWebsockets.js";
import { removeFriend } from "../../Friends/removeFriend.js";


export default class extends AView {
	constructor() {
		super();
		this.setTitle("My Friends");
	}

	async getHtml() {
		try {
			const response = await fetch("/src/Views/Friends/Friends.html");
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

	const me = await getUserInfos();
	if (!me) {
		showToast({
			text: "You must be logged in to see your friends.",
			img: "/assets/default.jpg",
			buttons: [],
			duration: 5000,
		});
		return;
	}

	console.error("JE PASSE PAR ICI");

	friendsList.forEach(friend => {
		miniUserCard(
			test_card,
			friend,
			[
				{
					label: "See Profile",
					onClick: async () => {},
				},
				{
					label: "Send Message",
					onClick: async () => {
						const conv_id = await createConversation([friend.name, me.name!]);
						navigateTo(`/chat/${conv_id}`);
					}
				},
				{
					label: "Remove Friend",
					colorClass: "text-red-500 hover:text-red-700",
					onClick: async () => {
						await removeFriend(friend.id!);
						showToast({
							text: `You removed ${friend.name} from your friends.`,
							img: "/assets/valid.jpg",
							buttons: [],
							duration: 5000,
						});
						removeFriendDiv(friend.id!);
						// await displayAllFriendsDynamically();
					}
				}
			]
		);
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

// Handles the "add friend" search bar logic
export async function setupAddFriendSearchBar() {
	const all_users = await getAllUsers();
	if (!all_users) return;

	all_users.sort((a, b) => a.name.localeCompare(b.name));
	const me = await getUserInfos();
	if (!me) return;
	const friendsList = await getAllFriends();
	if (!friendsList) return;

	const myFriends = friendsList.map(friend => friend.name);

	document.getElementById("add-friend-btn")?.addEventListener("click", function () {
		const searchBar = document.getElementById("search-bar");
		if (!searchBar) return;
		searchBar.classList.remove("hidden", "opacity-0", "translate-y-2");
		searchBar.classList.add("opacity-100", "translate-y-0");
		document.getElementById("friend-search-input")?.focus();
	});

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

	['input', 'focus'].forEach(eventType => {
		document.getElementById("friend-search-input")?.addEventListener(eventType, function (event) {
			const input = event.target as HTMLInputElement;
			const searchValue = input.value.toLowerCase();
			const suggestionsBox = document.getElementById("friend-search-suggestions") as HTMLDivElement;

			let html = "";
			let matchCount = 0;

			all_users.forEach(user => {
				if (
					user.name.toLowerCase().includes(searchValue) &&
					user.name.toLowerCase() !== me.name?.toLowerCase()
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
								? `
								<button 
									class="chat-btn flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold shadow transition-all duration-200 ml-2"
									title="Ouvrir le chat"
									data-name="${user.name}" data-id="${user.id}"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/>
									</svg>
								</button>
								`
								: `
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
	});

	document.getElementById("friend-search-suggestions")?.addEventListener("click", function (e) {
		const input = document.getElementById("friend-search-input") as HTMLInputElement;
		const target = e.target as HTMLElement;
		const suggestion = target.closest(".suggestion") as HTMLDivElement | null;
		if (suggestion && input) {
			const name = suggestion.getAttribute("data-name") || "";
			input.value = name;
			(this as HTMLDivElement).classList.add("hidden");
		}
	});

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
			const id = (target.closest('.send-request-btn') as HTMLElement).getAttribute('data-id');
			if (!name || !id) return;
			await addFriend(name);
			return;
		}

		if (target.closest('.chat-btn')) {
			const name = (target.closest('.chat-btn') as HTMLElement).getAttribute('data-name');
			const id = (target.closest('.chat-btn') as HTMLElement).getAttribute('data-id');
			if (!name || !id) return;

			const conv_id = await createConversation([me.name!, name]);
			navigateTo(`/chat/${conv_id}`);
			return;
		}

		if (target.closest('.more-options-btn')) {
			const name = (target.closest('.more-options-btn') as HTMLElement).getAttribute('data-name');
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
	displayAllFriendsDynamically();
	document.getElementById("all-button")?.addEventListener('click', async () => {
		console.log("click on all");
		await displayAllFriendsDynamically();
	});
	document.getElementById("pending-button")?.addEventListener('click', async () => {
		console.log("click on pending");
		await displayPendingFriendsDynamically();
	});
}

// Handles dynamic friend list displaying
export async function displayAllFriendsDynamically() {
	const onglet = document.getElementById("onglets-id");
	
	if (!onglet) return;

	onglet.innerHTML = `<button class="tab-btn relative pb-3 px-1 font-medium group" data-tab="all" id="all-button">
      <span class="text-orange-400 group-hover:text-yellow-400 transition-colors">All</span>
      <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500 w-full rounded-full"></div>
    </button>
    <button class="tab-btn pb-3 px-1 text-gray-400 hover:text-yellow-300 transition-colors group" data-tab="online" id="online-button">
      Online <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">2</span>
    </button>
    <button class="tab-btn pb-3 px-1 text-gray-400 hover:text-orange-300 transition-colors group" data-tab="pending" id="pending-button">
      Pending
    </button>`

	document.getElementById("all-button")?.addEventListener('click', async () => {
		console.log("click on all");
		await displayAllFriendsDynamically();
	});
	document.getElementById("pending-button")?.addEventListener('click', async () => {
		console.log("click on pending");
		await displayPendingFriendsDynamically();
	});

	const test_card = document.getElementById("friend-list-card");
	if (!test_card) return;

	const friendsList = await getAllFriends();
	if (!friendsList) return;

	const me = await getUserInfos();
	if (!me) {
		showToast({
			text: "You must be logged in to see your friends.",
			img: "/assets/default.jpg",
			buttons: [],
			duration: 5000,
		});
		return;
	}

	test_card.innerHTML = ""; // Clear previous content if needed

	friendsList.forEach(friend => {
		miniUserCard(
			test_card,
			friend,
			[
				{
					label: "See Profile",
					onClick: async () => {},
				},
				{
					label: "Send Message",
					onClick: async () => {
						const conv_id = await createConversation([friend.name, me.name!]);
						navigateTo(`/chat/${conv_id}`);
					}
				},
				{
					label: "Remove Friend",
					colorClass: "text-red-500 hover:text-red-700",
					onClick: async () => {
						await removeFriend(friend.id!);
						showToast({
							text: `You removed ${friend.name} from your friends.`,
							img: "/assets/valid.jpg",
							buttons: [],
							duration: 5000,
						});
						removeFriendDiv(friend.id!);
						// await displayAllFriendsDynamically();
					}
				}
			]
		);
	});
}

export async function ongletNbChange() {
	
	const onglet = document.getElementById("onglets-id");
	
	if (!onglet) return;

	const allFriend = await getAllFriends();
	if (!allFriend) return;



	onglet.innerHTML = `<button class="tab-btn relative pb-3 px-1 font-medium group" data-tab="all" id="all-button">
	All
	${allFriend.length > 0 ? `<span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">${allFriend.length}</span>` : ''}
	</button>
	<button class="tab-btn pb-3 px-1 text-gray-400 hover:text-yellow-300 transition-colors group" data-tab="online">
	Online <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">2</span>
	</button>
	<button class="tab-btn pb-3 px-1 text-gray-400 hover:text-orange-300 transition-colors group" data-tab="pending" id="pending-button">
		<span class="text-orange-400 group-hover:text-yellow-400 transition-colors">Pending</span>
		<div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500 w-full rounded-full"></div>
	</button>`


}

export async function displayPendingFriendsDynamically() {
	const onglet = document.getElementById("onglets-id");
	
	if (!onglet) return;

	onglet.innerHTML = `<button class="tab-btn relative pb-3 px-1 font-medium group" data-tab="all" id="all-button">
	All
	</button>
	<button class="tab-btn pb-3 px-1 text-gray-400 hover:text-yellow-300 transition-colors group" data-tab="online">
	Online <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">2</span>
	</button>
	<button class="tab-btn pb-3 px-1 text-gray-400 hover:text-orange-300 transition-colors group" data-tab="pending" id="pending-button">
		<span class="text-orange-400 group-hover:text-yellow-400 transition-colors">Pending</span>
		<div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500 w-full rounded-full"></div>
	</button>`

	
	document.getElementById("all-button")?.addEventListener('click', async () => {
		console.log("click on all");
		await displayAllFriendsDynamically();
	});
	document.getElementById("pending-button")?.addEventListener('click', async () => {
		console.log("click on pending");
		await displayPendingFriendsDynamically();
	});

	const test_card = document.getElementById("friend-list-card");
	if (!test_card) return;

	const friendsList = await getPendingFriendRequest();
	console.log("PENDING LIST : ", friendsList);
	if (!friendsList) return;

	test_card.innerHTML = `
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Incoming requests -->
    <section class="bg-gradient-to-br from-gray-800/90 to-gray-900/80 border border-orange-400/10 rounded-2xl p-6 shadow-lg">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-xl font-bold text-orange-400"><i class="fa fa-user-plus mr-2"></i> Incoming</span>
        <span id="incoming-friend-length" class="ml-auto bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full text-xs">${friendsList.incoming.length}</span>
      </div>
      <div id="friend-list-card-incoming" class="flex flex-col gap-5"></div>
      ${friendsList.incoming.length === 0
        ? `<div id="no-incoming-friend" class="text-gray-500 text-sm text-center py-6">No incoming requests</div>`
        : ''}
    </section>
    <!-- Outgoing requests -->
    <section class="bg-gradient-to-br from-gray-900/90 to-gray-800/80 border border-yellow-400/10 rounded-2xl p-6 shadow-lg">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-xl font-bold text-yellow-300"><i class="fa fa-paper-plane mr-2"></i> Outgoing</span>
        <span class="ml-auto bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">${friendsList.outgoing.length}</span>
      </div>
      <div id="friend-list-card-outgoing" class="flex flex-col gap-5"></div>
      ${friendsList.outgoing.length === 0
        ? `<div class="text-gray-500 text-sm text-center py-6">No outgoing requests</div>`
        : ''}
    </section>
  </div>
`;


	const incoming_card = document.getElementById("friend-list-card-incoming");
	const outgoing_card = document.getElementById("friend-list-card-outgoing");
	if (!incoming_card || !outgoing_card) return;

	friendsList.incoming.forEach(friend => {
		const card = miniPendingUserCard(
				friend.user,
				async () => { await updateFriendStatus(friend.user.id!, "accepted"); removePendingFriendRequest(friend); },
				async () => { await updateFriendStatus(friend.user.id!, "rejected"); removePendingFriendRequest(friend); },
				async () => {}, // invite to play
				async () => { await goChat(friend.user); }, // go chat
				async () => {}, // show profile
			);
		incoming_card.appendChild(card);
	});

	const me = await getUserInfos();
	if (!me) {
		showToast({
			text: "You must be logged in to see your friends.",
			img: "/assets/default.jpg",
			buttons: [],
			duration: 5000,
		});
		return;
	}

	friendsList.outgoing.forEach(friend => {
		miniUserCard(
			outgoing_card,
			friend.user,
			[
				{
					label: "See Profile",
					onClick: async () => {},
				},
				{
					label: "Send Message",
					onClick: async () => {
						const conv_id = await createConversation([friend.user.name!, me.name!]);
						navigateTo(`/chat/${conv_id}`);
					}
				},
				{
					label: "Cancel request",
					colorClass: "text-red-500 hover:text-red-700",
					onClick: async () => {
						await updateFriendStatus(friend.user.id!, "rejected");
						showToast({
							text: `You removed ${friend.user.name} from your friends.`,
							img: "/assets/valid.jpg",
							buttons: [],
							duration: 5000,
						});
						removePendingFriendRequest(friend);
						await displayAllFriendsDynamically();
					}
				}
			]
		);
	});
}
