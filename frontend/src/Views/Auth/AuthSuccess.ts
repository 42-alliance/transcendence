import { setUserInfo } from "../../User/me.js";
import AView from "../AView.js";
import Login from "../Login/Login.js";
import { navigateTo } from "../viewManager.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Authentification");
	}

	// Charge le contenu HTML du formulaire
	async getHtml(): Promise<string> {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const register = params.get("register");

        if (token) {
			localStorage.setItem("access_token", token);
		}
		const view = new Login(); // temporaire
		return await view.getHtml();

		// 	await setUserInfo();
		// 	window.history.replaceState({}, document.title, "/auth-success");
		// 	// if (register && register === "true") {
		// 		const view = new Login();
		// 		return await view.getHtml();
		// 	// }
		// 	// navigateTo("/");
		// 	return "";
        // } else {
        //     console.error("Échec de l'authentification");
		// 	return "<p>Erreur d'authentification.</p>";
        // }
	}
}