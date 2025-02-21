import WebSocket from "ws";

const connectWebSocket = async () => {
  try {
      // Récupérer le username depuis l'API locale
      const response = await fetch('http://localhost:8080/api/me', { credentials: 'include' });
      if (!response.ok) throw new Error('Erreur lors de la récupération du username');

      const userData = await response.json();
      const username = userData.username;
      console.log(`Utilisateur récupéré: ${username}`);

      // Connexion au WebSocket
      const socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
          console.log('Connecté au serveur WebSocket');
          socket.send(JSON.stringify({ type: 'join_queue', username }));
      };

      socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'match_found') {
              console.log(`Match trouvé ! Ton adversaire : ${data.opponent}`);
          }
      };

      socket.onclose = () => {
          console.log('Déconnecté du serveur');
      };
  } catch (error) {
      console.error('Erreur:', error);
  }
};

// Lancer la connexion WebSocket après récupération du username
connectWebSocket();
