import { fetchApi, getHeader } from "../../fetchApi.js";
import { navigateTo } from "../../Views/viewManager.js";
import { setPending2FA } from "./twoFaState.js";

// Garder une référence aux event listeners pour pouvoir les nettoyer
let currentVerifyHandler: ((e: MouseEvent) => void) | null = null;
let currentKeyPressHandler: ((e: KeyboardEvent) => void) | null = null;
let currentCancelHandler: ((e: MouseEvent) => void) | null = null;

function cleanup2FAListeners(): void {
  const verifyButton = document.getElementById("verify-login-2fa");
  const codeInput = document.getElementById("login-verification-code");
  const cancelButton = document.getElementById("cancel-login-2fa");

  if (currentVerifyHandler && verifyButton) {
    verifyButton.removeEventListener("click", currentVerifyHandler);
    currentVerifyHandler = null;
  }

  if (currentKeyPressHandler && codeInput) {
    codeInput.removeEventListener("keypress", currentKeyPressHandler);
    currentKeyPressHandler = null;
  }

  if (currentCancelHandler && cancelButton) {
    cancelButton.removeEventListener("click", currentCancelHandler);
    currentCancelHandler = null;
  }
}

export async function showLoginVerification(): Promise<void> {
  console.log("Showing 2FA verification modal");
  setPending2FA(true);

  // Nettoyer les anciens listeners avant d'en ajouter de nouveaux
  cleanup2FAListeners();

  const modal = document.getElementById("twofa-login-modal");
  if (!modal) {
    console.error("2FA modal not found!");
    return;
  }

  modal.classList.remove("hidden");

  // Réinitialiser le champ de saisie
  const codeInput = document.getElementById(
    "login-verification-code"
  ) as HTMLInputElement;
  if (codeInput) {
    codeInput.value = "";
    codeInput.focus();
  }

  // Réinitialiser les event listeners
  initLogin2faVerification();
}

export async function verifyLoginCode(code: string): Promise<boolean> {
  console.log("Verifying 2FA code...");
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
      console.log("2FA verification successful");
      const modal = document.getElementById("twofa-login-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
      setPending2FA(false);
      return true;
    }
    console.log("2FA verification failed: invalid code");
    return false;
  } catch (error) {
    console.error("2FA verification failed:", error);
    return false;
  }
}

async function handleVerification(
  code: string,
  codeInput: HTMLInputElement
): Promise<void> {
  console.log("Handling verification for code:", code);
  if (code) {
    const success = await verifyLoginCode(code);
    if (success) {
      console.log("Verification successful, navigating to home");
      navigateTo("/");
    } else {
      console.log("Verification failed, resetting input");
      codeInput.value = "";
      codeInput.focus();
      alert("Invalid verification code. Please try again.");
    }
  }
}

// Initialiser les écouteurs d'événements
export function initLogin2faVerification(): void {
  console.log("Initializing 2FA verification listeners");

  const verifyButton = document.getElementById("verify-login-2fa");
  const codeInput = document.getElementById(
    "login-verification-code"
  ) as HTMLInputElement;
  const cancelButton = document.getElementById("cancel-login-2fa");

  if (!verifyButton || !codeInput) {
    console.error("Required 2FA elements not found!", {
      verifyButton: !!verifyButton,
      codeInput: !!codeInput,
    });
    return;
  }

  // Nettoyer les anciens listeners
  cleanup2FAListeners();

  // Gestionnaire pour la touche Enter
  currentKeyPressHandler = async (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      console.log("Enter key pressed in verification code input");
      const code = codeInput.value.trim();
      await handleVerification(code, codeInput);
    }
  };
  codeInput.addEventListener("keypress", currentKeyPressHandler);

  // Gestionnaire pour le bouton de vérification
  currentVerifyHandler = async () => {
    console.log("Verify button clicked");
    const code = codeInput.value.trim();
    await handleVerification(code, codeInput);
  };
  verifyButton.addEventListener("click", currentVerifyHandler);

  // Gestionnaire pour le bouton d'annulation
  if (cancelButton) {
    currentCancelHandler = () => {
      console.log("Cancel button clicked, logging out");
      localStorage.removeItem("access_token");
      setPending2FA(false);
      navigateTo("/auth");
    };
    cancelButton.addEventListener("click", currentCancelHandler);
  }

  console.log("2FA verification listeners initialized");
}
