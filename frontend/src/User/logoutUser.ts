import { fetchApi, getHeader } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";

/**
 * Logs out the current user and clears the session storage.
 */
export async function logOutUser(): Promise<void> {
	try {
		const headers = getHeader();
		
		await fetchApi('http://localhost:8000/auth/@me/logout', {
			method: 'POST',
			headers: headers,
		});
		console.log("User diconected succesfuly!");
		localStorage.removeItem("access_token");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}
