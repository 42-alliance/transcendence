import { fetchApi, getHeader } from "../fetchApi.js";
import { navigateTo, webSockets } from "../Views/viewManager.js";

/**
 * Logs out the current user and clears the session storage.
 */
export async function logOutUser(): Promise<void> {
	try {
		const headers = getHeader();
		
		const response = await fetchApi('/auth/@me/logout', {
			method: 'POST',
			headers: headers,
		});

		const result = await response.json();
		webSockets.chat?.close();
		webSockets.game?.close();
		webSockets.user?.close();
		console.log(result.message);
		localStorage.removeItem("access_token");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}
