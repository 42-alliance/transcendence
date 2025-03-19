export default class Game {
    private socket: WebSocket | null = null;
    private isRunning: boolean = false;

    
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
    
    connectToMatchmaking() {
        console.log("Connecting to matchmaking...");
        fetch('http://127.0.0.1:8765/ws/game/matchmaking', {
            method: 'GET',
            headers: { 'Authorization': localStorage.getItem('access_token') || '' }
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
        return `
            <div id="game">
                <canvas id="gameCanvas" width="800" height="600"></canvas>
            </div>
        `;
    }
    
}
