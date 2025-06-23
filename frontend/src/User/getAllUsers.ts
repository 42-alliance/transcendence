import { UserData } from "../types.js";
import { fetchApi, getHeader } from "../fetchApi.js";

export async function getAllUsers(): Promise< UserData[] | null> {
	try {
		const header = getHeader();

		const response = await fetchApi("/users", {
			method: "GET",
			headers: header,
		});

		if (!response.ok)
			throw new Error("Fail to get all users: ", await response.json());

		return await response.json();
	} catch (error) {
		console.error("Error: ", error);
	}
	return null;
}
