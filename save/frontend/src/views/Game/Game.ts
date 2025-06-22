import AView from "../AView.js";
import { simulateNavigation } from "../loader.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Dragon Pong");
	}
	
	async getHtml() {
		// simulateNavigation();
        try {
            const response = await fetch("src/views/Game/Game.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(error);
            return `<p>Erreur lors du chargement du formulaire</p>`;
        }
	}
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function render() {
	animate();
}

var x = Math.random() * 800;

var y = Math.random() * 500;

var dx = (Math.random() - 0.5) * 10;

var dy = (Math.random() - 0.5) * 10;

var raduis = 30;

function animate() {
	requestAnimationFrame(animate);
	const canvas = document.getElementById("game-canvas");

	if (canvas.getContext) {
		const ctx = canvas.getContext("2d");

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.arc(x, y, raduis, Math.PI * 2, false);
		ctx.stroke();

		if (x + raduis > canvas.width || x - raduis < 0)
			dx = -dx;
		if (y + raduis > canvas.height || y - raduis < 0)
			dy = -dy;
		x += dx;
		y += dy;
	}
}

window.render = render;
