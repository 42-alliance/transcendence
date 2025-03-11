import { fetchApi } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";
/**
 * Adds a new user with the given username and profile picture.
 *
 * @param username - The username of the new user.
 * @param profilePicture - The profile picture file of the new user.
 */
export async function addUser(username, profilePicture) {
    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        await fetchApi('http://localhost:8000/api/user/', {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({
                'name': username,
                'upload_picture': profilePicture,
            })
        });
        console.log("User creation test succesed");
        navigateTo("/");
    }
    catch (e) {
        console.error('Erreur :', e);
    }
}
//# sourceMappingURL=addUser.js.map