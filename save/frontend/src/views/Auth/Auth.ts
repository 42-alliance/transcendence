import { userIsLogin } from "../../../script.js";
import AView from "../AView.js";
import { navigateTo } from "../viewManager.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Authentification");
	}

	// Charge le contenu HTML du formulaire
	async getHtml() {

        if (await userIsLogin() === true) {
			console.log("error")
            navigateTo("/");
            return;
        }
		try {
			const response = await fetch("src/views/Auth/Auth.html");
			if (!response.ok) {
				throw new Error(`Failed to load HTML file: ${response.statusText}`);
			}
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Erreur lors du chargement du formulaire</p>`;
		}
	}
}