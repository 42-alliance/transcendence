import { fetchApi, getHeader } from "../../fetchApi.js";

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

// Routes publiques qui ne nécessitent pas de 2FA
export const PUBLIC_ROUTES = ["/auth", "/auth-success"];

function normalizePath(path: string): string {
  // Supprimer les slashes multiples consécutifs et normaliser le chemin
  // Convertir en minuscules pour ignorer la casse
  return "/" + path.split("/").filter(Boolean).join("/").toLowerCase();
}

export function isProtectedRoute(path: string): boolean {
  // Si pas de chemin, considérer comme protégé
  if (!path) return true;

  // Normaliser le chemin d'entrée (gère la casse et les slashes)
  const normalizedPath = normalizePath(path);

  // Si c'est une route publique, ne pas protéger
  if (PUBLIC_ROUTES.some((route) => normalizedPath === normalizePath(route))) {
    return false;
  }

  // Par défaut, toutes les autres routes sont protégées
  return true;
}

// Fonction pour vérifier l'état initial du 2FA au chargement
export async function checkInitial2FAState(): Promise<void> {
  // Si déjà en attente, ne rien faire
  if (getStoredPendingState()) return;

  try {
	const header = getHeader();
    const response = await fetchApi("/users/@me/twofa", {
		method: "GET",
	    headers: header,
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
