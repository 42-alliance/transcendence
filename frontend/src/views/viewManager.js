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

export const webSockets = {
	chat: null,
};

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

async function needToAuthenticate(currentPath) {
	const protectedRoutes = ["/", "/game", "/friends", "/selection"];
	
	if (protectedRoutes.includes(currentPath) && await userIsLogin() === false)
		return true;
	return false;
}
let previousPage = null;

const router = async () => {
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
		history.pushState(null, null, match.path);
		localStorage.removeItem('pageBuffer');
		
	}
	else
    	match = routes.find(route => location.pathname === route.path) || routes[0];

    if (await needToAuthenticate(match.path) === true) {
		localStorage.setItem('pageBuffer', match.path);
		navigateTo("/auth");
        return;
    }

	if (await userIsLogin() &&  webSockets.chat === null) {
		setupWebSocket(sessionStorage.getItem("username"), "init");
    }

	if (previousPage && previousPage === match.path)
		return;
	
    const view = new match.view();
    document.getElementById("app").innerHTML = await view.getHtml();

	await chatDiv();
	await formSubmit();
	await printFriendList();
    await printNavbar(); // ✅ Exécuter après l'initialisation de la vue
	previousPage = match.path;
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        const link = e.target.closest("[data-link]");
        if (link) {
            e.preventDefault();
            navigateTo(link.href);
        }
    });
    router();
});


document.addEventListener("DOMContentLoaded", async () => {
    await new Promise(r => setTimeout(r, 400));

	injectUserCard("card-login-container-id", {});

	document.getElementById("user-form").addEventListener("input", () => {
		updateUserCardFromForm("user-form", "card-login-container-id");
	});

    // Gestion spécifique du champ image
    document.getElementById("profileImageInput").addEventListener("change", (event) => {
        previewImage(event, "profile-picture-card", "banner-card", "profileBannerInput");
        // previewImage(event, "banner-card");
    });

    document.getElementById("profileBannerInput").addEventListener("change", (event) => {
        previewImage(event, "banner-card", "profile-picture-card", "profileImageInput");
        // previewImage(event, "profile-picture-c ard");
    });
});