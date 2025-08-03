import { fetchApi, getHeader } from "../../fetchApi.js";

export async function send_2fa_code_setup(code: string): Promise<boolean> {
  console.log("Verifying 2FA code...");
  try {
    const header = getHeader();
    header.append("Content-Type", "application/json");

    const response = await fetchApi("/users/@me/2fa/setup/verify", {
      method: "POST",
      headers: header,
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("fail to send 2fa code");
    }
    console.log("2FA verification successful");
    return true;
  } catch (error) {
    console.error("2FA verification failed:", error);
  }
  return false;
}


export async function send_2fa_code(code: string): Promise<boolean> {
  console.log("Verifying 2FA code...");
  try {
    const header = getHeader();
    header.append("Content-Type", "application/json");

    const response = await fetchApi("/users/@me/2fa/setup/verify", {
      method: "POST",
      headers: header,
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("fail to send 2fa code");
    }
    console.log("2FA verification successful");
    return true;
  } catch (error) {
    console.error("2FA verification failed:", error);
  }
  return false;
}