import { fetchApi, getHeader } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";

/**
 * Deletes the current user from the server and clears the session storage.
 */
export async function deleteUser(): Promise<void> {
	try {
		const headers = getHeader();
		
		await fetchApi('http://localhost:8000/users', {
			method: 'DELETE',
			headers: headers,
		});
		console.log("User  succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}
