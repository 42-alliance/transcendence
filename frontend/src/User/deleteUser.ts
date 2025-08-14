import { fetchApi, getHeader } from "../fetchApi.js";
import { navigateTo, webSockets, router } from "../Views/viewManager.js";
import { resetUserInfos } from "./me.js";

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
		console.log("User deleted succesfuly!");
		localStorage.removeItem("access_token");
		// Clear cached state and globals
		resetUserInfos();
		try { (window as any).user_info = null; } catch {}
		try { (window as any).gameInstance = null; } catch {}
		navigateTo("/auth");
		await router();
	} catch (e) {
		console.error('Erreur :', e)
	}
}

