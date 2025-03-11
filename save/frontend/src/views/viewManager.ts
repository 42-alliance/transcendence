import { userIsLogin } from "../../script.js";
import Auth from "./Auth/Auth.js";
import Dashboard from "./Dashboard/Dashboard.js";
import Friends from "./Friends/Friends.js";
import { printFriendList } from "./Friends/Friends.js";
import Game from "./Game/Game.js";
import Login from "./Login/Login.js";
import { printNavbar } from "./navbar/navbar.js";
import { formSubmit } from "./Login/Login.js";
import { chatDiv, setupWebSocket } from "./Chat/Chat.js";
import Selection from "./Selection/Selection.js";
import { injectUserCard, previewImage, updateUserCardFromForm } from "./userCard/userCard.js";
import { IUser, WebSockets } from "../types.js";

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
  const protectedRoutes: string[] = ["/", "/game", "/friends", "/selection"];
  if (protectedRoutes.includes(currentPath) && (await userIsLogin()) === false) {
    return true;
  }
  return false;
}

let previousPage: string | undefined;

// Fonction principale du routeur
const router = async (): Promise<void> => {
  const routes = [
    { path: "/", view: Dashboard },
    { path: "/login", view: Login },
    { path: "/game", view: Game },
    { path: "/friends", view: Friends },
    { path: "/auth", view: Auth },
    { path: "/selection", view: Selection },
  ];

  let match;

  const pageBuffer = localStorage.getItem('pageBuffer');

  if (pageBuffer !== null && await needToAuthenticate(pageBuffer) === false) {
    match = routes.find(route => pageBuffer === route.path) || routes[0];
    history.pushState(null, "", match.path);
    localStorage.removeItem('pageBuffer');
  } else {
    match = routes.find(route => location.pathname === route.path) || routes[0];
  }

  if (await needToAuthenticate(match.path) === true) {
    localStorage.setItem('pageBuffer', match.path);
    navigateTo("/auth");
    return;
  }

  
  if (await userIsLogin() && webSockets.chat === null) {
    setupWebSocket(sessionStorage.getItem("username"), "init");
  }

  if (previousPage && previousPage === match.path) return;

  const view = new match.view();

  const appId = document.getElementById("app");
  if (appId) {
    appId.innerHTML = await view.getHtml();
  }

  await chatDiv();
  await formSubmit();
  await printFriendList();
  await printNavbar(); // ✅ Exécuter après l'initialisation de la vue
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

// Gestion des événements après le chargement du DOM
document.addEventListener("DOMContentLoaded", async () => {
  await new Promise<void>((r) => setTimeout(r, 400));

  injectUserCard("card-login-container-id", {});

  const userForm = document.getElementById("user-form") as HTMLFormElement;
  userForm.addEventListener("input", () => {
    updateUserCardFromForm("user-form", "card-login-container-id");
  });

  const profileImageInput = document.getElementById("profileImageInput") as HTMLInputElement;
  profileImageInput.addEventListener("change", (event) => {
    previewImage(event, "profile-picture-card", "banner-card", "profileBannerInput");
  });

  const profileBannerInput = document.getElementById("profileBannerInput") as HTMLInputElement;
  profileBannerInput.addEventListener("change", (event) => {
    previewImage(event, "banner-card", "profile-picture-card", "profileImageInput");
  });
});
