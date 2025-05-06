import { platform } from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import {v4 as uuidv4} from 'uuid';
import { stat } from 'fs';
import { on } from 'events';
import { types } from 'util';
import e from 'cors';



export interface Player {
    socket: WebSocket;
    username: string;
    user_id: string;
    type: string;
    uuid_room: string;
    difficulty: string;
}

export interface Match {
    players: Player[];
    type: string;
    uuid_room: string;
    global_uuid?: string;
}

export interface Session {
    match: Match;
}
export const all_sessions: Session[] = [];
const queue: Player[] = [];

const onlineMode: Player[] = [];
const localMode: Player[] = [];
const iaMode: Player[] = [];
const tournamentMode: Player[] = [];

async function Matchmaking() {
    setInterval(() => {
        if (queue.length >= 1) {
            // console.log("New player in queue");
            const player = queue.shift();
            if (player?.type === 'random_adversaire') {
                onlineMode.push(player);
            } else if (player?.type === 'local') {
                localMode.push(player);
            }
            else if (player?.type === 'ia') {
                iaMode.push(player);
            }
            else if (player?.type === 'tournament') {
                tournamentMode.push(player);
            }
            // console.log("Player added to matchmaking");
        }
    }, 1000); // Runs every second
}

async function HandleMatch() {
    setInterval(() => {
        if (onlineMode.length >= 2) {
            // console.log("Creating  ggg game");
            const uuid_room = uuidv4();
            const match: Match = {
                players: [onlineMode.shift() as Player, onlineMode.shift() as Player],
                type: 'random_adversaire',
                uuid_room: uuid_room
            };
            all_sessions.push({ match: match });
        }    
        else if (localMode.length == 1) {
            // console.log("Creating tjee game");
            const uuid_room = uuidv4();
            const match: Match = {
                players: [localMode.shift() as Player],
                type: 'local',
                uuid_room: uuid_room
            };
            all_sessions.push({ match: match });
        }
        else if (iaMode.length == 1) {
            console.log("Creating the game");
            const uuid_room = uuidv4();
            const match: Match = {
                players: [iaMode.shift() as Player],
                type: 'ia',
                uuid_room: uuid_room
            };
            all_sessions.push({ match: match });
        }
        else if (tournamentMode.length == 4)
        {
            // console.log("Creating the tournament");
            const uuid_room1 = uuidv4();
            const uuid_room2 = uuidv4();
            const global_uuid = uuidv4();
            const match1: Match = {
                players: [tournamentMode.shift() as Player, tournamentMode.shift() as Player],
                type: 'tournament',
                uuid_room: uuid_room1,
                global_uuid: global_uuid
            };
            const match2: Match = {
                players: [tournamentMode.shift() as Player, tournamentMode.shift() as Player],
                type: 'tournament',
                uuid_room: uuid_room2,
                global_uuid: global_uuid
            };
            all_sessions.push({ match: match1 });
            all_sessions.push({ match: match2 });
        }
    }, 1000); // Runs every second
}

function advanceTournament(global_uuid: string, winner: Player) {
    const remainingMatches = all_sessions.filter(session => session.match.global_uuid === global_uuid);

    if (remainingMatches.length === 1) {
        console.log(`Tournament winner: ${winner.username}`);
    } else {
        const nextMatch = remainingMatches.find(match => match.match.players.length < 2);
        if (nextMatch) {
            nextMatch.match.players.push(winner);
        }
    }
}

let i =  0;
        
export const wss = new WebSocketServer({ port: 8790 });
export async function setupMatchmaking()
{
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            // console.log('received: %s', message);
            const data = JSON.parse(message.toString());
            const player: Player = {
            socket: ws,
            username: '',
            type: '',
            user_id: '',
            uuid_room: '',
            difficulty: ''
            };

            switch (data.type) {
            case 'random_adversaire':
                // console.log("Random adversaire request received");
                player.username = data.user.name + "_" + i;
                i++;
                player.user_id = data.user.id ;
                player.type = data.type;
                // console.log("Player added to matchmaking");
                queue.push(player);
                secureSend(ws, {
                    uuid_room: '',
                    type: 'waiting'
                });
                break;

            case 'local':
                // console.log("Local request received");
                player.type = data.type;
                player.username = data.user.name;  
                queue.push(player);
                // console.log("player info: ", player);
                break;

            case 'ia':
                // console.log("IA request received");
                player.type = data.type;
                player.username = data.user.name;
                player.difficulty = data.difficulty;
                // console.log("player info: ", player);
                queue.push(player);
                break;
            case 'tournament':
                // console.log("Tournament request received");
                player.type = data.type;
                player.username = data.user.name;
                player.user_id = data.user.id;
                // console.log("Player added to Tournament matchmaking");
                queue.push(player);
                secureSend(ws, {
                    uuid_room: '',
                    type: 'waiting'
                });
                break;
            }
        });
    }
    );
    await Matchmaking();
    await HandleMatch();
}

function secureSend(ws: any, message: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}