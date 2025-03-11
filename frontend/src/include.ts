import { getAuthUrl } from "./Auth/getAuthUrl.js"
import { formSubmit } from "./Views/Login/Login.js";

// Ajoutez la fonction au contexte global
(window as any).getAuthUrl = getAuthUrl;
(window as any).formSubmit = formSubmit;