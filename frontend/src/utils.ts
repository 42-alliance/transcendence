import { logOutUser } from "./User/logoutUser.js";

interface optionRequest {
	method: string,
	headers?: HeadersInit | undefined,
	body?: BodyInit | null | undefined,
};

export async function fetchApi(url: string, options: optionRequest, retry: boolean = true): Promise<Response> {
    const token = localStorage.getItem("access_token");
    let newOptions: RequestInit = {
        ...options,
        method: options.method
    };

    if (token) {
        newOptions.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    newOptions.credentials = "include";
    newOptions.body = options.body;

    const response = await fetch(url, newOptions);

    if (response.status === 401 && retry) {
        await refreshToken();
        return await fetchApi(url, options, false); // Ne réessaie qu'une seule fois
    }

    if (!response.ok) {
        console.error("Failed to fetch data from server: ", await response.json());
        throw new Error("Failed to fetch data from server: " + response.statusText);
    }

    return response;
}

export function getAccessToken() {
	const token = localStorage.getItem("access_token");
	return token;
}

export function getHeader(): Headers {
	const headers = new Headers();
    const token = localStorage.getItem("access_token");
	if (token) {
		headers.append("Authorization", `Bearer ${token}`);
	}
	return headers;
}

async function refreshToken() {
    const token = getAccessToken();

	if (!token)
		throw new Error("No token found");

	const headers = getHeader();
    headers.append('Content-Type', 'application/json');

	const response = await fetch("http://localhost:8000/auth/token/refresh", {
		method: "POST",
		headers: headers,
		credentials: "include",
		body: JSON.stringify({
            token: token,
		})
	});

	if (!response.ok)
		throw new Error("Fail to refresh token");

	const data = await response.json();
	if (data.access_token)
		localStorage.setItem("access_token", data.access_token);
}
