import { lstat } from "fs";
import { showOnlineFriends } from "./Friends/onlineFriends.js";
import { showPendingFriends } from "./Friends/showPendingRequest.js";
import { getUserInfos } from "./User/me.js";
import { userIsLogin } from "./User/userIsLogin.js";

export async function sidebar_visibility() {

	const is_log = await userIsLogin();

	const sidebar = document.getElementById("sidebar");
	if (!sidebar) return;


	if (is_log && !document.URL.includes("auth-success")) {
		sidebar.classList.remove("hidden");
		await showOnlineFriends();
		await showPendingFriends();
	}
	else {
		sidebar.classList.add("hidden");
	}
}