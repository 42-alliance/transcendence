/**
 * Fetches data from the given API URL with the specified options.
 *
 * @param url - The URL to fetch data from.
 * @param options - The options to use for the fetch request.
 * @returns The response from the fetch request.
 * @throws Will throw an error if the fetch request fails.
 */
export async function fetchApi(url, options = {}) {
    const token = localStorage.getItem("access_token");
    if (token) {
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    const response = await fetch(url, options);
    if (!response.ok) {
        console.error("Failed to fetch data from server", response.status);
        throw new Error("Failed to fetch data from server: " + response.statusText);
    }
    return response;
}
//# sourceMappingURL=utils.js.map