import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8765 });

interface Player {
    socket: WebSocket;
    username: string;
}

const queue_online: Player[] = [];
const queue_local: Player[] = [];

wss.on('connection', (ws) => {
    console.log('Nouvelle connexion');

    ws.on('message', (message) => {
        try {
            console.log('Message reçu:', message.toString());
            const data = JSON.parse(message.toString());

            if (data.type === 'join_queue' && data.username) {
                if (data.selectedGameMode === 'online') {
                    if (!queue_online.find(player => player.username === data.username)) {
                        console.log(`${data.username} a choisi le mode en ligne et entre dans la file`);
                        queue_online.push({ socket: ws, username: data.username });
                        matchPlayers(queue_online);
                    } else {
                        console.log(`${data.username} est déjà dans la file online.`);
                    }
                } else if (data.selectedGameMode === 'local') {
                    if (!queue_local.find(player => player.username === data.username)) {
                        console.log(`${data.username} a choisi le mode local et entre dans la file`);
                        queue_local.push({ socket: ws, username: data.username });
                        matchPlayers(queue_local);
                    } else {
                        console.log(`${data.username} est déjà dans la file locale.`);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur de parsing JSON:', error);
        }
    });

    ws.on('close', () => {
        console.log('Un joueur s’est déconnecté');
        removePlayerFromQueue(ws, queue_online);
        removePlayerFromQueue(ws, queue_local);
    });
});

/**
 * Associe les joueurs par paires pour jouer.
 */
function matchPlayers(queue: Player[]) {
    while (queue.length >= 2) {
        const player1 = queue.shift();
        const player2 = queue.shift();

        if (player1 && player2) {
            console.log(`Match trouvé : ${player1.username} vs ${player2.username}`);

            const matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player2.username });
            const matchMessage2 = JSON.stringify({ type: 'match_found', opponent: player1.username });

            if (player1.socket.readyState === WebSocket.OPEN) {
                player1.socket.send(matchMessage1);
            }

            if (player2.socket.readyState === WebSocket.OPEN) {
                player2.socket.send(matchMessage2);
            }
        }
    }
}

/**
 * Supprime un joueur de la file d’attente s’il se déconnecte.
 */
function removePlayerFromQueue(ws: WebSocket, queue: Player[]) {
    const index = queue.findIndex(player => player.socket === ws);
    if (index !== -1) {
        console.log(`Suppression de ${queue[index].username} de la file.`);
        queue.splice(index, 1);
    }
}

console.log('Serveur WebSocket lancé sur ws://localhost:8765');
