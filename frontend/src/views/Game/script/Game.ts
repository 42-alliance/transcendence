//TODO: fetch to get real username and id
let username = 'Test';
//END

function render() {
	const socket = new WebSocket("ws://localhost:8790");
	if (!socket) {
		console.error('Impossible de se connecter au serveur WebSocket');
		return;
	}
	socket.onopen = () => {
		console.log('Connecté au serveur WebSocket');
		socket.send(JSON.stringify({ type: 'online', username: username }));
		console.log('Message envoyé');
	};
}

window.render = render;