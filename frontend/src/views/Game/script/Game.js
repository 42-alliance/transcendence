var username = 'Test';
function render() {
    var socket = new WebSocket("ws://localhost:8790");
    if (!socket) {
        console.error('Impossible de se connecter au serveur WebSocket');
        return;
    }
    socket.onopen = function () {
        console.log('Connecté au serveur WebSocket');
        socket.send(JSON.stringify({ type: 'online', username: username }));
        console.log('Message envoyé');
    };
    socket.onmessage = function (event) {
        console.log(event.data);
    };
}
window.render = render;
