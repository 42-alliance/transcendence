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
    async getHtml() {
        const params = new URLSearchParams(window.location.search);
        console.log("params: ", params);
        const token = params.get("token");
        const register = params.get("register");
        if (token) {
            localStorage.setItem("access_token", token);
        }
        await setUserInfo();
        if (register && register === "true") {
            const view = new Login();
            return await view.getHtml();
        }
        navigateTo("/");
        return "";
    }
}
//# sourceMappingURL=AuthSuccess.js.map