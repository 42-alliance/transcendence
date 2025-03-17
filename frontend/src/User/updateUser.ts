import { fetchApi, getHeader } from "../utils.js";

/**
 * Adds a new user with the given username and profile picture.
 * 
 * @param username - The username of the new user.
 * @param profilePicture - The profile picture file of the new user.
 */
export async function updateUserInfos(name?: string, picture?: File, banner?: File, bio?: string): Promise<void> {
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
			method: 'PUT',
			headers: headers,
			credentials: 'include',
			body: formData,
		});

		if (!response.ok) {
			throw new Error(await response.text());
		}
		console.log("User successfully updated");

	} catch (e) {
		console.error('Erreur :', e);
	}
}


export function openChangeImage() {
	const modal = document.getElementById('change-image');
	if (!modal)
		return;

	modal.classList.remove("hidden");
	setTimeout(() => modal.classList.add("opacity-100"), 10);
}

export function closeChangeImage() {
	const modal = document.getElementById('change-image');
	if (!modal)
		return;

	modal.classList.add("opacity-100");
	setTimeout(() => modal.classList.add("hidden"), 300);
}
