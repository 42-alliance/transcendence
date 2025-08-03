// État 2FA global
function getStoredPendingState(): boolean {
  return localStorage.getItem("2fa_pending") === "true";
}

export function setPending2FA(isPending: boolean): void {
  localStorage.setItem("2fa_pending", isPending.toString());
}

export function isPending2FAVerification(): boolean {
  return getStoredPendingState();
}

// Routes protégées qui nécessitent une vérification 2FA complète
export const PROTECTED_ROUTES = ["/", "/game", "/chat", "/friends", "/me"];

export function isProtectedRoute(path: string): boolean {
  // Vérifie si le chemin correspond à une route protégée
  // Gestion spéciale pour /chat/:conversationId
  if (path.startsWith("/chat/")) return true;
  return PROTECTED_ROUTES.includes(path);
}

// Fonction pour vérifier l'état initial du 2FA au chargement
export async function checkInitial2FAState(): Promise<void> {
  // Si déjà en attente, ne rien faire
  if (getStoredPendingState()) return;

  try {
    const response = await fetch("/api/users/@me/twofa", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (response.ok) {
      const { enabled } = await response.json();
      if (enabled) {
        setPending2FA(true);
      }
    }
  } catch (error) {
    console.error("Error checking initial 2FA state:", error);
  }
}
