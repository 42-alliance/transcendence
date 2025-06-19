import { sidebar_visibility } from "../sidebar.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { getUserInfos } from "../User/me.js";
import { setUserProfile } from "../User/setUserProfile.js";
import Chat, { ChatViewListener } from "./Chat/Chat.js";
import { setupAddFriendSearchBar, injectFriends} from "./Friends/Friends.js";
import { showToast } from "./triggerToast.js";
import { injectExportUserCard, injectUserCard } from "./userCard/userCard.js";

export async function dynamicDisplay(params: { conversationId?: string, username?: string }): Promise<void> {
  	if (params.username && (await getUserInfos())?.name != params.username) {
		  injectExportUserCard(`card-login-container-id`, params.username);
	} else {
		await injectUserCard("card-login-container-id");
	}
	
	await setUserProfile();
	setupSoundListener();
	await sidebar_visibility();
	await injectFriends();
	await setupAddFriendSearchBar();
	await ChatViewListener(Number(params.conversationId));
}