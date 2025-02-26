/**
 * Fetches data from the given API URL with the specified options.
 * 
 * @param url - The URL to fetch data from.
 * @param options - The options to use for the fetch request.
 * @returns The response from the fetch request.
 * @throws Will throw an error if the fetch request fails.
 */
export async function fetchApi(url: string, options: RequestInit): Promise<Response>;

/**
 * Checks if the user is logged in by calling the `me` function.
 * 
 * @returns A boolean indicating whether the user is logged in.
 */
export async function userIsLogin(): Promise<boolean>;

/**
 * Sets the session storage with the given user data.
 * 
 * @param user - The user data to store in session storage.
 */
function setSessionStorage(user: IUserData): void;

/**
 * Fetches the current user's data from the server.
 * 
 * @returns The user data if the request is successful, otherwise null.
 */
export async function me(): Promise<IUserData | null>;

/**
 * Logs in the user with the given username.
 * 
 * @param username - The username of the user to log in.
 * @returns A boolean indicating whether the login was successful.
 */
export async function logUserApi(username: string): Promise<boolean>;

/**
 * Deletes the current user's profile picture from the server.
 */
async function deleteUserImage(): Promise<void>;

/**
 * Deletes the current user from the server and clears the session storage.
 */
export async function deleteUserApi(): Promise<void>;

/**
 * Logs out the current user and clears the session storage.
 */
export async function logOutUserApi(): Promise<void>;

/**
 * Uploads a profile picture for the given username.
 * 
 * @param username - The username of the user.
 * @param profilePicture - The profile picture file to upload.
 * @returns The URL of the uploaded profile picture if successful, otherwise null.
 */
async function uploadProfilePicture(username: string, profilePicture: File): Promise<string | null>;

/**
 * Adds a new user with the given username and profile picture.
 * 
 * @param username - The username of the new user.
 * @param profilePicture - The profile picture file of the new user.
 */
export async function addUserApi(username: string, profilePicture: File): Promise<void>;

/**
 * Fetches the authentication URL from the server and redirects the user to it.
 */
async function getAuthUrl(): Promise<void>;
import { cleanSessionStorage } from "./src/views/navbar/navbar.js";
import { navigateTo } from "./src/views/viewManager.js";
import { IUserData } from "./types.js";


export async function fetchApi(url: string, options: RequestInit) {

	const response = await fetch(url, options);

	if (!response.ok) {
		console.error("Failed to fetch data from server");
		throw new Error("Failed to fetch data from server: " + response.statusText);
	}
	return response;
}

export async function userIsLogin() {
	const result = await me();
	
	if (result)
		return true;
	return false;
}

function setSessionStorage(user: IUserData) {
	sessionStorage.setItem("userId", user.id.toString());
	sessionStorage.setItem("userPicture", user.picture);
	sessionStorage.setItem("username", user.name);
}

export async function me() {
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

export async function logUserApi(username: string) {
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

async function deleteUserImage() {
    const user = await me();

    if (user === null || user.upload_picture === null) {
        console.error("User or user image not found");
        return;
    }

    try {
        const headers = new Headers();
        const pathDelete = user.upload_picture;

        const response = await fetch(pathDelete, {
            method: "DELETE",
            headers: headers,
        });

        if (!response.ok) {
            console.error("Failed to delete user picture:", await response.text());
            return;
        }

        console.log("User picture successfully deleted!");
    } catch (error) {
        console.error("Internal server error:", error);
    }
}

export async function deleteUserApi() {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		await deleteUserImage();
		const response = await fetch('http://localhost:8000/api/me/', {
			method: 'DELETE',
			headers: headers,
			credentials: 'include', // send cookies
		})
		if (!response.ok) {
			console.error("Failed to logout user")
			return false;
		}
		cleanSessionStorage();
		console.log("User  succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

export async function logOutUserApi() {
	console.log("Tentative de deconnexion de l'utilisateur")
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		const response = await fetch('http://localhost:8000/api/logout/', {
			method: 'GET',
			headers: headers,
			credentials: 'include', // send cookies
		})
		if (!response.ok) {
			console.error("Failed to logout user")
			return false;
		}
		cleanSessionStorage();
		console.log("User diconected succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

async function uploadProfilePicture(username: string, profilePicture: File) : Promise<string | null> {
    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/octet-stream');

        const pathUpload = `http://localhost:9000/upload/${username}_${profilePicture.name}`;
        const pathDownload = `http://localhost:9000/files/${username}_${profilePicture.name}`;

        const response = await fetch(pathUpload, {
            method: "PUT",
            headers: headers,
            body: profilePicture,
        });

        if (!response.ok) {
            console.error("File upload failed:", await response.text());
            return null;
        }

        return pathDownload;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}

export async function addUserApi(username: string, profilePicture: File) : Promise<void> {
	console.log("Tentative de creation du nouvel utilisateur en cour ...")
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
        let filePath: string | null;
        if (profilePicture) {
            filePath = await uploadProfilePicture(username, profilePicture);
            if (!filePath) {
                console.error("File upload failed. User creation aborted.");
                return;
            }
        }
		const response = await fetch('http://localhost:8000/api/user/', {
			method: 'POST',
			headers: headers,
			credentials: 'include', // send cookies
			body: JSON.stringify({
				'username': username,
				'upload_picture': filePath,
			})
		})
		if (!response.ok) {
			console.error("failed to check user creation")
			return;
		}
		console.log("User creation test succesed");
		navigateTo("/");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

async function getAuthUrl() {
	try {
		const headers = new Headers();

		const response = await fetch('http://localhost:8000/auth/redirect/', {
			method: 'GET',
			headers: headers,
		});

		if (!response.ok) {
			console.error("failed to get auth url")
			return;
		}
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
window.getAuthUrl = getAuthUrl;
window.logOutUserApi = logOutUserApi;
window.deleteUserApi = deleteUserApi;
