import { setupChatWebSocket } from "../Chat/setupWebSocket.js";
import { WebSockets } from "../types.js";
import { getUserInfos } from "../User/me.js";
import { userIsLogin } from "../User/userIsLogin.js";
import {
  isPending2FAVerification,
  isProtectedRoute,
  checkInitial2FAState,
} from "../User/TwoFa/twoFaState.js";
import { showLoginVerification } from "../User/TwoFa/verify2faLogin.js";
import { default as Auth } from "./Auth/Auth.js";
import { default as Game } from "./Game/Game.js";
import { default as AuthSuccess } from "./Auth/AuthSuccess.js";
import { default as Dashboard } from "./Dashboard/Dashboard.js";
import { default as User } from "./User/User.js";
import { dynamicDisplay } from "./dynamicDisplay.js";
import { default as Friends } from "./Friends/Friends.js";
import { default as Chat } from "./Chat/Chat.js";
import { default as AView } from "./AView.js";
import { setupUserWebsocket } from "../User/setupWebsockets.js";
import { GameWebSocket, setupGameWebSocket } from "./Game/GameWebSocket.js";
import { default as Me } from "./Me/Me.js";
import { default as Error404 } from "./Error404/Error404.js";

// Initialisation du WebSocket
export const webSockets: WebSockets = {
  chat: null,
  user: null,
  game: null,
};

export function setGameWsClass(instance: GameWebSocket): void {
  gameWsClass = instance;
}

export let gameWsClass: GameWebSocket | null = null;

// Fonction de navigation
export const navigateTo = (url: string): void => {
  history.pushState(null, "", url);
  router();
};

// Fonction de vérification de l'authentification
async function needToAuthenticate(currentPath: string): Promise<boolean> {
  if (
    currentPath != "/auth" &&
    currentPath != "/auth-success" &&
    (await userIsLogin()) === false
  )
    return true;
  return false;
}

let previousPage: string | undefined;

function matchRoute(
  pathPattern: string,
  currentPath: string
): { matched: boolean; params: Record<string, string> } {
  const patternParts = pathPattern.split("/").filter(Boolean);
  const pathParts = currentPath.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length)
    return { matched: false, params: {} };

  let params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}

// Fonction principale du routeur
export const router = async (): Promise<void> => {
  console.error("entre dans le router");
  const existingResultModal = document.getElementById("game-result");
  if (existingResultModal) {
    existingResultModal.remove();
  }

  // Vérifier l'état initial du 2FA au chargement
  const isLogin = await userIsLogin();
  if (isLogin) {
    await checkInitial2FAState();
  }

  type Route = {
    path: string;
    view: new () => AView;
  };

  const routes: Route[] = [
    { path: "/", view: Dashboard },
    { path: "/game", view: Game },
    { path: "/chat", view: Chat },
    { path: "/chat/:conversationId", view: Chat },
    { path: "/friends", view: Friends },
    { path: "/auth-success", view: AuthSuccess },
    { path: "/auth", view: Auth },
    { path: "/me", view: Me },
    { path: "/:username", view: User },
  ];

  let matchedRoute = null;
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
    matchedRoute = { view: Error404, path: "/" };
    routeParams = {};
  }

  // Check si changement réel de page/params
  const currentKey = location.pathname + JSON.stringify(routeParams);
  if (
    previousPage &&
    previousPage === currentKey &&
    matchedRoute.path !== "/game"
  )
    return;
  previousPage = currentKey;

  const user = await getUserInfos();

  // Vérifie authentification si nécessaire
  if ((await needToAuthenticate(matchedRoute.path)) === true) {
    navigateTo("/auth");
    return;
  }

  // Vérifier le statut 2FA
  if (isLogin && isPending2FAVerification()) {
    // Ne permettre l'accès qu'aux routes non protégées
    if (isProtectedRoute(location.pathname)) {
      console.log("Access blocked: 2FA verification required");
      await showLoginVerification();
      return;
    }
  }

  // Setup websocket si loggé et pas encore fait
  if (isLogin && !isPending2FAVerification()) {
    if (webSockets.chat === null) {
      await setupChatWebSocket();
    }
    if (webSockets.user === null) {
      await setupUserWebsocket();
    }
    if (webSockets.game === null) {
      await setupGameWebSocket();
      const gameInstance = new Game();
      await gameInstance.executeViewScript();
    }
  }

  // Crée la vue (passe les params si besoin)
  const view = new matchedRoute.view();

  const appId = document.getElementById("app");
  if (appId) {
    appId.innerHTML = await view.getHtml();
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