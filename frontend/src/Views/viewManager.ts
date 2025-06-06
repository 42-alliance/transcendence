import { setupChatWebSocket } from "../Chat/setupWebSocket.js";
import { WebSockets } from "../types.js";
import { getUserInfos } from "../User/me.js";
import { userIsLogin } from "../User/userIsLogin.js";
import Auth from "./Auth/Auth.js";
import Game from "./Game/Game.js";
import AuthSuccess from "./Auth/AuthSuccess.js";
import Dashboard from "./Dashboard/Dashboard.js";
import Me from "./Me/Me.js";
import { dynamicDisplay } from "./dynamicDisplay.js";
import Friends from "./Friends/Friends.js";
import Chat from "./Chat/Chat.js";

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

function matchRoute(pathPattern: string, currentPath: string): { matched: boolean, params: Record<string, string> } {
  const patternParts = pathPattern.split('/').filter(Boolean);
  const pathParts = currentPath.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return { matched: false, params: {} };

  let params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}

// Composant 404
class NotFoundView {
  async getHtml() {
    return `<div class="text-center text-3xl text-red-500 mt-16 font-bold">404 - Page Not Found</div>`;
  }
}

// Fonction principale du routeur
const router = async (): Promise<void> => {
  const routes: {path: string, view: } = [
	  { path: "/", view: Dashboard },
	  { path: "/game", view: Game },
	  { path: "/chat", view: Chat },
	  { path: "/chat/:conversationId", view: Chat },
    { path: "/friends", view: Friends },
    { path: "/auth-success", view: AuthSuccess },
    { path: "/auth", view: Auth },
    { path: "/me", view: Me },
    // { path: "/selection", view: Selection },
  ];

  await getUserInfos();

  let matchedRoute = { path: "/", view: Dashboard };
  let routeParams: Record<string, string> = {};

  for (const route of routes) {
    const { matched, params } = matchRoute(route.path, location.pathname);
    if (matched) {
      matchedRoute = route;
      routeParams = params;
      break;
    }
  }

  if (!matchedRoute) {
	  matchedRoute = { view: Dashboard, path: "/" };
	  routeParams = {};
	}

  // Vérifie authentification si nécessaire
  if (await needToAuthenticate(matchedRoute.path) === true) {
    navigateTo("/auth");
    return;
  }

  // Setup websocket si loggé et pas encore fait
  if (await userIsLogin() && webSockets.chat === null) {
    setupChatWebSocket();
  }

  // Check si changement réel de page/params
  const currentKey = location.pathname + JSON.stringify(routeParams);
  if (previousPage && previousPage === currentKey) return;
  previousPage = currentKey;


  // Met à jour le titre de la page
  console.log(`Route: ${matchedRoute.path}`);
  // Crée la vue (passe les params si besoin)
  const view = new matchedRoute.view();

  const appId = document.getElementById("app");
  if (appId) {
    appId.innerHTML = await view.getHtml();
	console.log("appId.innerHTML", appId.innerHTML);
  }

  // Script supplémentaire si Game (exécution du JS de la vue)
  if (view instanceof Game) {
    await view.executeViewScript();
  }

  // Toujours passer les params à ta fonction dynamique
  await dynamicDisplay(routeParams);
};

// Gestion de l'historique navigateur (précédent/suivant)
window.addEventListener("popstate", router);

// Gestion du chargement initial et des liens [data-link]
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest("[data-link]");
    if (link && link instanceof HTMLElement) {
      e.preventDefault();
      navigateTo(link.getAttribute("href")!);
    }
  });

  router();
});
