import { all_sessions, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";

// Set default dimensions for server-side (no window object in Node.js)
let width = 1600; // Default width for game
let height = 800; // Default height for game 

let sessions = new Map<string, Game>();

import WebSocket from 'ws';

function secure_send(ws: WebSocket, message: string) {
    if (ws.readyState !== WebSocket.CLOSED) {
        ws.send(message);
    }
}

async function HandleMatch() {
    if (all_sessions.length > 0) {
        console.log("Creating game");
        const game = new Game(1600, 800); // Example: game logic dimensions are 800x400
        game.mode = all_sessions[0].match.players[0].type;
        switch (game.mode) {
            case 'random_adversaire':
                game.p1.username = all_sessions[0].match.players[0].username;
                game.p2.username = all_sessions[0].match.players[1].username;
                game.match = all_sessions[0].match.players[0].username + " vs " + all_sessions[0].match.players[1].username;
                game.p1.ws = all_sessions[0].match.players[0].socket;
                game.p2.ws = all_sessions[0].match.players[1].socket;
                game.mapPlayers.set(all_sessions[0].match.players[0].user_id, game.p1);
                sessions.set(all_sessions[0].match.uuid_room, game);
                if (game.p1.ws.readyState !== wss.close && game.p2.ws.readyState !== wss.close) {
                    console.log("Game start message sent to both players uuid_room: ", all_sessions[0].match.uuid_room);
                    game.p1.ws.send(JSON.stringify({ 
                        type: 'start', 
                        player: game.p1.username,
                        uuid_room : all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    game.p2.ws.send(JSON.stringify({ 
                        type: 'start', 
                        player: game.p2.username,
                        uuid_room : all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }))
                    all_sessions.shift();
                }
                else {
                    console.error("Error sending game start message");
                    sessions.delete(all_sessions[0].match.uuid_room);
                    secure_send(all_sessions[0].match.players[0].socket, JSON.stringify({ type: 'error', message: 'Error starting game' }));
                    secure_send(all_sessions[0].match.players[1].socket, JSON.stringify({ type: 'error', message: 'Error starting game' }));
                    all_sessions.shift();
                }
                break;
            case 'local':
                game.p1.username = "player_1";
                game.p2.username = "player_2";
                game.match = "Local game";
                game.mode = 'local';
                game.p1.ws = all_sessions[0].match.players[0].socket;
                console.log(`the uuid_room: ${all_sessions[0].match.uuid_room}`);
                sessions.set(all_sessions[0].match.uuid_room, game);
                if (game.p1.ws.readyState !== wss.close) {
                    game.p1.ws.send(JSON.stringify({
                        type: 'start',
                        player: game.p1.username,
                        uuid_room: all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    all_sessions.shift();
                    console.log("Game start message sent to player 1");
                } else {
                    console.error("Error sending game start message");
                    sessions.delete(all_sessions[0].match.uuid_room);
                    all_sessions.shift();
                }
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
        session.sendData();
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message: string) => {
        try {
            let data = JSON.parse(message);
            console.log("Touches reçues:", data.keys);
    
            if (data.type === 'key_command' && data.uuid_room && sessions.has(data.uuid_room)) {
                const session = sessions.get(data.uuid_room);
                if (!session) return;
    
                if (session.mode === 'local') {
                    if (data.keys.includes('ArrowUp')) session.p1.paddle.moveUp();
                    if (data.keys.includes('ArrowDown')) session.p1.paddle.moveDown();
                    if (data.keys.includes('z')) session.p2.paddle.moveUp();
                    if (data.keys.includes('s')) session.p2.paddle.moveDown();
                } 
                else if (session.mode === 'random_adversaire') {
                    const player = session.mapPlayers.get(data.user_id);
                    if (player) {
                        if (data.keys.includes('ArrowUp')) player.paddle.moveUp();
                        if (data.keys.includes('ArrowDown')) player.paddle.moveDown();
                    }
                }
            }
        } catch (error) {
            console.error("Erreur de traitement du message:", error);
        }
    });
});

// Then remove handleKeyCommand from your GameLoop
export async function GameLoop() {
    // await handleKeyCommand(); <- Remove this line
    await HandleMatch();
    await UpdateGame();
    setTimeout(GameLoop, 1000 / 120);
}

