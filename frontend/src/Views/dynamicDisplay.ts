import { sidebar_visibility } from "../sidebar.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { setUserProfile } from "../User/setUserProfile.js";
import Chat, { ChatViewListener } from "./Chat/Chat.js";
import { setupAddFriendSearchBar, injectFriends } from "./Friends/Friends.js";

export async function dynamicDisplay(params: { conversationId?: string }) {
	await setUserProfile();
	setupSoundListener();
	await sidebar_visibility();
	await injectFriends();
	console.log("Dynamic display initialized with params:", params);
	await setupAddFriendSearchBar();
	await ChatViewListener(Number(params.conversationId));
}