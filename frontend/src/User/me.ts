import { UserData } from "../types.js";
import { fetchApi } from "../utils.js";

export let userInfos: UserData = {};

/**
 * Vérifie si les informations de l'utilisateur sont complètes,
 * sinon fait un appel à `me()` pour les récupérer.
 */
export async function getUserInfos(): Promise<UserData | null> {
    if (userInfos.id && userInfos.name && userInfos.picture && userInfos.banner && userInfos.bio && userInfos.friends) {
        return userInfos; // 🔹 Déjà complet, pas besoin d'un nouvel appel
    }

    console.log("🔄 Récupération des informations utilisateur...");
    const data = await me();

	console.log("data: ", data);
    if (data) {
        userInfos = { ...userInfos, ...data }; // 🔹 Met à jour les champs manquants
        console.log("✅ Informations utilisateur mises à jour :", userInfos);
    } else {
        console.warn("⚠️ Impossible de récupérer les informations utilisateur.");
    }

    return userInfos;
}

/**
 * Fetches the current user's data from the server.
 * 
 * @returns The user data if the request is successful, otherwise null.
 */
export async function me(): Promise<UserData | null> {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');
	try {
		const response = await fetchApi('http://localhost:8000/users/@me', {
			method: 'GET',
			headers: headers,
		});
		const data: UserData = await response.json();
		console.log("data: ", data);

		userInfos = data;
		return userInfos;
	} catch (e) {
		console.error('Error', e)
		return null;
	}
}
