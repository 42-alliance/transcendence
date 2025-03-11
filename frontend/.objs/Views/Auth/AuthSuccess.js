import AView from "../AView.js";
import Login from "../Login/Login.js";
export default class extends AView {
    constructor() {
        super();
        this.setTitle("Authentification");
    }
    // Charge le contenu HTML du formulaire
    async getHtml() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const register = params.get("register");
        const view = new Login(); // temporaire
        return await view.getHtml();
        // if (token) {
        // 	localStorage.setItem("access_token", token);
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
//# sourceMappingURL=AuthSuccess.js.map