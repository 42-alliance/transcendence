import { UserData } from "../types.js";
import { fetchApi } from "../fetchApi.js";

export async function GetUserByName(username: string): Promise<UserData | null> {
	try {
		const headers = new Headers();
		const response = await fetchApi(`/users/${username}`, {
			method: "GET",
			headers: headers,
		});

		const user_infos: UserData = await response.json();
		return user_infos;
	} catch (error) {
		console.error("Error: ", error);
		return null;
    }
}

export async function GetUserBlockedListByName(id: number): Promise<UserData[]> {
		try {
		const headers = new Headers();
		const response = await fetchApi(`/users/get-blocked/${id}`, {
			method: "GET",
			headers: headers,
		});

		const data = await response.json();
		console.log("blocked list of : [", id, "] => ", data);
		if (data.blockedList && Array.isArray(data.blockedList)) {
			return data.blockedList
		}
		return [];
	} catch (error) {
		console.error("Error: ", error);
		return [];
    }
}