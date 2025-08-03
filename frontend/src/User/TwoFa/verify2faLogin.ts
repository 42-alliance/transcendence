import { fetchApi, getHeader } from "../../fetchApi.js";
import { navigateTo } from "../../Views/viewManager.js";

export async function showLoginVerification(): Promise<void> {
  const modal = document.getElementById("twofa-login-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

export async function verifyLoginCode(code: string): Promise<boolean> {
  try {
    const response = await fetchApi("/users/@me/twofa/login-verify", {
      method: "POST",
      headers: {
        ...getHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      const modal = document.getElementById("twofa-login-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("2FA verification failed:", error);
    return false;
  }
}

// Initialiser les écouteurs d'événements
export function initLogin2faVerification(): void {
  const verifyButton = document.getElementById("verify-login-2fa");
  const codeInput = document.getElementById(
    "login-verification-code"
  ) as HTMLInputElement;

  if (verifyButton && codeInput) {
    verifyButton.addEventListener("click", async () => {
      const code = codeInput.value.trim();
      if (code) {
        const success = await verifyLoginCode(code);
        if (success) {
          navigateTo("/"); // Rediriger vers la page d'accueil après vérification réussie
        } else {
          // Afficher un message d'erreur
          alert("Invalid verification code. Please try again.");
        }
      }
    });
  }
}
