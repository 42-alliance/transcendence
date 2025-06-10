import { sidebar_visibility } from "../sidebar.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { setUserProfile } from "../User/setUserProfile.js";
import Chat, { ChatViewListener } from "./Chat/Chat.js";
import { setupAddFriendSearchBar, injectFriends } from "./Friends/Friends.js";
import { showToast } from "./triggerToast.js";

export async function dynamicDisplay(params: { conversationId?: string }) {
	await setUserProfile();
	setupSoundListener();
	await sidebar_visibility();
	await injectFriends();
	console.log("Dynamic display initialized with params:", params);
	await setupAddFriendSearchBar();
	await ChatViewListener(Number(params.conversationId));

	// showToast({
	// 		text: `Moussa send you a friend request !`,
	// 		img: "https://cdn.discordapp.com/avatars/123456789012345678/abcdef1234567890.png",
	// 		buttons: [
	// 			{ label: "Accepter", onClick: () => alert("Partie acceptée !") },
	// 			{ label: "Refuser", onClick: () => alert("Refusé !") }
	// 		],
	// 		duration: 8000 // 0 = ne s’enlève pas tant qu’on ferme pas
	// 	});
}