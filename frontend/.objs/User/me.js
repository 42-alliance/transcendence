import { fetchApi } from "../utils.js";
export let user;
/**
 * Fetches the current user's data from the server.
 *
 * @returns The user data if the request is successful, otherwise null.
 */
export async function me() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    try {
        const response = await fetchApi('http://localhost:8000/users/@me/', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });
        const data = await response.json();
        user = data;
        return user;
    }
    catch (e) {
        console.error('Error', e);
        return null;
    }
}
//# sourceMappingURL=me.js.map