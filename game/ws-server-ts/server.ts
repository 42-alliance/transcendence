import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Player {
    socket: WebSocket;
    username: string;
}

const queue: Player[] = [];

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
      try {
          const data = JSON.parse(message.toString());

          if (data.type === 'join_queue' && data.username) {
              console.log(`${data.username} entre dans la file`);
              queue.push({ socket: ws, username: data.username });
              matchPlayers();
          }
      } catch (error) {
          console.error('Erreur de parsing JSON:', error);
      }
  });
});


function matchPlayers() {
    while (queue.length >= 2) {
        const player1 = queue.shift();
        const player2 = queue.shift();

        if (player1 && player2) {
            console.log(`Match trouvé : ${player1.username} vs ${player2.username}`);

            const matchMessage = JSON.stringify({ type: 'match_found', opponent: player2.username });
            player1.socket.send(matchMessage);

            const matchMessage2 = JSON.stringify({ type: 'match_found', opponent: player1.username });
            player2.socket.send(matchMessage2);
        }
    }
}

console.log('Serveur WebSocket lancé sur ws://localhost:8080');
