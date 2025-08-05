import { DifficultyScreen } from "./UI/screens/DifficultyScreen.js";
import { UISpinner } from "./UI/components/Spinner.js";
import { IScreen } from "./UI/interfaces/IScreen.js";
import { TournamentScreen } from "./UI/screens/TournamentScreen.js";
import { FontHelper } from "./FontHelper.js";
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
    // supp le bouton de retour
    const backButton = document.getElementById("back-button-container");
    if (backButton) {
      backButton.remove();
    }
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(9, 16, 83, 0.95)";
    overlay.style.zIndex = "2000";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    FontHelper.applyMightySoulyFont(overlay, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
    // Créer le conteneur d'animation
    const animContainer = document.createElement("div");
    animContainer.style.position = "relative";
    animContainer.style.width = "90%";
    animContainer.style.maxWidth = "800px";
    animContainer.style.height = "250px";

    // Créer le titre du tournoi
    const title = document.createElement("div");
    title.textContent = header.toUpperCase();
    title.style.fontFamily = "'Mighty Souly', Arial, sans-serif";
    title.style.fontSize = "36px";
    title.style.color = "#CAFE48";
    title.style.textAlign = "center";
    title.style.marginBottom = "60px";
    title.style.opacity = "0";
    title.style.transform = "translateY(-20px)";
    title.style.transition = "all 0.8s ease-out";

    // Après un court délai, faire apparaître le titre
    setTimeout(() => {
      title.style.opacity = "1";
      title.style.transform = "translateY(0)";
    }, 300);

    // Récupérer le nom du joueur actuel
    const playerName = userName;

    // Joueur 1 (à gauche)
    const player1 = document.createElement("div");
    player1.textContent = playerName;
    player1.style.position = "absolute";
    player1.style.left = "-100%";
    player1.style.top = "50%";
    player1.style.transform = "translateY(-50%)";
    player1.style.color = "#B9D6F2";
    player1.style.fontSize = "48px";
    player1.style.fontFamily = "'Mighty Souly', Arial, sans-serif";
    player1.style.whiteSpace = "nowrap";
    player1.style.transition =
      "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    // Joueur 2 (à droite)
    const player2 = document.createElement("div");
    player2.textContent = opponentName;
    player2.style.position = "absolute";
    player2.style.right = "-100%";
    player2.style.top = "50%";
    player2.style.transform = "translateY(-50%)";
    player2.style.color = "#F44336";
    player2.style.fontSize = "48px";
    player2.style.fontFamily = "'Mighty Souly', Arial, sans-serif";
    player2.style.whiteSpace = "nowrap";
    player2.style.transition =
      "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    // VS au milieu
    const vs = document.createElement("div");
    vs.textContent = "VS";
    vs.style.position = "absolute";
    vs.style.left = "50%";
    vs.style.top = "50%";
    vs.style.transform = "translate(-50%, -50%) scale(0)";
    vs.style.color = "#CAFE48";
    vs.style.fontSize = "72px";
    vs.style.fontFamily = "'Mighty Souly', Arial, sans-serif";
    vs.style.zIndex = "10";
    vs.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    vs.style.textShadow = "0 0 15px rgba(202, 254, 72, 0.8)";

    // Ligne diagonale

    // Ajouter tous les éléments au conteneur d'animation
    animContainer.appendChild(player1);
    animContainer.appendChild(player2);
    animContainer.appendChild(vs);

    overlay.appendChild(title);
    overlay.appendChild(animContainer);
    document.body.appendChild(overlay);

    // Déclencher les animations
    setTimeout(() => {
      player1.style.left = "5%";
    }, 800);

    setTimeout(() => {
      player2.style.right = "5%";
    }, 1000);

    setTimeout(() => {
      vs.style.transform = "translate(-50%, -50%) scale(1.2)";
      setTimeout(() => {
        vs.style.transform = "translate(-50%, -50%) scale(1)";
      }, 200);
    }, 2000);

    // Après l'animation, afficher le jeu
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 500);
    }, 4000);
  }

  // Méthodes de compatibilité pour la transition
  static showLobbyButtons(): void {
    const gameInstance = (window as any).gameInstance;
    if (gameInstance && typeof gameInstance.showCarousel === "function") {
      gameInstance.showCarousel();
    }
    this.hideSpinner();
  }

  static hideLobbyButtons(): void {
    const gameInstance = (window as any).gameInstance;
    if (gameInstance && typeof gameInstance.hideCarousel === "function") {
      gameInstance.hideCarousel();
    }
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

  static showGameCanvas(): void {
    const canvasContainer = document.getElementById("canvas-container");
    const gameCanvas = document.getElementById("gameCanvas");

    // Afficher d'abord le conteneur
    if (canvasContainer) {
      canvasContainer.style.display = "block";
      canvasContainer.style.position = "fixed";
      canvasContainer.style.top = "0";
      canvasContainer.style.left = "0";
      canvasContainer.style.width = "100%";
      canvasContainer.style.height = "100%";
      canvasContainer.style.zIndex = "1000";
      canvasContainer.style.display = "flex";
      canvasContainer.style.alignItems = "center";
      canvasContainer.style.justifyContent = "center";
    }

    // Puis configurer le canvas
    if (gameCanvas) {
      gameCanvas.style.position = "relative"; // Changed to relative since parent is handling positioning
      gameCanvas.style.display = "block";
      gameCanvas.style.maxWidth = "100%";
      gameCanvas.style.maxHeight = "100%";
      gameCanvas.style.aspectRatio = "800/600";

      // Force un reflow pour s'assurer que le canvas est visible
      gameCanvas.style.visibility = "hidden";
      gameCanvas.offsetHeight;
      gameCanvas.style.visibility = "visible";
    }
  }

  static hideGameCanvas(): void {
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.style.display = "none";
    }
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
