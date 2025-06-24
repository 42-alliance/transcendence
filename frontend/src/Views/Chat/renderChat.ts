import { time } from "console";
import { getAllMessages } from "../../Chat/getAllMessages.js";
import { Conversation, Message, UserData } from "../../types.js";
import { GetUserBlockedListByName } from "../../User/getUserByName.js";
import { webSockets } from "../viewManager.js";
import { getUserPicture } from "./Chat.js";
import { createConversationName } from "./ChatUtils.js";
import { timeAgo } from "../User/User.js";



export async function renderChat(conversation: Conversation, userInfos: UserData) {
	const chatHeader = document.getElementById("chat-header");
	const chatHistory = document.getElementById("chat-history");
	const chatInputArea = document.getElementById("chat-input-area");
	if (!chatHeader || !chatHistory || !chatInputArea) return;

	const my_name = userInfos.name!;
	const otherMembers = (conversation.members || []).filter(
		(m: any) => m.name !== my_name
	);

	document
		.getElementById(`unread-badge-${conversation.id}`)
		?.classList.add("hidden");

	renderChatHeader(chatHeader, conversation, otherMembers);
	await renderChatHistory(chatHistory, conversation, userInfos);
	renderChatInputArea(chatInputArea, conversation, userInfos);
}

function renderChatHeader(
	chatHeader: HTMLElement,
	conversation: Conversation,
	otherMembers: any[]
) {
	const inviteBtnHTML = `
	<button id="invite-to-play-btn" 
		class="ml-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-orange-500/90 transition text-sm font-bold text-white shadow focus:outline-none"
		title="Invite to play" data-conversation-id="${conversation.id}">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
		</svg>
		<span class="hidden sm:inline">Invite to play</span>
	</button>
`;

	chatHeader.innerHTML = "";
	if (otherMembers.length === 1) {
		chatHeader.innerHTML = `
	<a href="/${otherMembers[0].name}" data-link class="group transition-colors">
	<img src="${otherMembers[0].picture || "/assets/default.jpeg"}"
		class="w-11 h-11 rounded-full border border-orange-400/30 group-hover:border-orange-400 transition-all duration-200"
		alt="${otherMembers[0].name} avatar">
	</a>
	<div>
		<a href="/${otherMembers[0].name}" data-link class="group transition-colors">

			<div class="font-semibold text-white text-lg group-hover:text-orange-400 transition-colors">
				${otherMembers[0].name}
			</div>
		</a>
	</div>
	${inviteBtnHTML}
	`;
	} else {
		chatHeader.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="w-11 h-11 rounded-full border border-orange-400/30 text-white" fill="currentColor" alt="Group conversation"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>
		<div>
			<div class="font-semibold text-white text-lg">${
				conversation.name || createConversationName(otherMembers)
			}</div>
			<div class="text-xs text-gray-400">${
				otherMembers.length
			} members</div>
		</div>
		${inviteBtnHTML}
	`;
	}
}

async function renderChatHistory(
	chatHistory: HTMLElement,
	conversation: Conversation,
	userInfos: UserData
) {
	chatHistory.setAttribute(
		"data-conversation-id",
		conversation.id.toString()
	);

	chatHistory.innerHTML = "";
	const myId = userInfos.id;

	const messages = (await getAllMessages(conversation.id)).reverse();
	if (messages.length === 0) {
		chatHistory.innerHTML = `<div class="text-gray-500 text-center">Beginning of conversation.</div>`;
	} else {
		messages.forEach((msg: Message) => {
			const isblocked = userInfos.blocked?.some(
				blockedUser => blockedUser.id === msg.userId
			);
			if (isblocked) {
				chatHistory.innerHTML += renderBlockedMessage(msg.createdAt);
				return;
			}
			const isMe = msg.userId === myId;
			chatHistory.innerHTML += renderMessage(msg, isMe);
		});
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}

	setTimeout(() => {
		chatHistory.scrollTop = chatHistory.scrollHeight;
	}, 0);
}

export function renderBlockedMessage(createdAt: Date) {
	return `
		<div class="flex items-end gap-3">
			<img src="/assets/default.jpeg" 
				class="w-8 h-8 rounded-full border border-orange-400/30" alt="avatar">
			<div>
				<div class="bg-gray-800 text-white italic px-4 py-2 rounded-2xl max-w-md break-words">
					Blocked message
				</div>
				<div class="text-xs text-gray-500 mt-1">${timeAgo(createdAt)}</div>
			</div>
		</div>
	`;
}

export function renderMessage(msg: Message, isMe: boolean) {
	return `
		<div class="flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}">
			<a href="/${msg.name}" 
				class="group transition-colors" data-link>
			<img src="${msg.picture}" 
				class="w-8 h-8 rounded-full border border-orange-400/30" alt="avatar">
			</a>
			<div>
				<div class="${
					isMe
						? "bg-gradient-to-br from-orange-500 to-yellow-400 text-black"
						: "bg-gray-800 text-white"
				} px-4 py-2 rounded-2xl max-w-md break-words">${msg.content}</div>
				<div class="text-xs text-gray-500 mt-1 ${isMe ? "text-right" : ""}">${timeAgo(msg.createdAt)}</div>
			</div>
		</div>
	`;
}

function renderChatInputArea(
	chatInputArea: HTMLElement,
	conversation: Conversation,
	userInfos: UserData
) {
	chatInputArea.innerHTML = `
		<form id="send-message-form" class="flex items-center gap-3">
			<input type="text" id="chat-input" class="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Écris ton message..." autocomplete="off" />
			<button type="submit" class="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-bold px-6 py-2 rounded-lg shadow flex items-center gap-2">
				<i class="fa fa-paper-plane"></i>
			</button>
		</form>
	`;

	const form = document.getElementById(
		"send-message-form"
	) as HTMLFormElement;
	const input = document.getElementById("chat-input") as HTMLInputElement;
	if (form && input) {
		form.onsubmit = async (e) => {
			e.preventDefault();
			const value = input.value.trim();
			if (!value) return;

			for (const m of conversation.members) {
				if (m.userId == userInfos.id) {
					continue;
				}
				const b: UserData[] = await GetUserBlockedListByName(m.userId);
				if (b.some(b => b.id === userInfos.id)) {
					input.classList.add("border-red-700");
					input.classList.add("shake");
					input.addEventListener("animationend", () => {
						input.classList.remove("shake");
					}, { once: true });

					let msg = document.getElementById("blocked-msg");
					if (!msg) {
						msg = document.createElement("div");
						msg.id = "blocked-msg";
						msg.textContent = "You have been blocked by this user.";
						msg.className = "text-red-500 text-xs mb-1 text-left w-full";
						input.parentElement?.parentElement?.insertBefore(msg, input.parentElement);
					}

					setTimeout(() => {
						input.classList.remove("border-red-700");
						msg?.remove();
					}, 1500);
					return;
				}
			}

			webSockets.chat?.send(
				JSON.stringify({
					type: "new_message",
					conversationId: conversation.id,
					content: value,
				})
			);

			input.value = "";
		};
	}
}