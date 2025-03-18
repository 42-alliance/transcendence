// 


function render() {
    fetch('/ws/game/matchmaking', {
        method: 'GET',
        headers: { 'Authorization': localStorage.getItem('token') || '' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const socket = new WebSocket('ws://localhost:8790');
            
            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'auth', token: localStorage.getItem('token') }));
            };
    
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'auth_success') {
                    console.log("Authentification réussie, jeu prêt.");
                } else if (message.type === 'auth_failed') {
                    console.error("Authentification échouée, déconnexion...");
                    socket.close();
                }
            };
        }
    });
}
//animate loop
render();

