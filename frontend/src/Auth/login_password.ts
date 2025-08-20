import { fetchApi, getHeader } from "../fetchApi.js";

export interface LoginReturn {
	success: boolean,
	access_token?: string,
	error?: string,
	twoFactorEnabled?: boolean
}

export async function login_pwd(email: string, password: string) {
	const to_return: LoginReturn = {
		success: true,
	};
	try {
		const header = getHeader();
		header.append("Content-Type", "application/json");

		const response = await fetchApi("/auth/login", {
			method: "POST",
			headers: header,
			body: JSON.stringify({
				email: email,
				password: password
			})
		});

		if (!response.ok) {
			if (response.status === 400 || response.status === 404) {
				to_return.success = false;
				to_return.error = "Invalid email or password.";
				return to_return;
			} 
			throw new Error("Fail to login with password: " + await response.text());
		}
		
		const data = await response.json();
		to_return.access_token = data.access_token;
	} catch (error: any) {
		console.error("Error: ", error);
		to_return.success = false;
		to_return.error = error;
	}
	return to_return;
}
