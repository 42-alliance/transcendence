import { showOnlineFriends } from "../Friends/onlineFriends.js";
import { showPendingFriends } from "../Friends/showPendingRequest.js";
import { sidebar_visibility } from "../sidebar.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { setUserProfile } from "../User/setUserProfile.js";

export async function dynamicDisplay() {
	await showOnlineFriends();
	await showPendingFriends();
	await setUserProfile();
	setupSoundListener();
	await sidebar_visibility();
}