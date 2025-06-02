import { sidebar_visibility } from "../sidebar.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { setUserProfile } from "../User/setUserProfile.js";
import Chat, { ChatViewListener } from "./Chat/Chat.js";
import { FriendViewListener, injectFriends } from "./Friends/Friends.js";

export async function dynamicDisplay() {
	await setUserProfile();
	setupSoundListener();
	await sidebar_visibility();
	await injectFriends();
	await FriendViewListener();
	await ChatViewListener();
}