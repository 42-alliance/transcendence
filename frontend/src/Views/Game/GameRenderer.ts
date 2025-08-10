import { FontHelper } from "./FontHelper.js";
import { GameUI } from "./GameUI.js";
import { BackButton } from "./UI/components/BackButton.js";
import { title } from "process";

export class GameRenderer {
  private static readonly COLORS = {
    paddle: "#b9d6f2",
    ball: "grey",
    text: "white",
  };

  private static readonly CONSTANTS = {
    cornerRadius: 40,
    paddleRadius: 10,
    netSegmentHeight: 15,
    netRadius: 2,
  };

  private static backgroundCanvas: HTMLCanvasElement | null = null;
  private static backgroundCtx: CanvasRenderingContext2D | null = null;
  private static backgroundImage: HTMLImageElement | null = null;
  private static isBackgroundLoading: boolean = false;

  static {
    // Précharger l'image de fond
    const img = new Image();
    img.src = "assets/game/pong_background.png";
    img.onload = () => {
      this.backgroundImage = img;
      this.isBackgroundLoading = false;
      this.initializeBackgroundCanvas();
    };
    this.isBackgroundLoading = true;
  }

  private static initializeBackgroundCanvas() {
    // Créer le canvas de fond s'il n'existe pas
    if (!this.backgroundCanvas) {
      this.backgroundCanvas = document.createElement("canvas");
      this.backgroundCanvas.id = "gameBackgroundCanvas";
      const gameCanvas = document.getElementById(
        "gameCanvas"
      ) as HTMLCanvasElement;
      if (gameCanvas) {
        this.backgroundCanvas.width = gameCanvas.width;
        this.backgroundCanvas.height = gameCanvas.height;
        // Positionner le canvas de fond juste derrière le canvas principal
        this.backgroundCanvas.style.position = "absolute";
        this.backgroundCanvas.style.zIndex = "1";
        gameCanvas.style.position = "absolute";
        gameCanvas.style.zIndex = "2";
        gameCanvas.style.background = "transparent";
        gameCanvas.parentElement?.insertBefore(
          this.backgroundCanvas,
          gameCanvas
        );
      }
    }

    // Dessiner l'image de fond une seule fois
    this.backgroundCtx = this.backgroundCanvas.getContext("2d");
    if (this.backgroundCtx && this.backgroundImage) {
      this.backgroundCtx.drawImage(
        this.backgroundImage,
        0,
        0,
        this.backgroundCanvas.width,
        this.backgroundCanvas.height
      );
    }
  }

  static renderGame(gameState: any) {
    const { gameCanvas, ctx } = this.initializeCanvas();
    if (!gameCanvas || !ctx || !gameState) return;

    // check if back button is already present
    const existingBackButton = document.getElementById("back-button-container");
    if (!existingBackButton) {
      // Create and append the back button
      const backButton = new BackButton(
        (window as any).gameInstance?.webSocket || null,
        (window as any).user_info || null
      );
      backButton.render();
    }

    const renderData = this.prepareRenderData(gameState);

    this.drawBackground(ctx, gameCanvas);
    this.drawPaddles(ctx, gameCanvas, renderData);
    this.drawBall(ctx, gameCanvas, renderData);
    this.drawScores(ctx, gameCanvas, renderData);
  }

  private static initializeCanvas() {
    const gameCanvas = document.getElementById(
      "gameCanvas"
    ) as HTMLCanvasElement;
    GameUI.hideSpinner();

    // S'assurer que le canvas est visible

    // Initialiser le canvas de fond si ce n'est pas déjà fait
    if (!this.backgroundCanvas && this.backgroundImage) {
      this.initializeBackgroundCanvas();
    }

    const ctx = gameCanvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    }

    return { gameCanvas, ctx };
  }

  private static prepareRenderData(gameState: any) {
    const gameInstance = (window as any).gameInstance;
    const currentUser = this.getCurrentUser(gameInstance);
    const isOnlineMode = ["random_adversaire", "tournament"].includes(
      gameState.mode
    );
    const shouldFlip =
      isOnlineMode &&
      gameState.score &&
      gameState.score.p2_id === currentUser.id;

    return { game: gameState, shouldFlip };
  }

  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    // Simplement effacer le canvas de jeu pour le prochain frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private static drawPaddles(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    { game, shouldFlip }: any
  ) {
    ctx.fillStyle = this.COLORS.paddle;

    if (game.paddle1) {
      this.drawPaddle(ctx, canvas, game.paddle1, shouldFlip);
    }
    if (game.paddle2) {
      this.drawPaddle(ctx, canvas, game.paddle2, shouldFlip);
    }
  }

  private static drawPaddle(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    paddle: any,
    shouldFlip: boolean
  ) {
    const x = shouldFlip ? canvas.width - paddle.x - paddle.width : paddle.x;

    ctx.beginPath();
    this.drawRoundedRect(
      ctx,
      x,
      paddle.y,
      paddle.width,
      paddle.height,
      this.CONSTANTS.paddleRadius
    );
    ctx.fill();
  }

  private static drawBall(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    { game, shouldFlip }: any
  ) {
    if (!game.ball) return;

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = this.COLORS.ball;
    ctx.beginPath();

    const ballX = shouldFlip ? canvas.width - game.ball.x : game.ball.x;
    ctx.arc(ballX, game.ball.y, game.ball.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private static drawScores(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    { game, shouldFlip }: any
  ) {
    if (!game.score) return;

    ctx.fillStyle = this.COLORS.text;
    ctx.font = FontHelper.getScoreFont();
    ctx.textAlign = "center";

    const [leftName, rightName] = shouldFlip
      ? [game.score.p2_name, game.score.p1_name]
      : [game.score.p1_name, game.score.p2_name];

    const [leftScore, rightScore] = shouldFlip
      ? [game.score.p2, game.score.p1]
      : [game.score.p1, game.score.p2];

    // Player names
    ctx.fillText(leftName, canvas.width / 4, 50);
    ctx.fillText(rightName, (3 * canvas.width) / 4, 50);

    // Scores
    ctx.font = `180px ${FontHelper.MIGHTY_SOULY_FONT}`;
    ctx.fillText(leftScore.toString(), canvas.width / 4, 300, 200);
    ctx.fillText(rightScore.toString(), (3 * canvas.width) / 4, 300, 200);
  }

  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  static showGameFinished(data: any) {
    const gameCanvas = document.getElementById(
      "gameCanvas"
    ) as HTMLCanvasElement;
    if (!gameCanvas) return;

    // Supprimer tout résultat précédent
    const BackButton = document.getElementById("back-button-container");
    if (BackButton) BackButton.remove();
    else console.warn("Back button not found, cannot remove it.");
    const existingResult = document.getElementById("game-result");
    if (existingResult) existingResult.remove();

    // Créer le conteneur de résultat
    const resultContainer = this.createResultContainer();

    // Obtenir les informations de l'utilisateur
    const gameInstance = (window as any).gameInstance;
    const currentUser = this.getCurrentUser(gameInstance);
    const userId = String(currentUser.id);

    console.log("Current user ID:", userId);
    console.log("Winner user ID:", data.winner);
    console.log("Game mode:", data.mode);

    // Afficher le résultat approprié
    if (data.mode === "local" || data.mode === "ia") {
      this.handleLocalOrAIMode(resultContainer, data);
    } else {
      this.handleOnlineMode(resultContainer, data, userId);
    }

    // Positionner le conteneur au centre du canvas
    this.positionResultContainer(resultContainer, gameCanvas);

    // Ajouter au DOM
    document.body.appendChild(resultContainer);
  }

  private static createResultContainer(): HTMLDivElement {
    const resultContainer = document.createElement("div");
    resultContainer.id = "game-result";

    Object.assign(resultContainer.style, {
      position: "fixed",
      width: "300px",
      padding: "30px",
      borderRadius: "15px",
      textAlign: "center",
      color: "white",
      zIndex: "1000",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(9, 16, 83, 0.9)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(5px)",
      fontFamily: FontHelper.MIGHTY_SOULY_FONT,
      transition: "all 0.3s ease",
    });

    return resultContainer;
  }

  private static positionResultContainer(
    container: HTMLDivElement,
    canvas: HTMLCanvasElement
  ): void {
    // Position absolue au centre de l'écran
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";

    // S'assurer que le conteneur reste centré lors du redimensionnement
    window.addEventListener("resize", () => {
      const updatedCanvasRect = canvas.getBoundingClientRect();
      const newLeft =
        updatedCanvasRect.left +
        updatedCanvasRect.width / 2 -
        parseInt(container.style.width) / 2;
      // Décale le centre un peu plus haut (par exemple, 60px plus haut)
      const newTop =
        updatedCanvasRect.top +
        updatedCanvasRect.height / 2 -
        container.clientHeight / 2 -
        60;

      container.style.left = `${newLeft}px`;
      container.style.top = `${newTop}px`;
    });
  }

  private static getCurrentUser(gameInstance: any): any {
    if (gameInstance && typeof gameInstance.getUser === "function") {
      return gameInstance.getUser();
    } else {
      console.warn("Game instance not found, using default user");
      return { id: "player1", name: "Player 1" };
    }
  }

  private static handleLocalOrAIMode(
    resultContainer: HTMLDivElement,
    data: any
  ): void {
    const title = document.createElement("h2");
    title.textContent = `${data.winner_name} wins!`;
    title.style.color = "#4CAF50";
    title.style.marginBottom = "60px";
    FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE);
    resultContainer.appendChild(title);

    const button = GameRenderer.createReturnToLobbyButton(resultContainer);
    resultContainer.appendChild(button);
  }

  private static handleOnlineMode(
    resultContainer: HTMLDivElement,
    data: any,
    userId: string
  ): void {
    const isWinner = data.winner.toString() === userId.toString();

    const title = document.createElement("h2");
    title.textContent = isWinner ? "Vous avez gagné !" : "Vous avez perdu !";
    title.style.color = isWinner ? "#4CAF50" : "#F44336";
    FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE);
    resultContainer.appendChild(title);

    const message = document.createElement("p");
    if (data.disconnection) {
      message.textContent = `Votre adversaire (${data.disconnected_player}) s'est déconnecté !`;
      message.style.color = "#FFC107";
    } else {
      message.textContent = `Score final: ${data.score.p1} - ${data.score.p2}`;
      if (data.winner_name) {
        message.textContent += ` | Gagnant: ${data.winner_name}`;
      }
    }
    FontHelper.applyMightySoulyFont(message, FontHelper.TEXT_FONT_SIZE);
    resultContainer.appendChild(message);

    const button = GameRenderer.createReturnToLobbyButton(resultContainer);
    resultContainer.appendChild(button);
  }

  private static createReturnToLobbyButton(
    resultContainer: HTMLDivElement
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = "Retourner au lobby";
    button.style.width = "100%";
    button.style.padding = "20px";

    button.style.backgroundColor = "#B9D6F2";
    button.style.color = "#091053";
    button.style.cursor = "pointer";
    FontHelper.applyMightySoulyFont(button, FontHelper.BUTTON_FONT_SIZE);
    button.onclick = () => {
      const gameCanvas = document.getElementById(
        "gameCanvas"
      ) as HTMLCanvasElement;
      if (gameCanvas) {
        const gameContext = gameCanvas.getContext("2d");
        if (gameContext) {
          gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        }
      }
      gameCanvas.style.display = "none";
      resultContainer.remove();
      GameUI.showLobbyButtons();
    };
    return button;
  }
}
