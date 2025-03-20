import { all_sessions, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";

// Set default dimensions for server-side (no window object in Node.js)
let width = 800; // Default width for game
let height = 600; // Default height for game 

let sessions = new Map<string, Game>();

async function HandleMatch() {
    if (all_sessions.length > 0) {
        console.log("Creating game");
        
        let game = new Game(width, height);
        game.mode = all_sessions[0].match.players[0].type;
        switch (game.mode) {
            case 'random_adversaire':
                game.p1.username = all_sessions[0].match.players[0].username;
                game.p2.username = all_sessions[0].match.players[1].username;
                game.match = all_sessions[0].match.players[0].username + " vs " + all_sessions[0].match.players[1].username;
                game.p1.ws = all_sessions[0].match.players[0].socket;
                game.p2.ws = all_sessions[0].match.players[1].socket;
                sessions.set(all_sessions[0].match.uuid_room, game);
                if (game.p1.ws.readyState !== wss.close && game.p2.ws.readyState !== wss.close) {
                    game.p1.ws.send(JSON.stringify({ 
                        type: 'game_start', 
                        player: game.p1.username,
                        uuid : all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    game.p2.ws.send(JSON.stringify({ 
                        type: 'game_start', 
                        player: game.p2.username,
                        uuid : all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    console.log("Game start message sent to both players");}
                else {
                    console.error("Error sending game start message");
                    sessions.delete(all_sessions[0].match.uuid_room);
                    all_sessions.shift();
                }
                all_sessions.shift();
                break;
            case 'local':
                game.p1.username = "player 1";
                game.p2.username = "player 2";
                game.match = "Local game";
                game.p1.ws = all_sessions[0].match.players[0].socket;
                sessions.set(all_sessions[0].match.uuid_room, game);
                if (game.p1.ws.readyState !== wss.close) {
                    game.p1.ws.send(JSON.stringify({
                        type: 'game_start',
                        player: game.p1.username,
                        uuid: all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    console.log("Game start message sent to player 1");
                } else {
                    console.error("Error sending game start message");
                    sessions.delete(all_sessions[0].match.uuid_room);
                    all_sessions.shift();
                }
                all_sessions.shift();
                break;
        
            case 'default':
                console.error("Error: no game mode selected");
                all_sessions.shift();
                break;
            }
    }
}

async function UpdateGame() {
    sessions.forEach((session) => {
        session.update();
        session.checkBounds();
        
        // Check for game over
        if (session.score_p1 === 5) {
            session.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.p1.username }));
            session.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.p1.username }));
        }
        if (session.score_p2 === 5) {
            session.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.p2.username }));
            session.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.p2.username }));
        }
        
        session.sendData();
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
                            session.paddle_1.moveUp();
                            console.log("Paddle 1 moved up");
                        }
                        if (data.key === 'ArrowDown') {
                            session.paddle_1.moveDown();
                        }
                    } if (data.username) {
                        if (data.key === 'ArrowUp') {
                            session.paddle_2.moveUp();
                            console.log("Paddle 2 moved up");
                        }
                        if (data.key === 'ArrowDown') {
                            session.paddle_2.moveDown();
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

