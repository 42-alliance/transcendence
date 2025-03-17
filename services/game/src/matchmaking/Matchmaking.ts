import { platform } from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import {v4 as uuidv4} from 'uuid';



export interface Player {
    socket: WebSocket;
    username: string;
    type: string;
}


export const match = {
    //a tab of two interface player
    players: [] as Player[],
}
export const session: { match: typeof match }[] = [];
const queue_local: Player[] = [];
const queue_online: Player[] = [];

let i = 0;
export const wss = new WebSocketServer({ port: 8790 });
console.log('Serveur WebSocket lancé sur ws://localhost:8790');
export async function setupMatchmaking() {
    console.log('Setting up matchmaking');
    wss.on('connection', (ws) => {
        
        console.log('Nouvelle connexion');
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                data.username = "test" + i;
                i++;
                if (data.type === 'online') {
                    if (!queue_online.find(player => player.username === data.username)) {
                        console.log(`${data.username} a choisi le mode en ligne et entre dans la file`);
                        queue_online.push({ socket: ws, username: data.username ,type: 'online' });
                        matchPlayers(queue_online);
                    } else {
                        console.log(`${data.username} est déjà dans la file online.`);
                    }
                } else if (data.type === 'local') {
                    if (!queue_local.find(player => player.username === data.username)) {
                        console.log(`${data.username} a choisi le mode local et entre dans la file`);
                        queue_local.push({ socket: ws, username: data.username ,type: 'local' });
                        matchPlayers(queue_local);
                    } else {
                        console.log(`${data.username} est déjà dans la file locale.`);
                    }
                }
            }
            catch (error) {
                console.error('Erreur de parsing JSON:', error);
            }
        });
    });
    wss.on('close', () => {
        console.log('Fermeture de la connexion');
    });
}

/**
 * Associe les joueurs par paires pour jouer.
 */
function matchPlayers(queue: Player[]) {
    while (queue.length >= 2) {
        const player1 = queue.shift();
        if (player1 && player1.type === 'local') {
            console.log(`Match trouvé : ${player1.username}`);
            const matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player1.username});
            if (player1.socket.readyState === WebSocket.OPEN) {
                player1.socket.send(matchMessage1);
            }
            session.push({ match: { players: [player1] } });
            continue;
        }
        const player2 = queue.shift();
        if (player2 && player2.type === 'local') {
            console.log(`Match trouvé : ${player2.username}`);
            const matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player2.username });
            console.log('sending match message');
            player2.socket.send(matchMessage1);
            if (player1)
                queue.unshift(player1);
            session.push({ match: { players: [player2] } });
            continue;
        }
        else if (player1 && player2) {
            console.log(`Match trouvé : ${player1.username} vs ${player2.username}`);
            let uuid = uuidv4();
            console.log("The uuid is : " + uuid);
            
            const matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player2.username });
            const matchMessage2 = JSON.stringify({ type: 'match_found', opponent: player1.username });
            player1.socket.send(matchMessage1);
            player2.socket.send(matchMessage2);
            console.log('sending match message');
        }
        if (player1 && player2)
            session.push({ match: { players: [player1, player2] } });
    }
    }


 
