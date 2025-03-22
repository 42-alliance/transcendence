import { showOnlineFriends } from "../Friends/onlineFriends.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { setUserProfile } from "../User/setUserProfile.js";

export async function dynamicDisplay() {
	// await showOnlineFriends();
	await setUserProfile();
	setupSoundListener();
}