import AView from "../AView.js";
import { getUserInfos } from "../../User/me.js";
import { goChat, miniPendingUserCard, miniUserCard } from "../userCard/userCard.js";
import { showToast } from "../triggerToast.js";
import { updateFriendStatus } from "../../Friends/updateFriendStatus.js";
import { createConversation } from "../../Chat/createConversation.js";
import { gameWsClass, navigateTo } from "../viewManager.js";
import { removeFriendDiv, removePendingFriendRequest } from "../../User/setupWebsockets.js";
import { removeFriend } from "../../Friends/removeFriend.js";
import { PendingRequest, UserData } from "../../types.js";

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

export function nbPendingFriends(friendsList: UserData[]): number {
	return friendsList.filter(friend => friend.status === "pending").length;
}

export async function injectFriends() {
	await displayAllFriendsDynamically();
	document.getElementById("all-button")?.addEventListener('click', async () => {
		console.log("click on all");
		await displayAllFriendsDynamically();
	});
	document.getElementById("pending-button")?.addEventListener('click', async () => {
		console.log("click on pending");
		await displayPendingFriendsDynamically();
	});
}

export async function SetUpNotifs(all : HTMLElement | null, pending : HTMLElement | null, friendsList: UserData[]) {
	console.error("J'affiche les notifs => ", friendsList);
	
	let all_notifs = document.createElement("span");
	all_notifs.className = "all-notifs ml-1 px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded-full text-xs";
	all_notifs.innerHTML = `${friendsList.length}`;
	
	let pending_notifs = document.createElement("span");
	pending_notifs.className = "ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-orange-500/20 group-hover:text-orange-300";
	pending_notifs.innerHTML = `${friendsList.filter(friend => friend.status === "pending").length}`;

	all?.appendChild(all_notifs);
	pending?.appendChild(pending_notifs);
}

// Handles dynamic friend list displaying
export async function displayAllFriendsDynamically() {
	const onglet = document.getElementById("onglets-id");
	if (!onglet) return;

	const me = await getUserInfos();
	if (!me || !me.friends || !me.incoming_friends || !me.outgoing_friends) {
		showToast({
			text: "You must be logged in to see your friends.",
			img: "/assets/default.jpg",
			buttons: [],
			duration: 5000,
		});
		return;
	}
	
	const friends = me.friends;
	renderAllTabs(onglet, friends, me.incoming_friends.length + me.outgoing_friends.length);

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

	renderAllFriendsList(test_card, friends, me);
}

function renderAllTabs(onglet: HTMLElement, friends: UserData[], pendingCount: number) {
	onglet.innerHTML = `<button class="tab-btn relative pb-3 px-1 font-medium group" data-tab="all" id="all-button">
	  <span class="text-orange-400 group-hover:text-yellow-400 transition-colors">All</span>
	  <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">${friends.length}</span>
	  <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500 w-full rounded-full"></div>
	</button>
	<button class="tab-btn pb-3 px-1 text-gray-400 hover:text-orange-300 transition-colors group" data-tab="pending" id="pending-button">
	  <span class="text-gray-400 hover:text-orange-300 transition-colors">Pending</span>	 
	 <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">${pendingCount}</span>
	</button>`;
}

function renderAllFriendsList(test_card: HTMLElement, friendsList: UserData[], me: UserData) {
	if (!friendsList) return;
	test_card.innerHTML = ""; // Clear previous content if needed

	friendsList.forEach(async friend => {
		await miniUserCard(
			test_card,
			friend,
			[
				{
					label: "See Profile",
					onClick: async () => { navigateTo(`/${friend.name}`); },
				},
				{
					label: "Send Message",
					onClick: async () => {
						const conv_id = await createConversation([friend.name!, me.name!]);
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

// Main function to display pending friends dynamically
export async function displayPendingFriendsDynamically() {
	const onglet = document.getElementById("onglets-id");
	if (!onglet) return;

	const me = await getUserInfos();
	if (!me || !me.friends || !me.incoming_friends || !me.outgoing_friends) {
		showToast({
			text: "You must be logged in to see your friends.",
			img: "/assets/default.jpg",
			buttons: [],
			duration: 5000,
		});
		return;
	}

	const friends = me.friends;
	renderPendingTabs(onglet, friends, me.incoming_friends.length + me.outgoing_friends.length);

	const test_card = document.getElementById("friend-list-card");
	if (!test_card) return;

	const pendingFriends = {
		incoming: me.incoming_friends,
		outgoing: me.outgoing_friends,
	};


	renderPendingSections(test_card, pendingFriends);

	const incoming_card = document.getElementById("friend-list-card-incoming");
	const outgoing_card = document.getElementById("friend-list-card-outgoing");
	if (!incoming_card || !outgoing_card) return;


	renderIncomingRequests(incoming_card, pendingFriends.incoming, me);
	renderOutgoingRequests(outgoing_card, pendingFriends.outgoing, me);
}

// Renders the tabs for pending/all
function renderPendingTabs(onglet: HTMLElement, friends: UserData[], pendingCount: number) {
	onglet.innerHTML = `<button class="tab-btn relative pb-3 px-1 font-medium group" data-tab="all" id="all-button">
	  <span class="text-gray-400 hover:text-orange-300 transition-colors">All</span>
	   <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">${friends.length}</span>
	</button>
	<button class="tab-btn relative pb-3 px-1 font-medium group" data-tab="pending" id="pending-button">
	  <span class="text-orange-400 hover:text-orange-300 transition-colors">Pending</span>
	  <span class="ml-1 px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full text-xs group-hover:bg-yellow-500/20 group-hover:text-yellow-300">${pendingCount}</span>
	   <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500 w-full rounded-full"></div>
	</button>`;

	document.getElementById("all-button")?.addEventListener('click', async () => {
		console.log("click on all");
		await displayAllFriendsDynamically();
	});
	document.getElementById("pending-button")?.addEventListener('click', async () => {
		console.log("click on pending");
		await displayPendingFriendsDynamically();
	});
}

// Renders the main sections for incoming/outgoing requests
function renderPendingSections(test_card: HTMLElement, friendsList: any) {
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
}

// Renders incoming friend requests
function renderIncomingRequests(
	incoming_card: HTMLElement,
	incoming: PendingRequest[],
	me: UserData
) {
	incoming.forEach(friend => {
		const card = miniPendingUserCard(
			friend.user,
			async () => { await updateFriendStatus(friend.user.id!, "accepted"); removePendingFriendRequest(friend); },
			async () => { await updateFriendStatus(friend.user.id!, "rejected"); removePendingFriendRequest(friend); },
			async () => {
				navigateTo(`/game`);
				gameWsClass?.sendMessage("create_inv_game", {
					user: friend,
					type: "create_inv_game",
					conversationId: await createConversation([me.name!, friend.user.name!]),
				});
			}, // invite to play
			async () => { await goChat(friend.user); }, // go chat
			async () => { navigateTo(`${friend.user.name!}`); }, // show profile
		);
		incoming_card.appendChild(card);
	});
}

// Renders outgoing friend requests
function renderOutgoingRequests(
	outgoing_card: HTMLElement,
	outgoing: PendingRequest[],
	me: UserData
) {
	outgoing.forEach(async friend => {
		await miniUserCard(
			outgoing_card,
			friend.user,
			[
				{
					label: "See Profile",
					onClick: async () => { navigateTo(`/${friend.user.name}`); },
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
