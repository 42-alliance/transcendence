import { getHeader } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";
/**
 * Adds a new user with the given username and profile picture.
 *
 * @param username - The username of the new user.
 * @param profilePicture - The profile picture file of the new user.
 */
export async function updateUserInfos(name, picture, banner, bio) {
    try {
        const headers = getHeader();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        const test = JSON.stringify({
            name: name,
        });
        console.log("test: ", test);
        const response = await fetch('http://localhost:8000/users/@me', {
            method: 'PUT',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({
                name: name,
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        console.log("User successfully updated");
        navigateTo("/");
    }
    catch (e) {
        console.error('Erreur :', e);
    }
}
//# sourceMappingURL=addUser.js.map