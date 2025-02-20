import { cleanSessionStorage } from "./src/views/navbar/navbar.js";
import { navigateTo } from "./src/views/viewManager.js";

const dev_token = "Token 37cff866c48347a856dcfae3cbbbb7f5c2b14c33"

export function triggerToast(text, success) {
	const toastLive = document.getElementById('liveToast')
	const toast = new bootstrap.Toast(toastLive)
	if (success) {
		toastLive.classList.remove('text-bg-danger');
		toastLive.classList.add('text-bg-success');
	} else {
		toastLive.classList.add('text-bg-danger');
		toastLive.classList.remove('text-bg-success');
	}

	document.getElementById('toast_body').innerHTML = text;

	toast.show()
}

export async function userIsLogin() {
	const result = await me();
	
	if (result)
		return true;
	return false;
}

function setSessionStorage(userData) {
	sessionStorage.setItem("userId", userData.id);
	sessionStorage.setItem("userPicture", profileProfile(userData));
	sessionStorage.setItem("username", userData.username);
}

export async function me() {
	const headers = new Headers();
	headers.append('Authorization', dev_token);
	headers.append('Content-Type', 'application/json');
	try {
		const response = await fetch('http://localhost:8000/api/me/', {
			method: 'GET',
			headers: headers,
			credentials: 'include'
		})
		if (!response.ok) {
			console.error("failed to get my info")
			return null;
		}
		const data = await response.json()
		setSessionStorage(data);
		console.log("Raw data : ", data)
		return data;
	} catch (e) {
		console.error('Error', e)
	}
	return null;
}

export async function logUserApi(username) {
	console.log("Tentative de connexion de l'utilisateur en cour ...")
	try {
		const headers = new Headers();
		headers.append('Authorization', dev_token);
		headers.append('Content-Type', 'application/json');
		
		const response = await fetch('http://localhost:8000/api/login/', {
			method: 'POST',
			headers: headers,
			credentials: 'include', // send cookies
			body: JSON.stringify({
				'username': username, 
				'profile_picture': 'oui'
			})
		})
		if (!response.ok) {
			console.error("User does not exist yet")
			return false;
		}
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
		headers.append('Authorization', dev_token);
		headers.append('Content-Type', 'application/json');
		
		await deleteUserImage();
		const response = await fetch('http://localhost:8000/api/me/', {
			method: 'DELETE',
			headers: headers,
			credentials: 'include', // send cookies
		})
		if (!response.ok) {
			console.error("Failed to logout user")
			triggerToast("Failed to delete user", false)
			return false;
		}
		cleanSessionStorage();
		triggerToast("User remove from database!", true)
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
		headers.append('Authorization', dev_token);
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
		triggerToast("User diconected succesfuly!", true)
		console.log("User diconected succesfuly!");
		navigateTo("/auth");
	} catch (e) {
		console.error('Erreur :', e)
	}
}

async function uploadProfilePicture(username, profilePicture) {
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

export async function addUserApi(username, profilePicture) {
	console.log("Tentative de creation du nouvel utilisateur en cour ...")
	try {
		const headers = new Headers();
		headers.append('Authorization', dev_token);
		headers.append('Content-Type', 'application/json');
		
        let filePath = null;
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
		// Appel à l'endpoint /auth/redirect/ de votre API Django
		let headers = {
			'Authorization': dev_token,
		};

		const response = await fetch('http://localhost:8000/auth/redirect/', {
			method: 'GET',
			headers: headers,
		});
		const data = await response.json();
		if (data.auth_url) {
			// Redirection vers l'URL d'authentification 42
			console.log(data.auth_url)
			window.location.href = data.auth_url;
		} else {
			console.error('Erreur lors de la récupération de l\'URL d\'authentification');
		}
	} catch (e) {
		console.error('Erreur :', e);
	}
}

export function profileProfile(userData) {
	if (userData.upload_picture)
		return userData.upload_picture;
	return userData.profile_picture;
}


// Ajoutez la fonction au contexte global
window.getAuthUrl = getAuthUrl;
window.logOutUserApi = logOutUserApi;
window.deleteUserApi = deleteUserApi;
