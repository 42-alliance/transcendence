import { me } from "./me.js";
/**
 * Checks if the user is logged in by calling the `me` function.
 *
 * @returns A boolean indicating whether the user is logged in.
 */
export async function userIsLogin() {
    const result = await me();
    if (result)
        return true;
    return false;
}
//# sourceMappingURL=userIsLogin.js.map