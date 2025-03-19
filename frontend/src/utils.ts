import { logOutUser } from "./User/logoutUser.js";

interface optionRequest {
	method: string,
	headers?: HeadersInit | undefined,
	body?: BodyInit | null | undefined,
};

/**
 * Fetches data from the given API URL with the specified options.
 * 
 * @param url - The URL to fetch data from.
 * @param options - The options to use for the fetch request.
 * @returns The response from the fetch request.
 * @throws Will throw an error if the fetch request fails.
 */
export async function fetchApi(url: string, options: optionRequest): Promise<Response> {
    const token = localStorage.getItem("access_token");
    let newOptions: RequestInit = {
        ...options,
        method: options.method || 'GET', // Default method to GET if not provided
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

export async function refreshToken(callback: Promise<any>) {
	const token = getAccessToken();

	if (!token)
		await logOutUser();

    const response = await fetch("http://localhost:8000/auth/token/refresh", {
        method: "POST",
		body: JSON.stringify({
			token: token,
		})
    });

    const data = await response.json();
    if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
		await callback;
    } else {
		await logOutUser();
    }
}
