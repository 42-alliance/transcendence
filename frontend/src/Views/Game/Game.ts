import { getUserInfos } from "../../User/me.js";
import { GameWebSocket } from "./GameWebSocket.js";
import { GameUI } from "./GameUI.js";

export default class Game {
    private webSocket: GameWebSocket | null = null;
    private user_info: any;
    
    constructor() {
        this.initializeUserInfo();
    }

    private async initializeUserInfo() {
        this.user_info = await getUserInfos();
        this.user_info.id = Math.floor(Math.random() * 1000000);
    }
    
    async executeViewScript() {
        console.log("Executing view script...");
        await this.connectToMatchmaking();
    }

    async connectToMatchmaking() {
        console.log("Connecting to matchmaking...");
        if (this.user_info === null) {
            console.error("User info not found");
            return;
        }
        
        const user_info = await getUserInfos();
        
        console.log("User info: --------", this.user_info);
        fetch('http://127.0.0.1:8765/ws/game/matchmaking', {
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('access_token') || '',
                'x-user-id': String(user_info?.id) || '',
                'x-user-name': user_info?.name || ''
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
                
                // Set up event listeners for buttons
                this.setupButtonEventListeners();
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    private setupButtonEventListeners() {
        document.getElementById('randomAdversaireButton')?.addEventListener('click', () => {
            console.log("Random adversaire button clicked");
            this.webSocket?.sendMessage('random_adversaire', { user: this.user_info });
        });
        
        document.getElementById('localButton')?.addEventListener('click', () => {
            console.log("Local button clicked");
            this.webSocket?.sendMessage('local', { user: this.user_info });
        });
        
        document.getElementById('iaButton')?.addEventListener('click', async () => {
            console.log("IA button clicked");
            
            try {
                // Attendre que l'utilisateur sélectionne une difficulté
                const difficultyMode = await GameUI.displayDifficultyButtons();
                console.log("Selected difficulty:", difficultyMode);
                
                // Afficher un spinner pendant la connexion
                GameUI.displayWaiting();
                
                // Envoyer le message avec la difficulté sélectionnée
                this.webSocket?.sendMessage('ia', { 
                    user: this.user_info,
                    difficulty: difficultyMode 
                });
            } catch (error) {
                console.error("Error selecting difficulty:", error);
            }
        });
        
        document.getElementById('tournamentButton')?.addEventListener('click', async () => {
            console.log("Tournament button clicked");
            const OptionSelect = await GameUI.showTournamentButtons();
        });
        
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.disconnect();
            this.webSocket = null;
        }
    }

    async getHtml() {
        console.log("Game view loaded -----------------------------------");
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