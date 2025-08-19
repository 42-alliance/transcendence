import { userIsLogin } from "./User/userIsLogin.js";


export async function navbar_visibility() {
	const is_log = await userIsLogin();

	if (is_log && !document.URL.includes("auth-success")) {
		["user-infos", "navigation-link-sidebar"].forEach(id => {
			const elem = document.getElementById(id);

			elem?.classList.remove("hidden");
		});

	} else {
		["user-infos", "navigation-link-sidebar"].forEach(id => {
			const elem = document.getElementById(id);

			elem?.classList.add("hidden");
		});		
	}
}
