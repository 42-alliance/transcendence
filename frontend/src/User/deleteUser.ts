import { fetchApi, getHeader } from "../fetchApi.js";
import { navigateTo, webSockets } from "../Views/viewManager.js";

/**
 * Deletes the current user from the server and clears the session storage.
 */
export async function deleteUser(): Promise<void> {
	try {
		const headers = getHeader();
		
		await fetchApi('/auth/@me/delete', {
			method: 'DELETE',
			headers: headers,
		});
		webSockets.chat?.close();
		webSockets.game?.close();
		webSockets.user?.close();
		console.log("User  succesfuly!");
		localStorage.removeItem("access_token");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

