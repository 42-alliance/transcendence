import { sidebar_visibility } from "../sidebar.js";
import { setupSoundListener } from "../sounds/changeSound.js";
import { getUserInfos } from "../User/me.js";
import { setUserProfile } from "../User/setUserProfile.js";
import { ChatViewListener } from "./Chat/Chat.js";
import { setupAddFriendSearchBar } from "./Friends/addFriendSearch.js";
import { injectFriends } from "./Friends/Friends.js";
import Game from "./Game/Game.js";
import { showUserProfile } from "./User/User.js";
import { injectExportUserCard, injectUserCard } from "./userCard/userCard.js";
import { gameWsClass, navigateTo } from "./viewManager.js";

async function handleInviteToPlay(): Promise<void> {
	const inviteToPlayBtn = document.getElementById("invite-to-play-btn");
	if (!inviteToPlayBtn) return;

	inviteToPlayBtn.addEventListener("click", async () => {
		const userInfos = await getUserInfos();
		if (!userInfos) {
			return;
		}

		const conversationId = inviteToPlayBtn.getAttribute("data-conversation-id");
		if (!conversationId) return;

		navigateTo(`/game`);

		gameWsClass?.sendMessage("create_inv_game", {
			user: userInfos,
			type: "create_inv_game",
			conversationId: Number(conversationId),
		});

	});
}

export async function dynamicDisplay(params: {
	conversationId?: string;
	username?: string;
}): Promise<void> {
	if (params.username && (await getUserInfos())?.name != params.username) {
		injectExportUserCard(`card-login-container-id`, params.username);
	} else {
		await injectUserCard("card-login-container-id");
	}

	await setUserProfile();
	await showUserProfile(params.username);
	setupSoundListener();
	await sidebar_visibility();
	await injectFriends();
	await setupAddFriendSearchBar();
	await ChatViewListener(Number(params.conversationId));
	const gameInstance = new Game();
	await gameInstance.executeViewScript();

	await handleInviteToPlay();
}
