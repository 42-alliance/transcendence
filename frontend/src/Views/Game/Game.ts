// Ajouter ceci au début du fichier
import { getUserInfos } from "../../User/me.js";
import { GameWebSocket } from "./GameWebSocket.js";
import { GameUI } from "./GameUI.js";
import AView from "../AView.js";

export default class extends AView {
    private webSocket: GameWebSocket | null = null;
    private user_info: any;
    
    constructor() {
		super();
        // Conserver l'instance dans la variable globale
        (window as any).gameInstance = this;
        this.initializeUserInfo();
    }

	

    private async initializeUserInfo() {
        this.user_info = await getUserInfos();
        // this.user_info.id = Math.floor(Math.random() * 1000000);

    }
    
    async executeViewScript() {
        console.log("Executing view script...");
        await this.connectToMatchmaking();
    }

   
    getUser(): { id: string,
                 name: string;
     } {
        // Replace with actual logic to retrieve the current user's ID
        return { id: this.user_info.id,
                 name: this.user_info.name
                };
    }
    async connectToMatchmaking() {
        console.log("Connecting to matchmaking...");
        if (this.user_info === null) {
            console.error("User info not found");
            return;
        }
        
        const user_info = await getUserInfos();
        
        console.log("User info: --------", this.user_info);
        // Remplace l'URL vide par celle du gateway qui route vers le service game
        fetch('http://localhost:8000/game/matchmaking', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
                'x-user-id': String(user_info?.id ?? ''),
                'x-user-name': user_info?.name ?? ''
            }
        })
        .then(response => {
            console.log("Matchmaking response received:", response);
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log("Matchmaking data:", data);
            if (data.success) {
            // Initialize WebSocket
            this.webSocket = new GameWebSocket(this.user_info);
            this.webSocket.initializeWebSocket();
            
            // S'assurer que GameUI est initialisé pour charger les écrans
            GameUI.initialize();
            
            // Set up event listeners for buttons
            this.setupButtonEventListeners();
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    private setupButtonEventListeners() {
        document.getElementById('randomAdversaireButton')?.addEventListener('click', () => {
            console.log("Random adversaire button clicked");
            GameUI.displayWaiting();
            this.webSocket?.sendMessage('random_adversaire', { user: this.user_info
                , type: 'random_adversaire'
             });
        });
        
        document.getElementById('localButton')?.addEventListener('click', () => {
            console.log("Local button clicked");
            GameUI.displayWaiting();
            
            this.webSocket?.sendMessage('local', { user: this.user_info,
                type: 'local'
             });
            
        });
        
        document.getElementById('iaButton')?.addEventListener('click', async () => {

            try {
                // Attendre que l'utilisateur sélectionne une difficulté
                const difficultyMode = await GameUI.displayDifficultyButtons();
                console.log("Selected difficulty:", difficultyMode);
                if (difficultyMode === 'back') {
                    // Si l'utilisateur a choisi de revenir, rétablir les boutons du lobby
                    GameUI.showLobbyButtons();
                    return;
                }
                if (difficultyMode) {
                    // Afficher un spinner pendant la connexion
                    GameUI.displayWaiting();
                    
                    // Envoyer le message avec la difficulté sélectionnée
                    this.webSocket?.sendMessage('ia', { 
                        user: this.user_info,
                        difficulty: difficultyMode,
                        type: 'ia',
                    });
                }
            } catch (error) {
                console.error("Error selecting difficulty:", error);
                // En cas d'erreur, rétablir les boutons du lobby
                GameUI.showLobbyButtons();
            }
        });
        
        document.getElementById('tournamentButton')?.addEventListener('click', async () => {
            console.log("Tournament button clicked");
            try {
                // Vérifier d'abord si l'écran de tournoi existe
                if (!GameUI.hasScreen('tournament')) {
                    console.error("Tournament screen not found");
                    return;
                }
                
                // Afficher les options de tournoi
                const optionSelect = await GameUI.showScreen('tournament');
                
                if (optionSelect) {
                    console.log("Tournament option selected:", optionSelect);
                    
                    if (optionSelect === 'create') {
                        try {
                            // Utiliser la méthode du TournamentScreen pour afficher le modal de création
                            const tournamentScreen = GameUI.getScreen('tournament');
                            if (tournamentScreen && 'showCreateTournament' in tournamentScreen) {
                                const tournamentName = await (tournamentScreen as { showCreateTournament: () => Promise<string | null> }).showCreateTournament();
                                
                                if (tournamentName) {
                                    console.log("Tournament name:", tournamentName);
                                    GameUI.displayWaiting();
                                    
                                    this.webSocket?.sendMessage('create_tournament', { 
                                        user: this.user_info,
                                        tournament_name: tournamentName ,
                                        type: 'create_tournament'
                                    });
                                    // Note: Ne pas revenir au lobby ici, l'affichage sera géré par la
                                    // réponse 'tournament_created' du serveur
                                } else {
                                    // Annulation, revenir aux options du tournoi
                                    GameUI.showScreen('tournament');
                                }
                            }
                        } catch (error) {
                            console.error("Error creating tournament:", error);
                            GameUI.showLobbyButtons();
                        }
                    } 
                    else if (optionSelect === 'join') {
                        // Utiliser la méthode du TournamentScreen pour afficher le modal de rejoindre
                        const tournamentScreen = GameUI.getScreen('tournament');
                        if (tournamentScreen && 'showJoinTournament' in tournamentScreen) {
                            const tournamentId = await (tournamentScreen as { showJoinTournament: () => Promise<string | null> }).showJoinTournament();
                            
                            if (tournamentId) {
                                console.log("Tournament ID:", tournamentId);
                                GameUI.displayWaiting();
                                
                                this.webSocket?.sendMessage('join_tournament', { 
                                    user: this.user_info,
                                    tournament_id: tournamentId ,
                                    type: 'join_tournament'
                                });
                            } else {
                                // Annulation, revenir aux options du tournoi
                                GameUI.showScreen('tournament');
                            }
                        }
                    }
                    else if (optionSelect === 'cancel') {
                        // L'utilisateur a annulé, rétablir les boutons du lobby
                        GameUI.showLobbyButtons();
                    }
                } else {
                    // Si pas de sélection, rétablir les boutons du lobby
                    GameUI.showLobbyButtons();
                }
            } catch (error) {
                console.error("Error with tournament selection:", error);
                // En cas d'erreur, rétablir les boutons du lobby
                // enlever gameCanvas
            
                GameUI.showLobbyButtons();
            }
        });
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.disconnect();
            this.webSocket = null;
        }
    }

    async getHtml() {
        try {
            const response = await fetch("src/Views/Game/Game.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
       
            return await response.text();
        } catch (error) {
            console.error(error);
            return `<p>Erreur lors du chargement du formulaire</p>`;
        }
    }
}

