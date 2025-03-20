import { platform } from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import {v4 as uuidv4} from 'uuid';
import { stat } from 'fs';
import { on } from 'events';
import { types } from 'util';



export interface Player {
    socket: WebSocket;
    username: string;
    user_id?: number;
    type: string;
    uuid_room?: string;
}

export interface Match {
    players: Player[];
    type: string;
    uuid_room: string;
}

export interface Session {
    match: Match;
}
const sessions: Session[] = [];
const queue: Player[] = [];

const onlineMode: Player[] = [];
const localMode: Player[] = [];
const iaMode: Player[] = [];

async function Matchmaking() {
    if (queue.length >= 1) {
       const player = queue.shift();
       if (player?.type === 'random_adversaire') {
            onlineMode.push(player);
       } else if (player?.type === 'local') {
            localMode.push(player);
       }
    }
}

async function HandleMatch() {
    if (onlineMode.length == 2) {
        console.log("Creating game");
        const uuid_room = uuidv4();
        const match: Match = {
            players: [onlineMode.shift() as Player, onlineMode.shift() as Player],
            type: 'online',
            uuid_room: uuid_room
        };
        sessions.push({ match: match });
        onlineMode.forEach((player) => {
            player.socket.send(JSON.stringify({
                uuid_room: uuid_room,
                status: 'start'
            }
        ));
        });
    }
    else if (localMode.length == 1) {
        console.log("Creating game");
        const uuid_room = uuidv4();
        const match: Match = {
            players: [localMode.shift() as Player],
            type: 'local',
            uuid_room: uuid_room
        };
        sessions.push({ match: match });
        localMode.forEach((player) => {
            player.socket.send(JSON.stringify({
                uuid_room: uuid_room,
                status: 'start'
            }
        ));
        });
    }
    else if (iaMode.length == 1) {
        console.log("Creating game");
        const uuid_room = uuidv4();
        const match: Match = {
            players: [iaMode.shift() as Player],
            type: 'ia',
            uuid_room: uuid_room
        };
        sessions.push({ match: match });
        iaMode.forEach((player) => {
            player.socket.send(JSON.stringify({
                uuid_room: uuid_room,
                status: 'start'
            }
        ));
        });
    }
}

        
        

export async function setupMatchmaking()
{
    const wss = new WebSocketServer({ port: 8790 });
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            const data = JSON.parse(message.toString());
            const player: Player = {
            socket: ws,
            username: '',
            type: '',
            uuid_room: ''
            };

            switch (data.type) {
            case 'random_adversaire':
                console.log("Random adversaire request received");
                player.username = data.user.name;
                player.user_id = data.user.id;
                player.type = data.type;
                console.log("player info: ", player);
                console.log("Player added to matchmaking");
                ws.send(JSON.stringify({
                    uuid_room: '',
                    type: 'waiting'
                }));
                
                break;

            case 'local':
                console.log("Local request received");
                player.type = data.type;
                player.username = data.user.name;  
                player.uuid_room = uuidv4();
                ws.send(JSON.stringify({
                    uuid_room: player.uuid_room,
                    type: 'start'
                }));
                console.log("player info: ", player);
                break;

            case 'ia':
                console.log("IA request received");
                player.type = data.type;
                player.username = data.user.name;
                console.log("player info: ", player);
                player.uuid_room = uuidv4();
                break;

            default:
                console.log("Unknown request type");
                break;
            }
        });
    }
    );
}