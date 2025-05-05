import { all_sessions, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";
import { GameAI, AILevel } from "./ai.js";

// Set default dimensions for server-side (no window object in Node.js)
let width = 1600; // Default width for game
let height = 800; // Default height for game 

let sessions = new Map<string, Game>();
let gameAIs = new Map<string, GameAI>();

import WebSocket from 'ws';

function secure_send(ws: WebSocket, message: string) {
    if (ws.readyState !== WebSocket.CLOSED) {
        ws.send(message);
    }
}

// Fonction pour déterminer le niveau de difficulté de l'IA
function getAIDifficultyLevel(username: string): AILevel {
    // Par défaut, utiliser le niveau moyen
    let level = AILevel.MEDIUM;
    
    // On peut personnaliser le niveau en fonction du nom d'utilisateur ou d'autres paramètres
    if (username.toLowerCase().includes('easy')) {
        level = AILevel.EASY;
    } else if (username.toLowerCase().includes('hard')) {
        level = AILevel.HARD;
    } else if (username.toLowerCase().includes('impossible')) {
        level = AILevel.IMPOSSIBLE;
    }
    
    return level;
}

async function HandleMatch() {
    if (all_sessions.length > 0) {
        console.log("Creating game");
        const game = new Game(1600, 800);
        game.mode = all_sessions[0].match.players[0].type;
        game.uuid_room = all_sessions[0].match.uuid_room;
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
                game.p1.username = "PLAYER_A";
                game.p2.username = "PLAYER_B";
                game.match = "Local game";
                game.mode = 'local';
                game.uuid_room = all_sessions[0].match.uuid_room;
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
                
                // Vérifier si le nom d'utilisateur contient des indications sur la difficulté
                const difficulty = getAIDifficultyLevel(game.p1.username);
                
                // Ajuster le nom de l'IA en fonction du niveau de difficulté
                let aiName = "IA";
                switch(difficulty) {
                    case AILevel.EASY:
                        aiName = "IA (Facile)";
                        break;
                    case AILevel.MEDIUM:
                        aiName = "IA (Moyen)";
                        break;
                    case AILevel.HARD:
                        aiName = "IA (Difficile)";
                        break;
                    case AILevel.IMPOSSIBLE:
                        aiName = "IA (Impossible)";
                        break;
                }
                
                game.p2.username = aiName;
                game.match = `${game.p1.username} vs ${aiName}`;
                game.mode = 'ia';
                game.p1.ws = all_sessions[0].match.players[0].socket;
                
                sessions.set(all_sessions[0].match.uuid_room, game);
                
                // Créer une nouvelle instance de GameAI
                const ai = new GameAI(game, difficulty);
                gameAIs.set(all_sessions[0].match.uuid_room, ai);
                
                if (game.p1.ws.readyState !== wss.close) {
                    game.p1.ws.send(JSON.stringify({
                        type: 'start',
                        player: game.p1.username,
                        opponent: aiName,
                        difficulty: difficulty.toString(),
                        uuid_room: all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    all_sessions.shift();
                    console.log(`Game start message sent to player 1 (vs ${aiName})`);
                } else {
                    console.error("Error sending game start message");
                    sessions.delete(all_sessions[0].match.uuid_room);
                    gameAIs.delete(all_sessions[0].match.uuid_room);
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
        if (session.checkWinner()) {
            sessions.delete(session.uuid_room);
        }
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message: string) => {
        console.log("Received message from client:", message);
        try {
            let data = JSON.parse(message);
            console.log("Received message:", data);
            if (data.type === 'key_command' && data.uuid_room && sessions.has(data.uuid_room)) {
                const session = sessions.get(data.uuid_room);
                console.log("Received key command:", data.keys);
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

// Remplacer la fonction foreachIaGame par une version qui utilise notre nouvelle IA
async function updateAI() {
    gameAIs.forEach((ai, uuid_room) => {
        if (sessions.has(uuid_room)) {
            // Mettre à jour l'IA
            ai.update();
        } else {
            // Supprimer l'IA si la session n'existe plus
            gameAIs.delete(uuid_room);
        }
    });
}

export async function GameLoop() {
    await HandleMatch();
    await UpdateGame();
    await updateAI();  // Remplacer foreachIaGame par updateAI
    setTimeout(GameLoop, 1000 / 120);
}