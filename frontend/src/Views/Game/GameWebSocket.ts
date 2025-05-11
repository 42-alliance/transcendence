import { GameUI } from "./GameUI.js";
import { GameRenderer } from "./GameRenderer.js";
import { GameControls } from "./GameControls.js";
import { GameState } from "./GameState.js";
import { getUserInfo } from "./UserStore.js";

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
        
        // Ne garder qu'un seul écouteur d'événements
        document.addEventListener('websocket_request', (event: Event) => {
            const customEvent = event as CustomEvent;
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log("Sending WebSocket request:", customEvent.detail);
                
                // Utiliser l'UUID de la salle depuis l'événement s'il existe
                const uuid_room = customEvent.detail.uuid_room || this.uuid_room;
                
                this.sendMessage(customEvent.detail.type, {
                    ...customEvent.detail,
                    uuid_room: uuid_room
                });
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
            //console.log("WebSocket message received:", message);
            
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
                    // Réinitialiser et mettre à jour l'UUID avec la nouvelle valeur
                    this.uuid_room = message.uuid_room;
                    console.log("UUID_ROOM updated:", this.uuid_room);
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
                case 'tournament_joined':
                    console.log("Joined tournament:", message.tournament);
                    GameUI.hideSpinner();
                    // Afficher l'écran d'attente du tournoi après avoir rejoint
                    const joinedTournamentScreen = GameUI.getScreen('tournament');
                    if (joinedTournamentScreen && 'showTournamentWaiting' in joinedTournamentScreen) {
                        (joinedTournamentScreen as any).showTournamentWaiting(
                            message.tournament.id,
                            message.tournament.name,
                            message.tournament.players || []
                        );
                    } else {
                        console.error("Tournament waiting screen not available");
                        GameUI.showLobbyButtons();
                    }
                    break;
                case  'tournament_match_update':
                    console.log("Tournament match update:", message);
                    const tournamentScreenUpdate = GameUI.getScreen('tournament');
                    if (tournamentScreenUpdate && 'updateTournamentMatch' in tournamentScreenUpdate) {
                        (tournamentScreenUpdate as any).updateTournamentMatch(
                            message.tournament_id,
                            message.match
                        );
                    }
                    break;
                case 'tournament_match_result':
                    console.log("Tournament match result:", message);
                    const tournamentScreenResult = GameUI.getScreen('tournament');
                        (tournamentScreenResult as any).updateTournamentEndMatch(
                            message.tournament_id,
                            message.match,
                            message.winner
                        );
                    break;
                case 'tournament_final_match':
                    console.log("Tournament final match starting:", message);
                    
                    // Fermer tout modal actif du tournoi
                    const finaltournamentScreen = GameUI.getScreen('tournament');
                    if (finaltournamentScreen && 'closeActiveTournamentModal' in finaltournamentScreen) {
                        (finaltournamentScreen as any).closeActiveTournamentModal();
                    }
                
                    // Supprimer l'écran de résultat s'il existe
                    GameUI.clearGameResults();
                    
                    // Créer une transition visuelle pour la finale
                    const finalOverlay = document.createElement('div');
                    finalOverlay.style.position = 'fixed';
                    finalOverlay.style.top = '0';
                    finalOverlay.style.left = '0';
                    finalOverlay.style.width = '100%';
                    finalOverlay.style.height = '100%';
                    finalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                    finalOverlay.style.display = 'flex';
                    finalOverlay.style.flexDirection = 'column';
                    finalOverlay.style.alignItems = 'center';
                    finalOverlay.style.justifyContent = 'center';
                    finalOverlay.style.zIndex = '1000';
                    finalOverlay.style.transition = 'opacity 2s';
                    
                    const finalTitle = document.createElement('h1');
                    finalTitle.textContent = 'FINALE DU TOURNOI';
                    finalTitle.style.color = '#ffcc00';
                    finalTitle.style.fontSize = '36px';
                    finalTitle.style.marginBottom = '20px';
                    
                    const vsContainer = document.createElement('div');
                    vsContainer.style.display = 'flex';
                    vsContainer.style.alignItems = 'center';
                    vsContainer.style.justifyContent = 'center';
                    vsContainer.style.marginBottom = '30px';
                    
                    const player1 = document.createElement('div');
                    player1.textContent = getUserInfo().name || 'You';
                    player1.style.fontSize = '24px';
                    player1.style.color = '#4CAF50';
                    player1.style.padding = '10px 20px';
                    
                    const vsText = document.createElement('div');
                    vsText.textContent = 'VS';
                    vsText.style.margin = '0 15px';
                    vsText.style.fontSize = '28px';
                    vsText.style.color = 'white';
                    
                    const player2 = document.createElement('div');
                    player2.textContent = message.opponent;
                    player2.style.fontSize = '24px';
                    player2.style.color = '#F44336';
                    player2.style.padding = '10px 20px';
                    
                    vsContainer.appendChild(player1);
                    vsContainer.appendChild(vsText);
                    vsContainer.appendChild(player2);
                    
                    finalOverlay.appendChild(finalTitle);
                    finalOverlay.appendChild(vsContainer);
                    
                    document.body.appendChild(finalOverlay);
                    
                    // Animation de l'écran de finale et suppression après 3 secondes
                    setTimeout(() => {
                        finalOverlay.style.opacity = '0';
                        setTimeout(() => finalOverlay.remove(), 2000);
                    }, 3000);
                    
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
            // Réinitialiser l'UUID pour les nouvelles demandes de jeu
            if (type === 'random_adversaire' || type === 'local' || 
                type === 'ia' || type === 'tournament') {
                console.log(`Starting new game of type ${type}, resetting room UUID`);
                this.uuid_room = '';
            }
            
            // Créer une copie pour ne pas modifier l'objet original
            const messageData = { ...data };
            
            // Si l'UUID de salle n'est pas défini dans les données mais que nous en avons un localement
            if (!messageData.uuid_room && this.uuid_room) {
                messageData.uuid_room = this.uuid_room;
            }
            
            // Si aucun UUID n'est disponible et que c'est un message qui devrait en avoir un
            if (!messageData.uuid_room && ['game_state', 'move', 'disconnect'].includes(type)) {
                console.warn('Sending message without room UUID:', type);
            }
            
            const message = {
                type,
                ...messageData
            };
            
            console.log(`Sending message with UUID ${message.uuid_room || 'none'}:`, type);
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket not connected');
        }
    }
}