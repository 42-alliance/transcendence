import { fetchApi, getHeader } from "../../fetchApi.js";

export interface TwoFAReturn {
	success: boolean,
	error?: string,
}

export async function verifyLoginCodeeeee(
	code: string,
	id: number
) {
	const to_return: TwoFAReturn = {
		success: false
	};
	console.log("Verifying 2FA code...");
	try {
		const response = await fetchApi("/auth/2fa-login", {
			method: "POST",
			headers: {
				...getHeader(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code, id }),
		});

		console.log("cheff 123");
		if (!response.ok) {
			to_return.error = "Not the good code";
			return to_return;
		}
		const result = await response.json();
		localStorage.setItem("access_token", result.access_token);
		console.log("je passe ici");
		console.log(localStorage);
		
		to_return.success = true;
		return to_return;
	} catch (error) {
		console.error("2FA verification failed:", error);
		to_return.error = "2FA verification failed: " + error; 
	}
	return to_return;
}
