import { UserData } from "../types.js";
import { fetchApi, getHeader } from "../utils.js";

export async function getAllFriends(): Promise< UserData[] | null> {
	try {
		const header = getHeader();

		const response = await fetchApi("http://localhost:8000/friends/list", {
			method: "GET",
			headers: header,
		});

		if (!response.ok) {
			throw new Error("Response fail friend/list: " + response.statusText);
		}

		return await response.json();
	} catch (error) {
		console.log("Error: ", error);
	}
	return null;
}
