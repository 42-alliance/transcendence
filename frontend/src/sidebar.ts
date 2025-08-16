import { showOnlineFriends } from "./Friends/onlineFriends.js";
import { showPendingFriends } from "./Friends/showPendingRequest.js";
import { userIsLogin } from "./User/userIsLogin.js";

let sidebarListenerAdded = false;

export function openSidebarWithButton(sidebar: HTMLElement): void {
	const sidebarButton = document.getElementById("sidebar-button") as HTMLButtonElement | null;
	if (!sidebarButton) return;

	if (sidebarListenerAdded) return; // On n’ajoute qu’une fois !
	sidebarListenerAdded = true;

	// Ouvre/Ferme la sidebar au click bouton
	sidebarButton.addEventListener("click", (e) => {
		e.stopPropagation();
		sidebar.classList.toggle("-translate-x-full");
		// document.body.classList.toggle("sidebar-open");
	});

	// Ferme la sidebar si on clique ailleurs (hors sidebar ET bouton)
	document.addEventListener("click", function handler(e: MouseEvent) {
		const target = e.target as Node;
		const isSidebarOpen = !sidebar.classList.contains("-translate-x-full");
		const isDesktop = window.matchMedia("(min-width: 768px)").matches;

		if (
			isSidebarOpen &&
			!isDesktop &&
			!sidebar.contains(target) &&
			!sidebarButton.contains(target)
		) {
			sidebar.classList.add("-translate-x-full");
			// document.body.classList.remove("sidebar-open");
		}
	});
}

export async function sidebar_visibility() {
	const is_log = await userIsLogin();
	const sidebar = document.getElementById("sidebar") as HTMLElement | null;
	const sidebarButton = document.getElementById("sidebar-button") as HTMLElement | null;
	if (!sidebar) return;

	// Toujours setup le toggle (une seule fois grâce au flag ci-dessus)
	openSidebarWithButton(sidebar);

	if (is_log && !document.URL.includes("auth-success")) {
		sidebar.classList.remove("hidden");
		sidebar.classList.add("-translate-x-full"); // Cachée mobile par défaut
		if (sidebarButton) sidebarButton.classList.remove("hidden");
		await showOnlineFriends();
		await showPendingFriends();
	} else {
		sidebar.classList.add("hidden");
		if (sidebarButton) sidebarButton.classList.add("hidden");
	}
}
