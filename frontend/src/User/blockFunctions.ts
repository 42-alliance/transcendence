import { fetchApi } from "../fetchApi.js";


export async function blockUser(user_id: number): Promise<void> {
	try {
		const response = await fetchApi(`/users/block/${user_id}`, {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error("Failed to block user");
		}
	} catch (error) {
		console.error("Error blocking user:", error);
	}
}

export async function unblockUser(user_id: number): Promise<void> {
	try {
		const response = await fetchApi(`/users/unblock/${user_id}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error("Failed to unblock user");
		}
	} catch (error) {
		console.error("Error unblocking user:", error);
	}
}