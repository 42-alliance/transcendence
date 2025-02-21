import WebSocket from "ws";


const connectWebSocket = async () => {
  try {
      // Récupérer le username depuis l'API locale
      const response = await fetch('http://localhost:3000/oui')
      .then(res => res.text())
      .then(data => console.log(data))
      .catch(err => console.error(err));
  
      const username = response;
      console.log(`Utilisateur récupéré: ${username}`);

      // Connexion au WebSocket
      const socket = new WebSocket('ws://localhost:8765');

      socket.onopen = () => {
          console.log('Connecté au serveur WebSocket');
          socket.send(JSON.stringify({ type: 'join_queue', username }));
      };

      socket.onmessage = (event) => {
          const data = JSON.parse(event.data.toString());
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
