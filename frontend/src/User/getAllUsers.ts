import { fetchApi, getHeader } from "../utils.js";

interface User {
	id: number;
	name: string;
	picture: string;
	banner: string;
	bio: string;
	created_at: string;
}

export async function getAllUsers(): Promise< User[] | null> {
	try {
		const header = getHeader();

		const response = await fetchApi("http://localhost:8000/users", {
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
