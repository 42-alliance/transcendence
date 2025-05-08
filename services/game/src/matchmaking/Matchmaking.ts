import { platform } from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import {CreateTournament, GetAllTournaments, AddPlayerToTournament} from './TournamentHandling.js';
import {v4 as uuidv4} from 'uuid';
import { stat } from 'fs';
import { on } from 'events';
import { types } from 'util';
import e from 'cors';
import { G } from 'react-native-svg';



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
            console.log("Player added to queue");
            const player = queue.shift();
            if (player?.type === 'random_adversaire') {
                onlineMode.push(player);
            } else if (player?.type === 'local') {
                console.log("Player added to local mode");
                localMode.push(player);
            }
            else if (player?.type === 'ia') {
                iaMode.push(player);
            }
            else if (player?.type === 'tournament') {
                tournamentMode.push(player);
            }
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
    }, 1000); // Runs every second
}



let i =  0;
        
export const wss = new WebSocketServer({ port: 8790 });
export async function setupMatchmaking()
{
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            // console.log('received: %s', message);
            console.log("on s'interesse enfin a moi ");
            const data = JSON.parse(message.toString());
            const player: Player = {
            socket: ws,
            username: '',
            type: '',
            user_id: '',
            uuid_room: '',
            difficulty: ''
            };
            console.log(data.type);
            switch (data.type) {
            case 'random_adversaire':
                player.username = data.user.name + "_" + i;
                i++;
                player.user_id = data.user.id ;
                player.type = data.type;
                queue.push(player);
                secureSend(ws, {
                    uuid_room: '',
                    type: 'waiting'
                });
                break;
            case 'local':
                player.type = data.type;
                player.username = data.user.name;  
                queue.push(player);
                break;
            case 'ia':
                player.type = data.type;
                player.username = data.user.name;
                player.difficulty = data.difficulty;
                queue.push(player);
                break;
            case 'create_tournament':
                player.username = data.user.name;
                player.user_id = data.user.id;
                const tournament =  CreateTournament(player, data.tournament_name);
                if (tournament) {
                    player.type = 'tournament';
                    player.uuid_room = tournament.id;
                    player.socket = ws;
                    AddPlayerToTournament(tournament.id, player);
                    secureSend(ws, {
                        type: 'tournament_created',
                        tournament: tournament,
                        name : tournament.name,
                        id : tournament.id,
                        players: tournament.players,

                    });
                    console.log("Tournament created:", tournament);
                }   
                break;
            case 'get_all_tournaments':
                console.log("Get all tournaments request received");
                console.log("All tournaments:", GetAllTournaments());
                secureSend(ws, {
                    type: 'all_tournaments',
                    tournaments: GetAllTournaments()
                });
                console.log("All tournaments sent:", GetAllTournaments());
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