import { getHeader, fetchApi } from "../../fetchApi.js";

export async function setTwoFa(val: boolean): Promise<void> {
  console.log("Setting two-factor authentication to:", val);
  try {
    const headers = {
      ...getHeader(),
      "Content-Type": "application/json", // Ajout explicite du Content-Type
    };

    const response = await fetchApi("/users/@me/twofa", {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ enabled: val }), // S'assurer que c'est un objet valide
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    console.log("Two-factor authentication updated successfully");
  } catch (e) {
    console.error("Error updating two-factor authentication:", e);
    throw e;
  }
}
