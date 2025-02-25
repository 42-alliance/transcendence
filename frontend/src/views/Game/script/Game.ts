let username = 'Test'; // À remplacer par un fetch

const canvas = <HTMLCanvasElement> document.getElementById("game-canvas");

function drawing() {
	const ctx = canvas.getContext("2d");
	if (canvas.getContext) {
		// Create an Image object to load a GIF
		const gifImage = new Image();
		gifImage.src = './asset/waiting.gif'; // Replace with the path to your GIF file

		// Draw the GIF on the canvas once it has loaded
		gifImage.onload = () => {
			// You can set the position and size of the GIF as needed
			ctx.drawImage(gifImage, 0, -100, 1000, 900); // x, y, width, height
 		
		};
	}
}

function render() {
	connectWebSocket();
	drawing();
}

function connectWebSocket() {
	const socket = new WebSocket("ws://localhost:8790");

	socket.onopen = () => {
		//console.log('Connecté au serveur WebSocket');
		socket.send(JSON.stringify({ type: 'online', username: username }));
	};

	socket.onerror = (error) => {
		console.error('Erreur WebSocket:', error);
	};
}

window.render = render;