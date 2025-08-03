import { getHeader, fetchApi } from "../../fetchApi.js";

export async function setTwoFa(val: boolean): Promise<void> {
  try {
    const headers = {
      ...getHeader(),
      "Content-Type": "application/json", // Ajout explicite du Content-Type
    };
    // faire un test avec l'utilisateur
    if (val === true) {
      // 1. Récupérer les données de setup
      const setupData = await fetchSetupData();

      // 2. Afficher le modal
      console.log("Displaying 2FA setup modal with data:", setupData);
      showTwoFaModal(setupData);

      // 3. Attendre la vérification
      const verified = await handleVerification();

      // 4. Si vérifié, activer le 2FA
      if (verified) {
        await enableTwoFa(setupData);
      } else {
        console.log("Two-factor authentication setup was not verified.");
      }
    } else {
      try {
        console.log("Setting two-factor authentication to:", val);
        console.log("Disabling two-factor authentication");
        const response = await fetchApi("/users/@me/twofa", {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ enabled: val }), // S'assurer que c'est un objet valide
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }
      } catch (error) {
        console.error("Error updating two-factor authentication:", error);
      }
    }
    console.log("Two-factor authentication updated successfully");
  } catch (e) {
    console.error("Error updating two-factor authentication:", e);
    throw e;
  }
}

async function fetchSetupData() {
  const response = await fetchApi("/users/@me/twofa/setup", {
    method: "GET",
    headers: getHeader(),
  });
  return await response.json();
}

function showTwoFaModal(setupData: {
  qrCodeUrl: string;
  backupCodes: string[];
}) {
  const modal = document.getElementById("twofa-setup-modal");
  const qrImage = document.getElementById("qrcode-image") as HTMLImageElement;
  const backupCodesDiv = document.getElementById("backup-codes");

  if (!modal || !qrImage) {
    console.error("Modal or QR image element not found");
    return;
  }
  qrImage.src = setupData.qrCodeUrl;
  if (backupCodesDiv) {
    backupCodesDiv.innerHTML = setupData.backupCodes
      .map((code) => `<div class="font-mono">${code}</div>`)
      .join("");
  }

  if (modal) {
    modal.classList.remove("hidden");
  }
}

async function handleVerification(): Promise<boolean> {
  return new Promise((resolve) => {
    const verifyButton = document.getElementById("verify-2fa");
    const cancelButton = document.getElementById("cancel-2fa");
    const modal = document.getElementById("twofa-setup-modal");
    const toggle2fa = document.getElementById("toggle-2fa") as HTMLInputElement;

    const resetToggle = () => {
      if (toggle2fa) {
        toggle2fa.checked = false;
      }
    };

    if (verifyButton) {
      verifyButton.addEventListener("click", async () => {
        const code = (
          document.getElementById("verification-code") as HTMLInputElement
        ).value;
        try {
          const response = await fetchApi("/users/@me/twofa/verify", {
            method: "POST",
            headers: {
              ...getHeader(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            if (modal) {
              modal.classList.add("hidden");
            }
            resolve(true);
          } else {
            // Afficher une erreur et réinitialiser le toggle
            alert("Invalid verification code");
            resetToggle();
            resolve(false);
          }
        } catch (error) {
          console.error("Verification failed:", error);
          resetToggle();
          resolve(false);
        }
      });
    }
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        if (modal) {
          modal.classList.add("hidden");
        }
        resetToggle();
        resolve(false);
      });
    }
  });
}

async function enableTwoFa(setupData: any) {
  const response = await fetchApi("/users/@me/twofa", {
    method: "PUT",
    headers: {
      ...getHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      enabled: true,
      secret: setupData.secret,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }
}

export async function check2faEnabled(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fetchApi("/users/@me/twofa", {
      method: "GET",
      headers: getHeader(),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to check 2FA status");
        }
      })
      .then((data) => {
        resolve(data.enabled);
      })
      .catch((error) => {
        console.error("Error checking 2FA status:", error);
        reject(error);
      });
  });
}
