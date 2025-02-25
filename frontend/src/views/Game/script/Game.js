var username = 'Test'; // À remplacer par un fetch
var canvas = document.getElementById("game-canvas");
function drawing() {
    var ctx = canvas.getContext("2d");
    if (canvas.getContext) {
        // Create an Image object to load a GIF
        var gifImage_1 = new Image();
        gifImage_1.src = './asset/waiting.gif'; // Replace with the path to your GIF file
        // Draw the GIF on the canvas once it has loaded
        gifImage_1.onload = function () {
            // You can set the position and size of the GIF as needed
            ctx.drawImage(gifImage_1, 0, -100, 900, 900); // x, y, width, height
        };
    }
}
function render() {
    connectWebSocket();
    drawing();
}
function connectWebSocket() {
    var socket = new WebSocket("ws://localhost:8790");
    socket.onopen = function () {
        //console.log('Connecté au serveur WebSocket');
        socket.send(JSON.stringify({ type: 'online', username: username }));
    };
    socket.onerror = function (error) {
        console.error('Erreur WebSocket:', error);
    };
}
window.render = render;
