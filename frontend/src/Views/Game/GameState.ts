export class GameState {
  static initializeGame(gameCanvas: HTMLCanvasElement) {
    console.log("Initializing game...");
    if (!gameCanvas) {
      console.error("Game canvas not found");
      return;
    }

    // Configure le canvas pour le jeu
    gameCanvas.width = 800; // Définit une largeur fixe
    gameCanvas.height = 600; // Définit une hauteur fixe

    // Style du conteneur du canvas
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.style.position = "fixed";
      canvasContainer.style.top = "0";
      canvasContainer.style.left = "0";
      canvasContainer.style.width = "100vw";
      canvasContainer.style.height = "100vh";
      canvasContainer.style.display = "flex";
      canvasContainer.style.justifyContent = "center";
      canvasContainer.style.alignItems = "center";
      canvasContainer.style.zIndex = "1000";
    }

    // Style du canvas
    gameCanvas.style.position = "relative";
    gameCanvas.style.display = "block";
    gameCanvas.style.maxWidth = "90vw";
    gameCanvas.style.maxHeight = "90vh";
    gameCanvas.style.width = "900px";
    gameCanvas.style.height = "600px";
    gameCanvas.style.border = "2px solid #B9D6F2";

    // Initialisation du contexte
    const ctx = gameCanvas.getContext("2d");
    if (ctx) {
      const paddle_1 = {
        x: 10,
        y: 10,
        width: 10,
        height: 100,
        color: "white",
        dy: 0,
      };

      const paddle_2 = {
        x: 10,
        y: 10,
        width: 10,
        height: 100,
        color: "white",
        dy: 0,
      };

      const ball = {
        x: 10,
        y: 10,
        dx: 4,
        dy: 4,
        size: 5,
        color: "white",
      };

      const user = {
        x: 10,
        y: gameCanvas.height / 2 - 50,
        width: 10,
        height: 100,
        color: "white",
        score: 0,
      };

      const com = {
        x: gameCanvas.width - 20,
        y: gameCanvas.height / 2 - 50,
        width: 10,
        height: 100,
        color: "white",
        score: 0,
      };

      const game = {
        gameCanvas,
        ctx: gameCanvas.getContext("2d"),
        paddle_1,
        paddle_2,
        ball,
        user,
        com,
      };

      // Draw initial state
      if (game.ctx) {
        // Draw the net

        // Draw the user paddle
        game.ctx.fillStyle = game.user.color;
        game.ctx.fillRect(
          game.user.x,
          game.user.y,
          game.user.width,
          game.user.height
        );

        // Draw the computer paddle
        game.ctx.fillStyle = game.com.color;
        game.ctx.fillRect(
          game.com.x,
          game.com.y,
          game.com.width,
          game.com.height
        );

        // Draw the ball
        game.ctx.fillStyle = game.ball.color;
        game.ctx.beginPath();
        game.ctx.arc(game.ball.x, game.ball.y, game.ball.size, 0, Math.PI * 2);
        game.ctx.closePath();
        game.ctx.fill();
      }
      console.log("Game initialized successfully");
      return game;
    }
  }
}
