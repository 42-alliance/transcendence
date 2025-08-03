import { check2faEnabled } from "./setTwoFa.js";
import { setTwoFa } from "./setTwoFa.js";

export async function initTwoFaToggle() {
  try {
    const toggleElement = document.getElementById(
      "toggle-2fa"
    ) as HTMLInputElement;
    if (!toggleElement) return;

    // Récupérer l'état initial du 2FA
    const isEnabled = await check2faEnabled();
    console.log("2FA is currently enabled:", isEnabled);
    toggleElement.checked = isEnabled;

    // Ajouter l'écouteur d'événements
    toggleElement.addEventListener("change", async function (e) {
      if (
        e.target &&
        typeof (e.target as HTMLInputElement).checked !== "undefined"
      ) {
        const checked = (e.target as HTMLInputElement).checked;
        console.log("2FA toggled:", checked);

        if (checked) {
          // Enable 2FA
          await setTwoFa(true);
          showToast("Scan the QR code to enable 2FA.", "blue");
        } else {
          // Disable 2FA
          await setTwoFa(false);
          showToast("2FA is disabled.", "red");
        }
      }
      const isEnabled = await check2faEnabled();
      console.log("2FA is currently enabled:", isEnabled);
      toggleElement.checked = isEnabled;
    });
  } catch (error) {
    console.error("Error initializing 2FA toggle:", error);
  }
}

function showToast(message: string, color: "blue" | "red") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `bg-${color}-500 text-white p-4 rounded-lg shadow-lg`;
  toast.innerHTML = `<p>${message}</p>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}
