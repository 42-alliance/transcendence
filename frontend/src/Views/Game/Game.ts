import { get } from "http";
import { getUserInfos } from "../../User/me.js";

export default class Game {
    private socket: WebSocket | null = null;
    private isRunning: boolean = false;
    private user_info: any;

    constructor() {
        this.initializeUserInfo();
    }

    private async initializeUserInfo() {
        this.user_info = await getUserInfos();
    }
    
    
    private  handleRandomAdversaireButton = () => {
        console.log("Random adversaire button clicked");
        this.socket?.send(JSON.stringify({
            type: 'random_adversaire',
            user: this.user_info
        }));
    }
    private handleLocalButton = () => {
        console.log("Local button clicked");
        this.socket?.send(JSON.stringify({
            type: 'local'
        }));
    }
    private animate = () => {
        if (!this.isRunning) return;
        
        // game logic here
        // render here
        
        requestAnimationFrame(this.animate);
    }
    
    async executeViewScript() {
        console.log("Executing view script...");
        this.connectToMatchmaking();
    }
    
    async connectToMatchmaking() {
        console.log("Connecting to matchmaking...");
        if (this.user_info === null) {
            console.error("User info not found");
            return;
        }
        console.log("User info: --------", this.user_info);
        fetch('http://127.0.0.1:8765/ws/game/matchmaking', {
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('access_token') || '',
                'x-user-id': String(this.user_info.id) || '',
                'x-user-name': this.user_info.name || '' // Include user name in the headers
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
                    this.initializeWebSocket();
                    document.getElementById('randomAdversaireButton')?.addEventListener('click', this.handleRandomAdversaireButton);
                    document.getElementById('localButton')?.addEventListener('click', this.handleLocalButton);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    private initializeWebSocket() {
        try {
            this.socket = new WebSocket('ws://localhost:8790');

            this.socket.onopen = () => {
                this.socket?.send(JSON.stringify({
                    type: 'auth',
                    token: localStorage.getItem('access_token')
                }));
            };

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'auth_success') {
                    console.log("Authentification réussie, jeu prêt.");
                    this.isRunning = true;
                    this.animate();
                } else if (message.type === 'auth_failed') {
                    console.error("Authentification échouée, déconnexion...");
                    this.disconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                this.disconnect();
            };
        } catch (error) {
            console.error('WebSocket initialization failed:', error);
        }
    }

    disconnect() {
        this.isRunning = false;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
    async getHtml() {
        //return the content of the view
        console.log("Game view loaded -----------------------------------");
        //return red canvas with text "Game"
        return `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; position: relative;">
            <div style="position: relative; width: 1600px; height: 800px;">
                <canvas id="gameCanvas" width="1600" height="800" style="background-color: grey; position: absolute; top: 0; left: 0;">
                Your browser does not support the HTML5 canvas tag.
                </canvas>
                <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 1;">
                <button id="randomAdversaireButton" style="padding: 10px 20px; font-size: 16px;">Random Adversaire</button>
                <button id="localButton" style="padding: 10px 20px; font-size: 16px;">Local</button>
                <button id="roomCodeButton" style="padding: 10px 20px; font-size: 16px;">Room Code</button>
                <button id="tournamentButton" style="padding: 10px 20px; font-size: 16px;">Tournament</button>
                <button id="iaButton" style="padding: 10px 20px; font-size: 16px;">IA</button>
                </div>
            </div>
            </div>
        `;
    }
}
