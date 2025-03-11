import { fetchApi } from "../utils.js";
/**
 * Fetches the authentication URL from the server and redirects the user to it.
 */
export async function getAuthUrl() {
    try {
        const headers = new Headers();
        const response = await fetchApi('http://localhost:8000/auth/redirect', {
            method: 'GET',
            headers: headers,
        });
        const data = await response.json();
        if (data.auth_url) {
            console.log(data.auth_url);
            window.location.href = data.auth_url;
        }
        else {
            console.error('Erreur lors de la récupération de l\'URL d\'authentification');
        }
    }
    catch (e) {
        console.error('Erreur :', e);
    }
}
//# sourceMappingURL=getAuthUrl.js.map