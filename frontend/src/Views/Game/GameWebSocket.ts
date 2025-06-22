import { GameUI } from "./GameUI.js";
import { GameControls } from "./GameControls.js";
import { WebSocketState } from "./WebSocketState.js";
import { GameMessageHandler } from "./GameMessageHandler.js";
import { TournamentMessageHandler } from "./TournamentMessageHandler.js";
import { MessageSender } from "./MessageSender.js";
import { gameWsClass, setGameWsClass, webSockets } from "../viewManager.js";

export function setupGameWebSocket() {
	webSockets.game = new WebSocket('ws://localhost:8000/gamews');
}

export class GameWebSocket {
    private state: WebSocketState;
    private gameMessageHandler: GameMessageHandler;
    private tournamentMessageHandler: TournamentMessageHandler;
    private messageSender: MessageSender;
    
    constructor(user_info: any) {
        this.state = new WebSocketState(user_info);
        this.gameMessageHandler = new GameMessageHandler(this.state);
        this.tournamentMessageHandler = new TournamentMessageHandler();
        this.messageSender = new MessageSender(this.state);
        
        setGameWsClass(this); // Store the instance globally for access in other parts of the app
        this.state.setSocket(webSockets.game);
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        document.addEventListener('websocket_request', (event: Event) => {
            const customEvent = event as CustomEvent;
            if (this.state.isSocketOpen()) {
                console.log("Sending WebSocket request:", customEvent.detail);
                
                // Use UUID from the event if it exists
                const uuid_room = customEvent.detail.uuid_room || this.state.getRoomUUID();
                
                this.messageSender.sendMessage(customEvent.detail.type, {
                    ...customEvent.detail,
                    uuid_room: uuid_room
                });
            } else {
                console.error("WebSocket not ready");
            }
        });
    }
    
    initializeWebSocket(): void {
        try {
            const socket = webSockets.game!; // 👈 via gateway

            this.state.setSocket(socket);

            socket.onopen = () => {
                console.log("WebSocket connection established");
                // Setup keyboard controls after connection
                GameControls.setupKeyboardControls(
                    socket,
                    this.state.getRunningState(),
                    this.state.getUserInfo(),
                    this.state.getRoomUUID(),
                    this.state.getGlobalUUID()
                );
                
                // Send authentication
                this.messageSender.sendAuthMessage();
            };

            socket.onmessage = (event) => {
                this.handleMessage(event);
            };

            socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                this.disconnect();
            };
            
            socket.onclose = () => {
                console.log("WebSocket connection closed");
                this.state.setRunningState(false);
                const frameId = this.state.getFrameId();
                if (frameId) {
                    cancelAnimationFrame(frameId);
                    this.state.setFrameId(null);
                }
            };
        } catch (error) {
            console.error('WebSocket initialization failed:', error);
        }
    }
    
    private handleMessage(event: MessageEvent): void {
        try {
            const message = JSON.parse(event.data);
            
            // First check if it's a tournament message
            if (this.tournamentMessageHandler.handleTournamentMessage(message)) {
                return; // Message was handled by tournament handler
            }
            
            // Otherwise, let the game message handler try to process it
            this.gameMessageHandler.handleGameMessage(message);
            
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
        }
    }
    
    disconnect(): void {
        this.gameMessageHandler.disconnect();
    }
    
    sendMessage(type: string, data?: any): void {
        this.messageSender.sendMessage(type, data);
    }
}