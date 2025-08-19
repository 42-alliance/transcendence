import { fetchApi, getHeader } from "../fetchApi.js";

export interface RegisterReturn {
	success: boolean,
	access_token?: string,
	error?: string,
	redirect_url?: string,
}

export async function register_pwd(name: string, email: string, password: string) {
	const to_return: RegisterReturn = {
		success: true
	};

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
		to_return.access_token = data.access_token;
	} catch (error) {
		to_return.success = false;
		console.error("Error: ", error);
	}
	return to_return;
}


export async function is_name_dispo(name: string) {
	const to_return: RegisterReturn = {
		success: true
	};

	try {
		const header = getHeader();
		header.append("Content-Type", "application/json");

		const response = await fetchApi("/register/name/dispo", {
			method: "POST",
			headers: header,
			body: JSON.stringify({
				name: name,
			})
		});

		if (!response.ok) {
			throw new Error("Fail to register with password: " + await response.text());
		}

		const data = await response.json();
		if (data.dispo === false) {
			to_return.success = false
			to_return.error = "Username already use !";
		}
	} catch (error) {
		to_return.success = false;
		console.error("Error: ", error);
	}
	return to_return;
}

export async function is_email_dispo(email: string) {
	const to_return: RegisterReturn = {
		success: true
	};

	try {
		const header = getHeader();
		header.append("Content-Type", "application/json");

		const response = await fetchApi("/register/email/dispo", {
			method: "POST",
			headers: header,
			body: JSON.stringify({
				email: email,
			})
		});

		if (!response.ok) {
			throw new Error("Fail to register with password: " + await response.text());
		}

		const data = await response.json();
		if (data.dispo === false) {
			to_return.success = false
			to_return.error = "Email already use ! Try to log in";
		}
	} catch (error) {
		to_return.success = false;
		console.error("Error: ", error);
	}
	return to_return;
}