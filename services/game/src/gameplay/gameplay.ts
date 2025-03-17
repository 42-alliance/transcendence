import { match, session, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";

// Set default dimensions for server-side (no window object in Node.js)
let width = 800; // Default width for game
let height = 600; // Default height for game 

let sessions: { game: Game }[] = [];

async function HandleMatch() {
    if (session.length > 0) {
        console.log("Creating game");
        
        // Create game with dimensions
        let game = new Game(width, height);
        game.mode = session[0].match.players[0].type;
        
        if (session[0].match.players.length === 2) {
            game.p1.username = session[0].match.players[0].username;
            game.p2.username = session[0].match.players[1].username;
            game.match = session[0].match.players[0].username + " vs " + session[0].match.players[1].username;
            game.p1.ws = session[0].match.players[0].socket;
            game.p2.ws = session[0].match.players[1].socket;
            
            if (game.p1.ws.readyState !== wss.close && game.p2.ws.readyState !== wss.close) {
                // Send canvas dimensions to clients - clients will handle resizing based on their window
                game.p1.ws.send(JSON.stringify({ 
                    type: 'game_start', 
                    player: game.p1.username,
                    dimensions: { width, height }
                }));
                game.p2.ws.send(JSON.stringify({ 
                    type: 'game_start', 
                    player: game.p2.username,
                    dimensions: { width, height }
                }));
            }
        } else {
            game.p1.username = "player1";
            game.p2.username = "player2";
            game.p1.ws = session[0].match.players[0].socket;
            game.p2.ws = session[0].match.players[0].socket;
            
            if (game.p1.ws.readyState !== wss.close) {
                game.p1.ws.send(JSON.stringify({ 
                    type: 'game_start', 
                    player: game.p1.username,
                    dimensions: { width, height }
                }));
                console.log("Game start message sent to player1");
            }
        }
        
        if (game) {
            console.log("Game created");
            sessions.push({ game: game });
            session.shift();
        } else {
            console.error("Error creating game");
        }
    }
}

async function UpdateGame() {
    sessions.forEach((session) => {
        session.game.update();
        session.game.checkBounds();
        
        // Check for game over
        if (session.game.score_p1 === 5) {
            session.game.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p1.username }));
            session.game.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p1.username }));
        }
        if (session.game.score_p2 === 5) {
            session.game.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p2.username }));
            session.game.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p2.username }));
        }
        
        session.game.sendData();
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message: string) => {
        try {
            let data = JSON.parse(message);
            console.log("Message received:", data);
            if (data.type === 'key_command') {
                console.log("Key command received:", data.key, "from", data.username);
                
                // Find the session with the matching player
                sessions.forEach((session) => {
                    if (data.username) {
                        if (data.key === 'ArrowUp') {
                            session.game.paddle_1.moveUp();
                            console.log("Paddle 1 moved up");
                        }
                        if (data.key === 'ArrowDown') {
                            session.game.paddle_1.moveDown();
                        }
                    } if (data.username) {
                        if (data.key === 'ArrowUp') {
                            session.game.paddle_2.moveUp();
                            console.log("Paddle 2 moved up");
                        }
                        if (data.key === 'ArrowDown') {
                            session.game.paddle_2.moveDown();
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });
});

// Then remove handleKeyCommand from your GameLoop
export async function GameLoop() {
    // await handleKeyCommand(); <- Remove this line
    await HandleMatch();
    await UpdateGame();
    setTimeout(GameLoop, 1000 / 60);
}

