import { UserData } from "../types.js";
import { fetchApi } from "../utils.js";

export async function GetUserByName(username: string): Promise<UserData | null> {
	try {
		const headers = new Headers();
		const response = await fetchApi(`http://localhost:8000/users/${username}`, {
			method: "GET",
			headers: headers,
		});

		const user_infos: UserData = await response.json();
		console.log("user_infos: ",user_infos);
		return user_infos;
	} catch (error) {
		console.error("Error: ", error);
		return null;
    }
}
