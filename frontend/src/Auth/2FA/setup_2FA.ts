import { fetchApi } from "../../fetchApi.js";

export async function setup_2fa(): Promise<string | null> {
	try {
		const response = await fetchApi("/users/@me/2fa/setup", {
			method: "GET"
		});

		if (!response.ok) {
			throw new Error("fail to setup 2fa");
		}
		const data = await response.json();
		return data.qr_code;
	} catch (error) {
		console.log("Error setup_2fa: ", error);
	}
	return null;
}
