import { setupChatWebSocket } from "../Chat/setupWebSocket.js";
import { WebSockets } from "../types.js";
import { setUserInfo } from "../User/me.js";
import { userIsLogin } from "../User/userIsLogin.js";
import Auth from "./Auth/Auth.js";
import AuthSuccess from "./Auth/AuthSuccess.js";
import Dashboard from "./Dashboard/Dashboard.js";
// Initialisation du WebSocket
export const webSockets: WebSockets = {
  chat: null,
  game: null,
};

// Fonction de navigation
export const navigateTo = (url: string): void => {
  history.pushState(null, "", url);
  router();
};

// Fonction de vérification de l'authentification
async function needToAuthenticate(currentPath: string): Promise<boolean> {
	if ((currentPath != "/auth" && currentPath != "/auth-success") && (await userIsLogin()) === false)
		return true;
	return false;
}

let previousPage: string | undefined;

// Fonction principale du routeur
const router = async (): Promise<void> => {
	const routes = [
		{ path: "/", view: Dashboard },
		// { path: "/game", view: Game },
		// { path: "/friends", view: Friends },
		{ path: "/auth-success", view: AuthSuccess },
		{ path: "/auth", view: Auth },
		// { path: "/selection", view: Selection },
	];

	let match;
	await setUserInfo();

	match = routes.find(route => location.pathname === route.path) || routes[0];

	if (await needToAuthenticate(match.path) === true) {
		navigateTo("/auth");
		return;
	}

	if (await userIsLogin() && webSockets.chat === null) {
		setupChatWebSocket();
	}

	if (previousPage && previousPage === match.path) return;

	const view = new match.view();

	const appId = document.getElementById("app");
	if (appId) {
		appId.innerHTML = await view.getHtml();
	}

	previousPage = match.path;
};

// Ajout de l'écouteur d'événement pour la gestion du popstate (retour en arrière)
window.addEventListener("popstate", router);

// Ajout de l'écouteur d'événement pour le chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const link = e.target as HTMLElement;
    if (link.closest("[data-link]")) {
      e.preventDefault();
      navigateTo(link.closest("[data-link]")!.getAttribute("href")!);
    }
  });
  router();
});
