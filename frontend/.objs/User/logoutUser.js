import { fetchApi } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";
/**
 * Logs out the current user and clears the session storage.
 */
export async function logOutUser() {
    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        await fetchApi('http://localhost:8000/api/logout/', {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        });
        console.log("User diconected succesfuly!");
        navigateTo("/auth");
    }
    catch (e) {
        console.error('Erreur :', e);
    }
}
window.logOutUser = logOutUser;
//# sourceMappingURL=logoutUser.js.map