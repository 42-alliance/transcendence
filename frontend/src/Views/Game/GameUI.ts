import { DifficultyScreen } from "./UI/screens/DifficultyScreen.js";
import { UISpinner } from "./UI/components/Spinner.js";
import { IScreen } from "./UI/interfaces/IScreen.js";
import { TournamentScreen } from "./UI/screens/TournamentScreen.js";
import { GameScreen } from "./UI/screens/GameScreen.js";
import { BackButton } from "./UI/components/BackButton.js";
import { GameWebSocket } from "./GameWebSocket.js";

export class GameUI {
  private static spinner = new UISpinner();
  private static screens: Map<string, IScreen> = new Map();
  private static activeScreen: string | null = null;
  private static backButton: BackButton | null = null;

  static initialize(): void {
    // Initialize screens
    this.screens.set("difficulty", new DifficultyScreen());
    this.screens.set("tournament", new TournamentScreen());
    this.screens.set("game", new GameScreen());
  }

  static displaySpinner(message = "Waiting..."): void {
    // FontHelper.applyMightySoulyFont(document.body, "80px");

    this.spinner.show(message);
  }

  static hideSpinner(): void {
    this.spinner.hide();
  }

  static displayErrorMessage(message: string) {
    const errorContainer = document.createElement("div");
    errorContainer.id = "error-container";
    errorContainer.style.position = "fixed";
    errorContainer.style.top = "50%";
    errorContainer.style.left = "50%";
    errorContainer.style.transform = "translate(-50%, -50%)";
    errorContainer.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
    errorContainer.style.color = "white";
    errorContainer.style.padding = "1rem";
    errorContainer.style.borderRadius = "8px";
    errorContainer.style.zIndex = "9999";

    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);

    this.hideSpinner();

    setTimeout(() => {
      errorContainer.remove();
    }, 3000);
  }

  static displayWaiting(): void {
    this.hideLobbyButtons();
    this.displaySpinner();
  }

  static displayBackButton(
    webSocket: GameWebSocket | null,
    userInfo: any
  ): void {
    console.log("Displaying back button", webSocket, userInfo);

    try {
      // Supprimer l'ancien bouton s'il existe
      if (this.backButton) {
        this.backButton.remove();
        this.backButton = null;
      }

      // Vérifier si le container existe déjà et le supprimer
      const existingContainer = document.getElementById(
        "back-button-container"
      );
      if (existingContainer) {
        existingContainer.remove();
      }

      // Créer et afficher le nouveau bouton
      this.backButton = new BackButton(webSocket, userInfo);

      // Appeler directement render pour s'assurer que le bouton est ajouté au DOM
      document.body.appendChild(this.backButton.container);

      console.log("Back button added to DOM");
    } catch (error) {
      console.error("Error displaying back button:", error);
    }
  }

  static showScreen(screenName: string): Promise<string> {
    console.log(`Attempting to show screen: ${screenName}`);
    const screen = this.screens.get(screenName);
    if (!screen) {
      console.error(`Screen ${screenName} not found`);
      return Promise.reject(`Screen ${screenName} not found`);
    }

    // Hide current screen if any
    if (this.activeScreen && this.screens.has(this.activeScreen)) {
      console.log(`Hiding current active screen: ${this.activeScreen}`);
      this.screens.get(this.activeScreen)?.hide();
    }

    console.log(`Setting new active screen to: ${screenName}`);
    this.activeScreen = screenName;
    return screen.show();
  }

  // Ajouter cette méthode à GameUI
  static clearGameResults(): void {
    // Supprimer tous les résultats de jeu existants
    const existingResultModal = document.getElementById("game-result");
    if (existingResultModal) {
      existingResultModal.remove();
    }

    // Réinitialiser le canvas de jeu
    const gameCanvas = document.getElementById(
      "gameCanvas"
    ) as HTMLCanvasElement;
    if (gameCanvas) {
      const ctx = gameCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      }
      gameCanvas.style.display = "block"; // S'assurer que le canvas est visible
    }

    // Supprimer aussi les notifications qui pourraient rester
    const notifications = document.querySelectorAll(".tournament-notification");
    notifications.forEach((notification) => notification.remove());
  }
  // Maintient la compatibilité avec l'API existante
  static displayDifficultyButtons(): Promise<string> {
    console.log("Trying to display difficulty buttons");
    const screen = this.screens.get("difficulty");
    if (!screen) {
      console.error("Difficulty screen not found in screens Map");
      return Promise.reject("Difficulty screen not found");
    }
    console.log("Found difficulty screen, showing it");
    return this.showScreen("difficulty");
  }

  static hideDifficultyButtons(): void {
    this.hideScreen("difficulty");
  }
  static hideAll(): void {
    this.screens.forEach((screen) => screen.hide());
    this.hideSpinner();
    this.activeScreen = null;
  }

  static clearScreens(): void {
    this.hideAll();
    this.screens.forEach((_, name) => this.screens.delete(name));
    this.initialize();
  }

  static getScreen(screenName: string): IScreen | undefined {
    return this.screens.get(screenName);
  }

  static hasScreen(screenName: string): boolean {
    return this.screens.has(screenName);
  }

  static showAnimationMatch(
    userName: string,
    opponentName: string,
    header: string
  ): void {
    // Remove back button if present
    const backButton = document.getElementById("back-button-container");
    if (backButton) backButton.remove();

    // Inject styles once for keyframes and reusable classes
    if (!document.getElementById("match-intro-styles")) {
      const style = document.createElement("style");
      style.id = "match-intro-styles";
      style.textContent = `
        @keyframes auraPulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, .45), 0 0 24px 6px rgba(245, 158, 11, .25); }
          50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0), 0 0 36px 10px rgba(245, 158, 11, .35); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, .45), 0 0 24px 6px rgba(245, 158, 11, .25); }
        }
        @keyframes auraPulseBlue {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, .45), 0 0 24px 6px rgba(59, 130, 246, .25); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0), 0 0 36px 10px rgba(59, 130, 246, .35); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, .45), 0 0 24px 6px rgba(59, 130, 246, .25); }
        }
        @keyframes floatSpark {
          0% { transform: translateY(0) scale(1); opacity: .9; }
          50% { transform: translateY(-8px) scale(1.05); opacity: .6; }
          100% { transform: translateY(0) scale(1); opacity: .9; }
        }
        @keyframes popIn {
          0% { transform: translateY(10px) scale(.92); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes vsFlash {
          0% { transform: translate(-50%, -50%) scale(0); filter: drop-shadow(0 0 0 rgba(250, 204, 21, 0)); }
          60% { transform: translate(-50%, -50%) scale(1.2); filter: drop-shadow(0 0 24px rgba(250, 204, 21, .85)); }
          100% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 12px rgba(250, 204, 21, .65)); }
        }
      `;
      document.head.appendChild(style);
    }

    // Overlay
    const overlay = document.createElement("div");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "3000";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.gap = "28px";
    overlay.style.fontFamily = "Poppins, sans-serif";
    overlay.style.transition = "opacity .4s ease";
    overlay.style.background = "radial-gradient(1200px 600px at 50% 60%, rgba(17,24,39,.85) 0%, rgba(0,0,0,.95) 70%), linear-gradient(135deg, rgba(30,58,138,.35), rgba(180,83,9,.35))";
    overlay.style.backdropFilter = "blur(2px)";

    // Subtle background sparks
    const sparksContainer = document.createElement("div");
    sparksContainer.style.position = "absolute";
    sparksContainer.style.inset = "0";
    sparksContainer.style.overflow = "hidden";
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.style.position = "absolute";
      s.style.width = s.style.height = `${Math.random() * 3 + 2}px`;
      s.style.borderRadius = "9999px";
      s.style.background = Math.random() > 0.5 ? "rgba(250, 204, 21, .9)" : "rgba(59, 130, 246, .9)";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.opacity = `${0.12 + Math.random() * 0.25}`;
      s.style.filter = "blur(.5px)";
      s.style.animation = `floatSpark ${2 + Math.random() * 2}s ease-in-out ${Math.random()}s infinite`;
      sparksContainer.appendChild(s);
    }

    // Title / header
    const title = document.createElement("div");
    title.textContent = (header || "MATCH").toUpperCase();
    title.style.fontWeight = "600";
    title.style.letterSpacing = ".12em";
    title.style.fontSize = "clamp(18px, 3vw, 28px)";
    title.style.color = "#fde68a"; // amber-200
    title.style.textShadow = "0 0 10px rgba(251, 191, 36, .45), 0 0 20px rgba(245, 158, 11, .25)";
    title.style.opacity = "0";
    title.style.transform = "translateY(-10px)";
    title.style.transition = "opacity .6s ease, transform .6s ease";

    // Animation container
    const animContainer = document.createElement("div");
    animContainer.style.position = "relative";
    animContainer.style.width = "min(900px, 90%)";
    animContainer.style.height = "280px";

    // Player left (orange aura)
    const left = document.createElement("div");
    left.textContent = userName;
    left.style.position = "absolute";
    left.style.left = "-100%";
    left.style.top = "50%";
    left.style.transform = "translateY(-50%)";
    left.style.padding = "18px 28px";
    left.style.borderRadius = "16px";
    left.style.background = "rgba(17, 24, 39, .55)"; // slate-900/55
    left.style.border = "1px solid rgba(251, 191, 36, .35)";
    left.style.color = "#ffedd5"; // warm light text
    left.style.fontSize = "clamp(24px, 4vw, 40px)";
    left.style.fontWeight = "700";
    left.style.whiteSpace = "nowrap";
    left.style.backdropFilter = "blur(4px)";
    left.style.textShadow = "0 0 10px rgba(245, 158, 11, .35)";
    left.style.transition = "left .8s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter .4s ease";

    // Add aura wrapper for left
    const leftAura = document.createElement("div");
    leftAura.style.position = "absolute";
    leftAura.style.left = "-100%";
    leftAura.style.top = "50%";
    leftAura.style.transform = "translateY(-50%)";
    leftAura.style.borderRadius = "20px";
    leftAura.style.animation = "auraPulse 1.6s ease-in-out infinite";
    leftAura.style.pointerEvents = "none";

    // Player right (blue aura)
    const right = document.createElement("div");
    right.textContent = opponentName;
    right.style.position = "absolute";
    right.style.right = "-100%";
    right.style.top = "50%";
    right.style.transform = "translateY(-50%)";
    right.style.padding = "18px 28px";
    right.style.borderRadius = "16px";
    right.style.background = "rgba(17, 24, 39, .55)";
    right.style.border = "1px solid rgba(59, 130, 246, .35)";
    right.style.color = "#dbeafe";
    right.style.fontSize = "clamp(24px, 4vw, 40px)";
    right.style.fontWeight = "700";
    right.style.whiteSpace = "nowrap";
    right.style.backdropFilter = "blur(4px)";
    right.style.textShadow = "0 0 10px rgba(59, 130, 246, .35)";
    right.style.transition = "right .8s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter .4s ease";

    const rightAura = document.createElement("div");
    rightAura.style.position = "absolute";
    rightAura.style.right = "-100%";
    rightAura.style.top = "50%";
    rightAura.style.transform = "translateY(-50%)";
    rightAura.style.borderRadius = "20px";
    rightAura.style.animation = "auraPulseBlue 1.6s ease-in-out infinite";
    rightAura.style.pointerEvents = "none";

    // VS badge (center)
    const vs = document.createElement("div");
    vs.textContent = "VS";
    vs.style.position = "absolute";
    vs.style.left = "50%";
    vs.style.top = "50%";
    vs.style.transform = "translate(-50%, -50%) scale(0)";
    vs.style.width = vs.style.height = "110px";
    vs.style.borderRadius = "9999px";
    vs.style.display = "flex";
    vs.style.alignItems = "center";
    vs.style.justifyContent = "center";
    vs.style.fontWeight = "800";
    vs.style.letterSpacing = ".08em";
    vs.style.fontSize = "clamp(28px, 6vw, 40px)";
    vs.style.color = "#0f0f0f";
    vs.style.background = "radial-gradient(closest-side, #fde047 0%, #f59e0b 60%, rgba(234, 88, 12, .9) 100%)";
    vs.style.border = "2px solid rgba(250, 204, 21, .8)";
    vs.style.boxShadow = "0 0 20px rgba(250, 204, 21, .5), 0 0 40px rgba(245, 158, 11, .35)";

    // Mount elements
    overlay.appendChild(sparksContainer);
    overlay.appendChild(title);

    // Add auras before labels to sit behind (size synced later)
    animContainer.appendChild(leftAura);
    animContainer.appendChild(rightAura);
    animContainer.appendChild(left);
    animContainer.appendChild(right);
    animContainer.appendChild(vs);
    overlay.appendChild(animContainer);
    document.body.appendChild(overlay);

    // Appear title
    requestAnimationFrame(() => {
      title.style.opacity = "1";
      title.style.transform = "translateY(0)";
    });

    // Trigger slide-in for players
    setTimeout(() => {
      left.style.left = "7%";
      leftAura.style.left = "6.5%"; // slightly offset aura
      // sync aura size to label
      const rect = left.getBoundingClientRect();
      leftAura.style.width = rect.width + 12 + "px";
      leftAura.style.height = rect.height + 12 + "px";
    }, 500);

    setTimeout(() => {
      right.style.right = "7%";
      rightAura.style.right = "6.5%";
      const rect = right.getBoundingClientRect();
      rightAura.style.width = rect.width + 12 + "px";
      rightAura.style.height = rect.height + 12 + "px";
    }, 700);

    // VS flash
    setTimeout(() => {
      vs.style.animation = "vsFlash .7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
    }, 1400);

    // Fade out and cleanup
    const totalDuration = 3600; // ms
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 420);
    }, totalDuration);
  }

  // Méthodes de compatibilité pour la transition
  static showLobbyButtons(): void {
    const gameInstance = (window as any).gameInstance;
    if (gameInstance && typeof gameInstance.showCarousel === "function") {
      console.log("[GameUI] showLobbyButtons: calling showCarousel");
      gameInstance.showCarousel();
    }
    else {
      console.warn("Game instance or showCarousel method not found", gameInstance);
    }
    this.hideSpinner();

    // Re-show header/nav
    try {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.classList.remove('hidden');
      }
    } catch {}
  }

  static hideLobbyButtons(): void {
    const gameInstance = (window as any).gameInstance;
    if (gameInstance && typeof gameInstance.hideCarousel === "function") {
      gameInstance.hideCarousel();
    }

    // Hide header/nav during gameplay screens
    try {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.classList.add('hidden');
      }
    } catch {}
  }

  static displayErrorToJoin(message: string): void {
    this.displayErrorMessage(message);
  }

  static hideErrorToJoin(): void {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
      errorContainer.remove();
    }
  }

  static hideGameArea(): void {
    // Cette méthode ne devrait plus être utilisée pendant le jeu actif
    console.warn(
      "hideGameArea called - this should only happen when cleaning up the game"
    );
  }

  static hideScreen(screenName: string): void {
    console.log(`Trying to hide screen: ${screenName}`);
    const screen = this.screens.get(screenName);
    if (screen) {
      screen.hide();
      if (this.activeScreen === screenName) {
        this.activeScreen = null;
      }
    }
  }
}

// Initialize screens
GameUI.initialize();
