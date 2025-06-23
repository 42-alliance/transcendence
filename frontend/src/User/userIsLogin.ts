import { getUserInfos } from "./me.js";

/**
 * Checks if the user is logged in by calling the `getUserInfo` function.
 * 
 * @returns A boolean indicating whether the user is logged in.
 */
export async function userIsLogin(): Promise<Boolean> {
	const result = await getUserInfos();
	
	if (result)
		return true;
	return false;
}
