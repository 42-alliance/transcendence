import { get } from "http";
import { getUserInfos } from "../../User/me.js";

export default class Game {
    private socket: WebSocket | null = null;
    private isRunning: boolean = false;
    private user_info: any;
    private gameState: any = null;
    private frameId: number | null = null;
    private lastRender: number = 0;
    private FPS: number = 60; // Target frames per second
    private frameInterval: number = 1000 / 120; // Milliseconds per frame
    private uuid_room: string = '';
    private global_uuid: string = '';

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
            type: 'local',
            user: this.user_info
        }));
    }
    private handleIAButton = () => {
        console.log("IA button clicked");
        this.socket?.send(JSON.stringify({
            type: 'ia',
            user: this.user_info
        }));
    }

    private updateGameState(state: any) {
        if (!state) return;
        
        this.gameState = state;
        
        const game = this.gameState;
        // No need to call rendering here - the animate loop will handle it
    }

    private animate = (timestamp: number = 0) => {
        if (!this.isRunning) return;
        
        // Calculate elapsed time since last render
        const elapsed = timestamp - this.lastRender;
        
        // Only render if we've passed our frame interval
        if (elapsed > this.frameInterval) {
            this.lastRender = timestamp - (elapsed % this.frameInterval);
            this.renderGame();
        }
        
        this.frameId = requestAnimationFrame(this.animate);
    }

    private renderGame() {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!gameCanvas) return;
        const ctx = gameCanvas.getContext('2d');
        if (!ctx || !this.gameState) return;
    
        // Clear the canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        const game = this.gameState;
    
        // Scaling factors to map backend coordinates to canvas dimensions
      
        // Draw the net
        ctx.fillStyle = 'white';
        const netX = (gameCanvas.width - 2) / 2;
        for (let i = 0; i <= gameCanvas.height; i += 15) {
            ctx.fillRect(netX, i, 2, 10);
        }
    
        // Draw paddles and ball if we have their positions
        if (game.paddle1) {
            console.log("Drawing user paddle...");
            ctx.fillStyle = 'white';
            ctx.fillRect(
                game.paddle1.x , 
                game.paddle1.y , 
                game.paddle1.width , 
                game.paddle1.height 
            );
        }
    
        if (game.paddle2) {
            ctx.fillStyle = 'white';
            ctx.fillRect(
                game.paddle2.x ,
                game.paddle2.y, 
                game.paddle2.width ,
                game.paddle2.height 
            );
        }
    
        if (game.ball) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                game.ball.x , 
                game.ball.y ,
                game.ball.radius , 
                0,
                Math.PI * 2
            );
            ctx.closePath();
            ctx.fill();
        }
    
        // Draw scores
        ctx.fillStyle = 'white';
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
    
        // Left player score
        if (game.score) {
            // p1 score
            ctx.fillText( game.score.p1_name + " :" + game.score.p1.toString(), gameCanvas.width / 4, 50);
            ctx.fillText( game.score.p2.toString() + ": " + game.score.p2_name, (3 * gameCanvas.width) / 4, 50);
        }
    
        // Right player score
        if (game.opponent && game.opponent.score !== undefined) {
            ctx.fillText(game.opponent.score.toString(), (3 * gameCanvas.width) / 4, 50);
        }

    }

    private setupKeyboardControls() {
        const pressedKeys = new Set<string>();

        document.addEventListener('keydown', (event) => {
            if (!this.isRunning || !this.socket) return;
            pressedKeys.add(event.key);

            this.socket.send(JSON.stringify({
                type: 'key_command',
                keys: Array.from(pressedKeys),
                user_id: this.user_info?.id,
                uuid_room: this.uuid_room,
                global_uuid : this.global_uuid
            }));
        });

        document.addEventListener('keyup', (event) => {
            if (!this.isRunning || !this.socket) return;
            pressedKeys.delete(event.key);

            this.socket.send(JSON.stringify({
                type: 'key_command',
                keys: Array.from(pressedKeys),
                user_id: this.user_info?.id,
                uuid_room: this.uuid_room
            }));
        });
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
                    document.getElementById('iaButton')?.addEventListener('click', this.handleIAButton);
                    document.getElementById('tournamentButton')?.addEventListener('click', this.handleTournamentButton);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    private handleTournamentButton = () => {
        console.log("Tournament button clicked");
        this.socket?.send(JSON.stringify({
            type: 'tournament',
            user: this.user_info
        }));
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

    private displaySpinner() {
        // Check if spinner already exists
        let spinner = document.getElementById('spinner-container');
        
        // If spinner doesn't exist, create it
        if (!spinner) {
            // Create container
            const spinnerContainer = document.createElement('div');
            spinnerContainer.id = 'spinner-container';
            spinnerContainer.className = 'spinner-container';
            
            // Create spinner element
            const spinnerElement = document.createElement('div');
            spinnerElement.className = 'spinner';
            
            // Create text element
            const spinnerText = document.createElement('div');
            spinnerText.className = 'spinner-text';
            spinnerText.textContent = 'Finding opponent...';
            
            // Append elements
            spinnerContainer.appendChild(spinnerElement);
            spinnerContainer.appendChild(spinnerText);
            
            // Add to the game area
            const gameCanvas = document.getElementById('gameCanvas');
            gameCanvas?.parentElement?.appendChild(spinnerContainer);
        } else {
            spinner.style.display = 'flex';
        }
    }

    private hideSpinner() {
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    private HandleSpinnerRender(boolean: boolean) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (boolean) {
            this.displaySpinner();
        } else {
            this.hideSpinner();
        }
    }
    private displayWaiting = () => {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (gameCanvas) {
            // Hide all buttons
            const buttons = ['randomAdversaireButton', 'localButton', 'roomCodeButton', 
                            'tournamentButton', 'iaButton'];
            
            buttons.forEach(id => {
                const button = document.getElementById(id);
                if (button) {
                    button.style.display = 'none';
                    button.setAttribute('disabled', 'true');
                }
            });
            
            // Show spinner
            this.displaySpinner();
        }
    }

    async initializeGame() {
        console.log("Initializing game...");
        this.hideSpinner();
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (gameCanvas) {
            const ctx = gameCanvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            }
        }
        const paddle_1 = {
            x: 10,
            y: 10,
            width: 10,
            height: 100,
            color: 'white',
            dy: 0
        };
        const paddle_2 = {
            x: 10,
            y: 10,
            width: 10,
            height: 100,
            color: 'white',
            dy: 0
        };
        const ball = {
            x: 10,      // x position
            y: 10,      // y position
            dx: 4,      // x direction
            dy: 4,      // y direction
            size: 5,    // ball size
            color: 'white'
        };
        const net = {
            x: (gameCanvas.width - 2) / 2,
            y: 0,
            height: 10,
            width: 2,
            color: 'white'
        };
        const user = {
            x: 10,
            y: gameCanvas.height / 2 - 50,
            width: 10,
            height: 100,
            color: 'white',
            score: 0
        };
        const com = {
            x: gameCanvas.width - 20,
            y: gameCanvas.height / 2 - 50,
            width: 10,
            height: 100,    // height
            color: 'white',
            score: 0
        };  
        const game = {
            gameCanvas,
            ctx: gameCanvas.getContext('2d'),
            paddle_1,
            paddle_2,
            ball,
            net,
            user,
            com
        };
        // Draw elements on the canvas
        if (game.ctx) {
            // Draw the net
            game.ctx.fillStyle = game.net.color;
            for (let i = 0; i <= game.gameCanvas.height; i += 15) {
            game.ctx.fillRect(game.net.x, game.net.y + i, game.net.width, game.net.height);
            }

            // Draw the user paddle
            game.ctx.fillStyle = game.user.color;
            game.ctx.fillRect(game.user.x, game.user.y, game.user.width, game.user.height);

            // Draw the computer paddle
            game.ctx.fillStyle = game.com.color;
            game.ctx.fillRect(game.com.x, game.com.y, game.com.width, game.com.height);

            // Draw the ball
            game.ctx.fillStyle = game.ball.color;
            game.ctx.beginPath();
            game.ctx.arc(game.ball.x, game.ball.y, game.ball.size, 0, Math.PI * 2);
            game.ctx.closePath();
            game.ctx.fill();
        }
        //desactivate buttons
        document.getElementById('randomAdversaireButton')?.setAttribute('disabled', 'true');
        document.getElementById('localButton')?.setAttribute('disabled', 'true');
        document.getElementById('roomCodeButton')?.setAttribute('disabled', 'true');
        document.getElementById('tournamentButton')?.setAttribute('disabled', 'true');
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
        return game;
    }

    private initializeWebSocket() {
        try {
            this.socket = new WebSocket('ws://localhost:8790');

            this.socket.onopen = () => {
                console.log("WebSocket connection established");
                // Set up keyboard controls after connection
                this.setupKeyboardControls();
                
                // Send authentication
                this.socket?.send(JSON.stringify({
                    type: 'auth',
                    token: localStorage.getItem('access_token')
                }));
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    //console.log("Received WebSocket message:", message);
                    
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
                            this.displayWaiting();
                            break;
                        case 'start':
                            console.log("Game started:", message.uuid_room);
                            this.uuid_room = message.uuid_room;
                            if (message.global_uuid) {
                                this.global_uuid = message.global_uuid;
                            }
                            console.log("Game started with uuid_room:", this.uuid_room);
                            this.initializeGame().then(game => {
                                console.log("Game initialized:", game);
                                this.isRunning = true;
                                this.lastRender = performance.now();
                                this.animate();
                            });
                            break;
                        case 'game_state':
                            this.updateGameState(message.data);
                            break;
                        case 'game_over':
                            console.log("Game over:", message.winner);
                            this.isRunning = false;
                            if (this.frameId) {
                                cancelAnimationFrame(this.frameId);
                                this.frameId = null;
                            }
                            this.showGameOver(message.winner);
                            break;
                        default:
                            console.warn("Unknown message type:", message.type);
                            break;
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                }
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

    private showGameOver(winner: string) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!gameCanvas) return;
        
        const ctx = gameCanvas.getContext('2d');
        if (!ctx) return;
        
        // Slightly darken the screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Show winner
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Game Over`, gameCanvas.width / 2, gameCanvas.height / 2 - 50);
        ctx.fillText(`${winner} wins!`, gameCanvas.width / 2, gameCanvas.height / 2 + 20);
        
        // Add return button
        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return to Lobby';
        returnButton.style.position = 'absolute';
        returnButton.style.left = '50%';
        returnButton.style.top = `${gameCanvas.height / 2 + 100}px`;
        returnButton.style.transform = 'translateX(-50%)';
        returnButton.style.padding = '10px 20px';
        returnButton.style.fontSize = '18px';
        returnButton.onclick = () => {
            window.location.reload();
        };
        
        gameCanvas.parentElement?.appendChild(returnButton);
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

    async getHtml() {
        //return the content of the view
        console.log("Game view loaded -----------------------------------");
        //return red canvas with text "Game"
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
