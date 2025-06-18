import { WebSocketState } from './WebSocketState.js';
import { GameUI } from './GameUI.js';
import { GameControls } from './GameControls.js';
import { GameState } from './GameState.js';
import { GameRenderer } from './GameRenderer.js';
import { AnimationController } from './AnimationController.js';

export class GameMessageHandler {
    private state: WebSocketState;
    private animationController: AnimationController;

    constructor(state: WebSocketState) {
        this.state = state;
        this.animationController = new AnimationController(state);
    }

    handleGameMessage(message: any): void {
        switch (message.type) {
            case 'auth_success':
                // Authentication successful
                break;
                
            case 'auth_failed':
                this.disconnect();
                break;
                
            case 'waiting':
                GameUI.displayWaiting();
                break;
                
            case 'start':
                this.handleGameStart(message);
                break;
                
            case 'game_state':
                this.state.setGameState(message.data);
                break;
                
            case 'game_finished':
                console.log("Game finished:", message.data);
                this.handleGameFinished(message);
                break;
            case 'start_animation':
                console.log("Starting animation:", message.data);
                GameUI.showAnimationMatch(message.player, message.opponent, message.mode);
                break;
            default:
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
        
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        GameState.initializeGame(gameCanvas);
        
        // Show the game canvas
        GameUI.showGameCanvas();
        
        this.animationController.startAnimation();
        
        GameUI.hideGameButtons();
        GameUI.hideSpinner();
    }
    
    private handleGameFinished(message: any): void {
        this.state.setRunningState(false);
        this.animationController.stopAnimation();
        
        // Ensure game-mode-grid stays hidden
        const gameModeGrid = document.querySelector('.game-mode-grid');
        if (gameModeGrid) {
            (gameModeGrid as HTMLElement).style.display = 'none';
        }
        
        GameRenderer.showGameFinished(message.data);
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