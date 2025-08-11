import { WebSocketState } from "./WebSocketState.js";
import { GameUI } from "./GameUI.js";
import { GameControls } from "./GameControls.js";
import { GameState } from "./GameState.js";
import { GameRenderer } from "./GameRenderer.js";
import { AnimationController } from "./AnimationController.js";
import { webSockets } from "../viewManager.js";
import { GameWebSocket } from "./GameWebSocket.js";
import { userInfo } from "os";

export class GameMessageHandler {
  private state: WebSocketState;
  private animationController: AnimationController;

  constructor(state: WebSocketState) {
    this.state = state;
    this.animationController = new AnimationController(state);
  }

  handleGameMessage(message: any): void {
    switch (message.type) {
      case "auth_success":
        // Authentication successful
        break;

      case "auth_failed":
        this.disconnect();
        break;

      case "waiting":
        // carousel hide

        GameUI.displayWaiting();
        break;

      case "start":
        console.log("Game start message received:", message);
        GameUI.hideSpinner();
        const existingCanvas = document.getElementById("gameCanvas");
        if (existingCanvas) {
          existingCanvas.remove();
        }
        GameUI.showScreen("game");
        // Active l'état running et configure les contrôles si pas déjà faits
        if (!this.state.getRunningState()) {
          // Met à jour les UUID depuis le message start (si fournis)
          if (message.uuid_room) this.state.setRoomUUID(message.uuid_room);
          if (message.global_uuid) this.state.setGlobalUUID(message.global_uuid);
          this.state.setRunningState(true);
          try {
            GameControls.setupKeyboardControls(
              this.state.getSocket(),
              this.state.getRunningState(),
              this.state.getUserInfo(),
              this.state.getRoomUUID(),
              this.state.getGlobalUUID()
            );
            console.log("[GameControls] Keyboard listeners attached on start");
          } catch (err) {
            console.error("Failed to setup keyboard controls", err);
          }
        }
        break;

      case "game_state":
        // Dispatch direct du state brut pour GameScreen
        // console.log("game state format:", message.data);
        if (message.data && message.data.paddle1 && message.data.paddle2) {
          const evt = new CustomEvent("game_state_update", {
            detail: message.data,
          });
          document.dispatchEvent(evt);
        }
        break;

      case "game_finished":
        console.log("Game finished:", message.data);
        this.handleGameFinished(message);
        break;
      case "start_animation":
        console.log("Starting animation:", message.data);
        GameUI.showAnimationMatch(
          message.player,
          message.opponent,
          message.mode
        );
        break;
      case "create_game_response":
        webSockets.chat?.send(
          JSON.stringify({
            type: "invitation_game",
            userId: message.userId,
            conversationId: message.conversationId,
            content: message.uuid,
          })
        );

        setTimeout(() => {
          GameUI.displayWaiting();
          GameUI.displayBackButton(
            (window as any).gameWsClass,
            (window as any).user_info
          );
        }, 500);
        break;
      case "error_to_join":
        console.error("Error to join game:", message.data);
        GameUI.displayErrorToJoin(message.data);
        setTimeout(() => {
          GameUI.hideErrorToJoin();
          GameUI.hideSpinner();
          GameUI.showLobbyButtons();
        }, 5000);
        break;
      default:
        console.warn("Unknown game message type:", message.type);
        console.warn("Message content:", message);
        // Unknown game message type, let the parent handler decide
        return;
    }
  }

  private handleGameStart(message: any): void {
    this.state.setRoomUUID(message.uuid_room);
    this.state.setRunningState(true);

    GameControls.setupKeyboardControls(
      this.state.getSocket(),
      this.state.getRunningState(),
      this.state.getUserInfo(),
      this.state.getRoomUUID(),
      message.global_uuid
    );

    if (message.global_uuid) {
      this.state.setGlobalUUID(message.global_uuid);
    }

    const gameCanvas = document.getElementById(
      "gameCanvas"
    ) as HTMLCanvasElement;
    GameState.initializeGame(gameCanvas);

    // Show the game canvas

    this.animationController.startAnimation();

    console.log("handleGameStart");

    GameUI.hideLobbyButtons();
    GameUI.hideSpinner();
  }

  private handleGameFinished(message: any): void {
    this.animationController.stopAnimation();
    this.state.setRunningState(false);
    console.log("Handling game finished message:", message);
    // Utiliser l'import direct GameUI
    const gameScreen = GameUI.getScreen("game");
    console.log("[DEBUG] GameUI.getScreen('game'):", gameScreen);
    if (gameScreen && typeof (gameScreen as any).showGameFinished === "function") {
      console.log("Showing game finished screen with data:", message.data);
      (gameScreen as any).showGameFinished(message.data);
    } else {
      console.error("GameScreen not found ou showGameFinished manquant", gameScreen);
    }
  }

  disconnect(): void {
    this.state.setRunningState(false);
    this.animationController.stopAnimation();

    const socket = this.state.getSocket();
    if (socket) {
      socket.close();
      this.state.setSocket(null);
    }
  }
}
