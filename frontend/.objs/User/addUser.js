import { getHeader } from "../utils.js";
import { navigateTo } from "../Views/viewManager.js";
// async function uploadFileCDN(file: File): Promise<string | undefined> {
// 	const headers = getHeader();
// 	const formData = new FormData();
// 	formData.append('file', file);
// 	try {
// 		const response = await fetch(`http/media/files`, {
// 			method: 'POST',
// 			headers: headers,
// 			credentials: 'include',
// 			body: formData,
// 		});
// 		if (!response.ok) {
// 			throw new Error("Error when trying to upload file");
// 		}
// 		const data = await response.json();
// 		console.log(data.message);
// 		return data.url;
// 	} catch (error) {
// 		console.error("Error: ", error);
// 	}
// }
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