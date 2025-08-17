import { fetchApi, getHeader } from "../fetchApi.js";


export async function register_pwd(name: string, email: string, password: string) {
	try {
		const header = getHeader();
		header.append("Content-Type", "application/json");

		const response = await fetchApi("/auth/register", {
			method: "POST",
			headers: header,
			body: JSON.stringify({
				name: name,
				email: email,
				picture: "/assets/default.jpeg",
				password: password
			})
		});

		if (!response.ok) {
			throw new Error("Fail to register with password: " + await response.text());
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error: ", error);
	}
	return null;
}