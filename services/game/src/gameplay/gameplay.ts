import e from "cors";
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
        console.log("Creating le  game");
        const game = new Game(1600, 800); // Example: game logic dimensions are 800x400
        game.mode = all_sessions[0].match.players[0].type;
        console.log("Game mode: ", game.mode);
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
            case 'ia':
                game.p1.username = all_sessions[0].match.players[0].username;
                game.p2.username = "IA";
                game.match = "IA game";
                game.mode = 'ia';
                game.p1.ws = all_sessions[0].match.players[0].socket;
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
            case 'tournament':
                game.p1.username = all_sessions[0].match.players[0].username;
                game.p2.username = all_sessions[0].match.players[1].username;
                game.match = all_sessions[0].match.players[0].username + " vs " + all_sessions[0].match.players[1].username;
                game.p1.ws = all_sessions[0].match.players[0].socket;
                game.p2.ws = all_sessions[0].match.players[1].socket;
                game.mapPlayers.set(all_sessions[0].match.players[0].user_id, game.p1);
                game.mapPlayers.set(all_sessions[0].match.players[1].user_id, game.p2);
                sessions.set(all_sessions[0].match.uuid_room, game);
                console.log("A game is setting up");
                if (game.p1.ws.readyState !== wss.close && game.p2.ws.readyState !== wss.close) {
                    game.p1.ws.send(JSON.stringify({
                        type: 'start',
                        player: game.p1.username,
                        uuid_room: all_sessions[0].match.uuid_room,
                        global_uuid: all_sessions[0].match.global_uuid,
                        dimensions: { width, height }
                    }));
                    game.p2.ws.send(JSON.stringify({
                        type: 'start',
                        player: game.p2.username,
                        uuid_room: all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    all_sessions.shift();
                } else {
                    console.error("Error sending game start message");
                    sessions.delete(all_sessions[0].match.uuid_room);
                    secure_send(all_sessions[0].match.players[0].socket, JSON.stringify({ type: 'error', message: 'Error starting game' }));
                    secure_send(all_sessions[0].match.players[1].socket, JSON.stringify({ type: 'error', message: 'Error starting game' }));
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
           
            if (data.type === 'key_command' && data.uuid_room && sessions.has(data.uuid_room)) {
                const session = sessions.get(data.uuid_room);
                if (!session) return;
    
                if (session.mode === 'local') {
                    if (data.keys.includes('ArrowUp')) session.p1.paddle.moveUp();
                    if (data.keys.includes('ArrowDown')) session.p1.paddle.moveDown();
                    if (data.keys.includes('z')) session.p2.paddle.moveUp();
                    if (data.keys.includes('s')) session.p2.paddle.moveDown();
                } 
                else if (session.mode === 'random_adversaire' || session.mode === 'tournament') {
                    const player = session.mapPlayers.get(data.user_id);
                    if (player) {
                        if (data.keys.includes('ArrowUp')) player.paddle.moveUp();
                        if (data.keys.includes('ArrowDown')) player.paddle.moveDown();
                    }
                }
                else if (session.mode === 'ia') {
            
                    if (data) {
                        if (data.keys.includes('ArrowUp')) session.p1.paddle.moveUp();
                        if (data.keys.includes('ArrowDown')) session.p1.paddle.moveDown();
                    }
                }
                else {
                    console.error("Unknown game mode:", session.mode);
                }
            }
        } catch (error) {
            console.error("Erreur de traitement du message:", error);
        }
    });
});

async function foreachIaGame() {
    sessions.forEach((session) => {
        if (session.mode === 'ia') {
            const ia = session.p2;
            const ball = session.ball;

            // Launch a separate thread (or asynchronous loop) for each IA
            setImmediate(() => {
                setTimeout(() => {
                    if (ball.x > session.width / 2) {
                        if (ia.paddle.y < ball.y) {
                            ia.paddle.moveDown();
                        } else if (ia.paddle.y > ball.y) {
                            ia.paddle.moveUp();
                        }
                    } else {
                        if (ia.paddle.y < session.height / 2) {
                            ia.paddle.moveDown();
                        } else if (ia.paddle.y > session.height / 2) {
                            ia.paddle.moveUp();
                        }
                    }
                }, 600); // Simulate a 200ms delay for IA decision-making
        });
        }
    });
}
//     }, 1000); // Runs every second

// Then remove handleKeyCommand from your GameLoop
export async function GameLoop() {
    // await handleKeyCommand(); <- Remove this line
    await HandleMatch();
    await UpdateGame();
    await foreachIaGame();
    setTimeout(GameLoop, 1000 / 120);
}

