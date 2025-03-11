import { userIsLogin } from "../../User/userIsLogin.js";
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
            navigateTo("/");
            return "";
        }
        try {
            const response = await fetch("src/Views/Auth/Auth.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
            return await response.text();
        }
        catch (error) {
            console.error(error);
            return `<p>Erreur lors du chargement du formulaire</p>`;
        }
    }
}
//# sourceMappingURL=Auth.js.map