import WebSocket from "ws";

export async function ConnectWSonline(username: string) {
    if (!username) {
        console.error('Aucun nom d\'utilisateur fourni');
        return;
    }
    const socket = new WebSocket('ws://localhost:8765');
    socket.onopen = () => {
          console.log('Connecté au serveur WebSocket');
          socket.send(JSON.stringify({ type: 'online', username: username }));
    };
}

export async function ConnectWSlocal(username: string) {
    if (!username) {
        console.error('Aucun nom d\'utilisateur fourni');
        return;
    }
    const socket = new WebSocket('ws://localhost:8765');
    socket.onopen = () => {
          console.log('Connecté au serveur WebSocket local');
          socket.send(JSON.stringify({ type: 'local', username: username }));
    };
}