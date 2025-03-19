import { fetchApi } from "../utils";

export async function GetUserInfos(username: string) {
	try {
		console.log("Try to fetch ", username, " infos");
		const headers = new Headers();
		const response = await fetchApi(`http://localhost:8000/users/${username}/`, {
			method: "GET",
			headers: headers,
		});

		if (!response.ok) {
			throw new Error("Erreur lors de la récupération des donnes de l'utilisateur");
		}

		console.log("DEBUG => ", response);
		const user_infos = await response.json();
		console.log("Infos recuperer :", user_infos);
		return user_infos;

	} catch (e) {
		throw new Error("Erreur lors de la récupération des donnes de l'utilisateur");
    }
}