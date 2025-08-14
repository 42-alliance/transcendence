import { fetchApi, getHeader } from "../fetchApi.js";
import { navigateTo, webSockets, router } from "../Views/viewManager.js";
import { resetUserInfos } from "./me.js";

/**
 * Logs out the current user and clears the session storage.
 */
export async function logOutUser(): Promise<void> {
  try {
    const headers = getHeader();

    const response = await fetchApi("/auth/@me/logout", {
      method: "POST",
      headers: headers,
    });

    const result = await response.json();
    webSockets.chat?.close();
    webSockets.game?.close();
    webSockets.user?.close();
    console.log(result.message);
    localStorage.removeItem("access_token");
    // Clear cached state and globals
    resetUserInfos();
    try {
      (window as any).user_info = null;
    } catch {}
    try {
      (window as any).gameInstance = null;
    } catch {}
    // Navigate to auth and immediately run router to render without reload
    navigateTo("/auth");
    await router();
  } catch (e) {
    console.error("Erreur :", e);
  }
}
