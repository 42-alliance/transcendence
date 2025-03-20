import { platform } from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import {v4 as uuidv4} from 'uuid';



export interface Player {
    socket: WebSocket;
    username: string;
    user_id?: number;
    type: string;
    uuid_room?: string;
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
                break;

            case 'local':
                console.log("Local request received");
                player.type = data.type;
                player.username = data.user.name;  
                player.uuid_room = uuidv4();
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