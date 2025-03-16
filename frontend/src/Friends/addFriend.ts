import { getHeader } from "../utils.js";


export async function addFriend(username: string) {
	try {
		const header = getHeader();
		header.append('Content-Type', 'application/json');

		const response = await fetch("http://localhost:8000/friends/requests", {
			method: "POST",
			headers: header,
			body: JSON.stringify({
				friendName: username,
			}),
		});

		if (!response.ok) {
			throw new Error("fail to add friend: ",  await response.json());
		}

		const result = await response.json();
		console.log("result: ", result);
	} catch (error) {
		console.error("Error: ", error);
	}
}
