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
        const formData = new FormData();
        if (picture)
            formData.append('picture', picture);
        if (banner)
            formData.append('banner', banner);
        if (bio)
            formData.append('bio', bio);
        if (name)
            formData.append('name', name);
        const response = await fetch('http://localhost:8000/users/@me', {
            method: 'PATCH',
            headers: headers,
            credentials: 'include',
            body: formData,
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