import { fetchApi } from "../utils.js";
import { User } from "./getAllUsers.js";

export async function GetUserByName(username: string): Promise<User | null> {
	try {
		const headers = new Headers();
		const response = await fetchApi(`http://localhost:8000/users/${username}`, {
			method: "GET",
			headers: headers,
		});

		const user_infos: User = await response.json();
		console.log("user_infos: ",user_infos);
		return user_infos;
	} catch (error) {
		console.error("Error: ", error);
		return null;
    }
}
