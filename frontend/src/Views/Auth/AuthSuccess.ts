import { getUserInfos } from "../../User/me.js";
import { fetchApi, getHeader } from "../../fetchApi.js";
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

    const userInfo = await getUserInfos();
    if (register && register === "true") {
      const view = new Login();
      return await view.getHtml();
    }

    try {
      const response = await fetchApi("/users/@me/twofa", {
        method: "GET",
        headers: getHeader(),
      });
      const { enabled } = await response.json();

      if (enabled) {
        // Si 2FA est activé, afficher le modal de vérification
        const { showLoginVerification, initLogin2faVerification } =
          await import("../../User/TwoFa/verify2faLogin.js");
        showLoginVerification();
        initLogin2faVerification();
        return ""; // Retourner une page vide car le modal sera affiché par-dessus
      } else {
        // Si pas de 2FA, rediriger directement
        navigateTo("/");
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      // En cas d'erreur, rediriger vers la page d'accueil par sécurité
      navigateTo("/");
    }
    return "";
  }
}
