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
    private frameInterval: number = 1000 / 60; // Milliseconds per frame
    private uuid_room: string = '';
    private global_uuid: string = '';
    
    constructor(user_info: any) {
        this.user_info = user_info;
        
        // Écouter les événements de requête WebSocket
        document.addEventListener('websocket_request', (event: Event) => {
            const customEvent = event as CustomEvent;
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log("Sending WebSocket request:", customEvent.detail);
                this.sendMessage(customEvent.detail.type, customEvent.detail);
            }
        });

        // Écouter les événements de requête WebSocket
        document.addEventListener('websocket_request', (event: any) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log("Sending WebSocket request:", event.detail);
                this.sendMessage(event.detail.type, event.detail);
            } else {
                console.error("WebSocket not ready");
            }
        });
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
            console.log("WebSocket message received:", message);
            
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
                    this.isRunning = true;
                    // Set up keyboard controls after game start
                    GameControls.setupKeyboardControls(
                        this.socket,
                        this.isRunning,
                        this.user_info,
                        this.uuid_room,
                        message.global_uuid
                    );
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
                case 'tournament_created':
                    console.log("Tournament created:", message.tournament);
                    GameUI.hideSpinner();
                    
                    // Afficher l'écran d'attente du tournoi
                    const tournamentScreen = GameUI.getScreen('tournament');
                   
                        (tournamentScreen as any).showTournamentWaiting(
                            message.id || message.tournament.id,
                            message.name || message.tournament.name,
                            message.players || message.tournament.players || []
                        );
                
                    break;
                case 'tournament_players_update':
                    console.log("Tournament players updated:", message.players);
                    const tourScreen = GameUI.getScreen('tournament');
                    if (tourScreen && 'updateTournamentPlayers' in tourScreen) {
                        (tourScreen as any).updateTournamentPlayers(
                            message.tournament_id,
                            message.players
                        );
                    }
                    break;
                    
                case 'all_tournaments':
                    console.log("Received tournaments list:", message.tournaments);
                    // Émettre un événement personnalisé avec l'ID de requête
                    const tournamentEvent = new CustomEvent('websocket_response', {
                        detail: {
                            type: 'all_tournaments',
                            request_id: message.request_id, // Peut être undefined dans votre cas actuel
                            tournaments: message.tournaments
                        }
                    });
                    document.dispatchEvent(tournamentEvent);

                    // Émettre un événement personnalisé pour informer le TournamentScreen
                    const tournamentEventResponse = new CustomEvent('websocket_response', {
                        detail: message
                    });
                    document.dispatchEvent(tournamentEventResponse);
                    break;
                default:
                    console.warn("Unknown message type:", message.type);
                    break;
            }
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
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
            if (data) {
                this.socket.send(JSON.stringify(data));
            } else {
                this.socket.send(JSON.stringify({ type }));
            }
        } else {
            console.error('WebSocket not connected');
        }
    }
}