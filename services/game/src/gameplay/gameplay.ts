import { all_sessions, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";

// Set default dimensions for server-side (no window object in Node.js)
let width = 1600; // Default width for game
let height = 800; // Default height for game 

let sessions = new Map<string, Game>();

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
                game.mode = 'random_adversaire';
                sessions.set(all_sessions[0].match.uuid_room, game);
                if (game.p1.ws.readyState !== wss.close && game.p2.ws.readyState !== wss.close) {
                    game.p1.ws.send(JSON.stringify({ 
                        type: 'game_start', 
                        player: game.p1.username,
                        uuid : all_sessions[0].match.uuid_room,
                        dimensions: { width, height }
                    }));
                    game.p2.ws.send(JSON.stringify({ 
                        type: 'start', 
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
        session.sendData();
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message: string) => {
        try {
            let data = JSON.parse(message);
            //console.log("Message received:", data);
            console.log (data.uuid_room);
            if (data.type === 'key_command') {
                if (data.uuid_room && sessions.has(data.uuid_room))
                {
                    console.log("rooooom exist !!!!");
                    console.log("Key command received for room:", data.uuid_room);
                    const session = sessions.get(data.uuid_room);
                    if (session && session.mode === 'local') {
                        if (data.key === 'ArrowUp') {
                            console.log("ArrowUp nrgro");
                            session.p1.paddle.moveUp();
                        }
                        if (data.key === 'ArrowDown') {
                            session.p1.paddle.moveDown();
                        }
                        if (data.key === 'z') {
                            session.p2.paddle.moveUp();
                        }
                        if (data.key === 's') {
                            session.p2.paddle.moveDown();
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Error processing message:", error);
        }}
)});
;

// Then remove handleKeyCommand from your GameLoop
export async function GameLoop() {
    // await handleKeyCommand(); <- Remove this line
    await HandleMatch();
    await UpdateGame();
    setTimeout(GameLoop, 1000 / 120);
}

