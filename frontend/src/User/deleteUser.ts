import { fetchApi } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";

/**
 * Deletes the current user from the server and clears the session storage.
 */
export async function deleteUser(): Promise<void> {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		await fetchApi('http://localhost:8000/api/users/', {
			method: 'DELETE',
			headers: headers,
			credentials: 'include', // send cookies
		});
		console.log("User  succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

(window as any).deleteUser = deleteUser;
