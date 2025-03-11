import { getAuthUrl } from "./Auth/getAuthUrl.js"

// Ajoutez la fonction au contexte global
(window as any).getAuthUrl = getAuthUrl;