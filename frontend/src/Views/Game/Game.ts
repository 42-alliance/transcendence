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


    private handleRandomAdversaireButton = () => {
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
        this.initializeWebSocket();
        this.connectToMatchmaking();
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
                'x-user-name': user_info?.name || '' // Include user name in the headers
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

    private handleRoomCodeButton = () => {
        console.log("Room code button clicked");
        const roomCode = prompt("Enter room code:");
        if (roomCode) {
            this.socket?.send(JSON.stringify({
                type: 'room_code',
                room_code: roomCode
            }));
        }
    }

    private displayWaiting = () => {
        console.log("Displaying waiting video...");
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (gameCanvas) {
            //gameCanvas.style.display = 'none';
            document.getElementById('randomAdversaireButton')?.setAttribute('disabled', 'true');
            document.getElementById('localButton')?.setAttribute('disabled', 'true');
            document.getElementById('roomCodeButton')?.setAttribute('disabled', 'true');
            document.getElementById('iaButton')?.setAttribute('disabled', 'true');
            //hide buttons
            const randomAdversaireButton = document.getElementById('randomAdversaireButton');
            if (randomAdversaireButton) {
                randomAdversaireButton.style.display = 'none';
            }
            const localButton = document.getElementById('localButton');
            if (localButton) {
                localButton.style.display = 'none';
            }
            const roomCodeButton = document.getElementById('roomCodeButton');
            if (roomCodeButton) {
                roomCodeButton.style.display = 'none';
            }
            const tournamentButton = document.getElementById('tournamentButton');
            if (tournamentButton) {
                tournamentButton.style.display = 'none';
            }
            const iaButton = document.getElementById('iaButton');
            if (iaButton) {
                iaButton.style.display = 'none';
            }
            const waitingMessage = document.createElement('div');
            waitingMessage.style.position = 'absolute';
            waitingMessage.style.top = '50%';
            waitingMessage.style.left = '50%';
            waitingMessage.style.transform = 'translate(-50%, -50%)';
            waitingMessage.style.fontSize = '24px';
            waitingMessage.style.color = 'white';
            waitingMessage.textContent = 'Waiting for an adversaire...';
            gameCanvas.parentElement?.appendChild(waitingMessage);
        }
        //write message
        //disable buttons
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
                switch (message.type) {
                    case 'auth_success':
                        console.log("Authentification réussie, jeu prêt.");
                        this.isRunning = true;
                        this.animate();
                        break;
                    case 'auth_failed':
                        console.error("Authentification échouée, déconnexion...");
                        this.disconnect();
                        break;
                    case 'room_created':
                        console.log("Room created:", message.uuid_room);
                        break;
                    case 'room_joined':
                        console.log("Room joined:", message.uuid_room);
                        break;
                    case 'room_full':
                        console.log("Room full:", message.uuid_room);
                        break;
                    case 'room_not_found':
                        console.log("Room not found:", message.uuid_room);
                        break;
                    case 'room_closed':
                        console.log("Room closed:", message.uuid_room);
                        break;
                    case 'waiting':
                        console.log("Waiting for an adversaire...");
                        this.displayWaiting();
                        break;
                    default:
                        console.warn("Message type inconnu:", message.type);
                        break;
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
