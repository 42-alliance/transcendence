import { GameUI } from "./GameUI.js";
import { GameRenderer } from "./GameRenderer.js";
import { GameControls } from "./GameControls.js";
import { GameState } from "./GameState.js";

export class GameWebSocket {
    private socket: WebSocket | null = null;
    private isRunning: boolean = false;
    private frameId: number | null = null;
    private user_info: any;
    private gameState: any = null;
    private lastRender: number = 0;
    private frameInterval: number = 1000 / 120; // Milliseconds per frame
    private uuid_room: string = '';
    private global_uuid: string = '';
    
    constructor(user_info: any) {
        this.user_info = user_info;
    }
    
    initializeWebSocket() {
        try {
            this.socket = new WebSocket('ws://localhost:8790');

            this.socket.onopen = () => {
                console.log("WebSocket connection established");
                // Set up keyboard controls after connection
                GameControls.setupKeyboardControls(
                    this.socket,
                    this.isRunning,
                    this.user_info,
                    this.uuid_room,
                    this.global_uuid
                );
                
                // Send authentication
                this.socket?.send(JSON.stringify({
                    type: 'auth',
                    token: localStorage.getItem('access_token')
                }));
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                this.disconnect();
            };
            
            this.socket.onclose = () => {
                console.log("WebSocket connection closed");
                this.isRunning = false;
                if (this.frameId) {
                    cancelAnimationFrame(this.frameId);
                    this.frameId = null;
                }
            };
        } catch (error) {
            console.error('WebSocket initialization failed:', error);
        }
    }
    
    private handleMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'auth_success':
                    console.log("Authentication succeeded, game ready.");
                    break;
                case 'auth_failed':
                    console.error("Authentication failed, disconnecting...");
                    this.disconnect();
                    break;
                case 'waiting':
                    console.log("Waiting for an opponent...");
                    GameUI.displayWaiting();
                    break;
                case 'start':
                    console.log("Game started:", message.uuid_room);
                    this.uuid_room = message.uuid_room;
                    if (message.global_uuid) {
                        this.global_uuid = message.global_uuid;
                    }
                    console.log("Game started with uuid_room:", this.uuid_room);
                    
                    const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
                    // Version corrigée: utiliser directement le résultat sans then()
                    const game = GameState.initializeGame(gameCanvas);
                    console.log("Game initialized:", game);
                    this.isRunning = true;
                    this.lastRender = performance.now();
                    this.animate();
                    
                    GameUI.hideGameButtons();
                    GameUI.hideSpinner();
                    break;
                case 'game_state':
                    this.updateGameState(message.data);
                    break;
                case 'game_finished':
                    console.log("Game finished:", message.data);
                    this.isRunning = false;
                    if (this.frameId) {
                        cancelAnimationFrame(this.frameId);
                        this.frameId = null;
                    }
                    GameRenderer.showGameFinished(message.data);
                    break;
                   
                default:
                    console.warn("Unknown message type:", message.type);
                    break;
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    }
    
    private updateGameState(state: any) {
        if (!state) return;
        this.gameState = state;
    }

    private animate = (timestamp: number = 0) => {
        if (!this.isRunning) return;
        const elapsed = timestamp - this.lastRender;
        if (elapsed > this.frameInterval) {
            this.lastRender = timestamp - (elapsed % this.frameInterval);
            GameRenderer.renderGame(this.gameState);
        }
        this.frameId = requestAnimationFrame(this.animate);
    }
    
    disconnect() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
    
    sendMessage(type: string, data?: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: type,
                ...data
            }));
        }
    }
}