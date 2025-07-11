import { cleanSessionStorage } from "./views/navbar/navbar.js";
import { navigateTo } from "./views/viewManager.js";
import { IUser } from "./types.js";

/**
 * Fetches data from the given API URL with the specified options.
 * 
 * @param url - The URL to fetch data from.
 * @param options - The options to use for the fetch request.
 * @returns The response from the fetch request.
 * @throws Will throw an error if the fetch request fails.
 */
export async function fetchApi(url: string, options: RequestInit): Promise<Response> {

	const response = await fetch(url, options);

	if (!response.ok) {
		console.error("Failed to fetch data from server");
		throw new Error("Failed to fetch data from server: " + response.statusText);
	}
	return response;
}

/**
 * Checks if the user is logged in by calling the `me` function.
 * 
 * @returns A boolean indicating whether the user is logged in.
 */
export async function userIsLogin(): Promise<Boolean> {
	const result = await me();
	
	if (result)
		return true;
	return false;
}

/**
 * Sets the session storage with the given user data.
 * 
 * @param user - The user data to store in session storage.
 */
function setSessionStorage(user: IUser): void {
	sessionStorage.setItem("userId", user.id.toString());
	sessionStorage.setItem("userPicture", user.picture);
	sessionStorage.setItem("username", user.name);
}

/**
 * Fetches the current user's data from the server.
 * 
 * @returns The user data if the request is successful, otherwise null.
 */
export async function me(): Promise<IUser | null> {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');
	try {
		const response = await fetchApi('http://localhost:8000/api/me/', {
			method: 'GET',
			headers: headers,
			credentials: 'include'
		});
		const data = await response.json();
		setSessionStorage(data);
		return data;
	} catch (e) {
		console.error('Error', e)
		return null;
	}
}

/**
 * Logs in the user with the given username.
 * 
 * @param username - The username of the user to log in.
 * @returns A boolean indicating whether the login was successful.
 */
export async function logUserApi(username: string): Promise<boolean> {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		await fetchApi('http://localhost:8000/api/login/', {
			method: 'POST',
			headers: headers,
			credentials: 'include',
			body: JSON.stringify({
				'username': username,
			})
		});
		console.log("User creation test succesed");
		navigateTo("/");
		return true;
	} catch (e) {
		console.error('Erreur :', e)
		return false;
	}
}

/**
 * Deletes the current user's profile picture from the server.
 */
async function deleteUserImage(): Promise<void> {
    const user = await me();

    if (user === null || user.picture === null) {
        console.error("User or user image not found");
        return;
    }
    try {
        const headers = new Headers();
        const pathDelete = user.picture;

		await fetchApi(pathDelete, {
			method: "DELETE",
			headers: headers,
		});
        console.log("User picture successfully deleted!");
    } catch (error) {
        console.error("Internal server error:", error);
    }
}

/**
 * Deletes the current user from the server and clears the session storage.
 */
export async function deleteUserApi(): Promise<void> {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		await deleteUserImage();
		await fetchApi('http://localhost:8000/api/me/', {
			method: 'DELETE',
			headers: headers,
			credentials: 'include', // send cookies
		});
		cleanSessionStorage();
		console.log("User  succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}
/**
 * Logs out the current user and clears the session storage.
 */
export async function logOutUserApi(): Promise<void> {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		await fetchApi('http://localhost:8000/api/logout/', {
			method: 'GET',
			headers: headers,
			credentials: 'include',
		});
		cleanSessionStorage();
		console.log("User diconected succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

/**
 * Uploads a profile picture for the given username.
 * 
 * @param username - The username of the user.
 * @param profilePicture - The profile picture file to upload.
 * @returns The URL of the uploaded profile picture if successful, otherwise null.
 */
async function uploadProfilePicture(username: string, profilePicture: File) : Promise<string | null> {
    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/octet-stream');

        const pathUpload = `http://localhost:9000/upload/${username}_${profilePicture.name}`;
        const pathDownload = `http://localhost:9000/files/${username}_${profilePicture.name}`;
// TODO: faire en sorte que l'api retourne le path de l'image
        await fetchApi(pathUpload, {
            method: "PUT",
            headers: headers,
            body: profilePicture,
        });
        return pathDownload;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}

/**
 * Adds a new user with the given username and profile picture.
 * 
 * @param username - The username of the new user.
 * @param profilePicture - The profile picture file of the new user.
 */
export async function addUserApi(username: string, profilePicture: File) : Promise<void> {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
        let filePath = await uploadProfilePicture(username, profilePicture);
		if (!filePath) {
			console.error("File upload failed. User creation aborted.");
			return;
		}
		await fetchApi('http://localhost:8000/api/user/', {
			method: 'POST',
			headers: headers,
			credentials: 'include',
			body: JSON.stringify({
				'username': username,
				'upload_picture': filePath,
			})
		});
		console.log("User creation test succesed");
		navigateTo("/");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

/**
 * Fetches the authentication URL from the server and redirects the user to it.
 */
async function getAuthUrl(): Promise<void> {
	try {
		const headers = new Headers();

		const response = await fetchApi('http://localhost:8000/auth/redirect/', {
			method: 'GET',
			headers: headers,
		});
		const data = await response.json();
		if (data.auth_url) {
			console.log(data.auth_url)
			window.location.href = data.auth_url;
		} else {
			console.error('Erreur lors de la récupération de l\'URL d\'authentification');
		}
	} catch (e) {
		console.error('Erreur :', e);
	}
}

// Ajoutez la fonction au contexte global
(window as any).getAuthUrl = getAuthUrl;
(window as any).logOutUserApi = logOutUserApi;
(window as any).deleteUserApi = deleteUserApi;
