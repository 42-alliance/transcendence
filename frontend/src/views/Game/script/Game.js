var username = 'Test'; // À remplacer par un fetch
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");
var stat = "loading";
var video = null; // Declare video outside of the drawing function
function drawingLoadingPage() {
    if (!ctx)
        return;
    // Create video element
    if (!video) {
        video = document.createElement("video");
        video.src = "./asset/waiting.mp4"; // Make sure the path is correct
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        // blur the video
        video.style.filter = "blur(20px)";
        video.play(); // Start playing
    }
    // Set canvas size
    canvas.width = 1200;
    canvas.height = 700;
    var textX = -300; // Start position of text
    var textSpeed = 2; // Speed of text movement
    var text = "WAITING FOR OPPONENT";
    var period = ".";
    var i = 0;
    setInterval(function () {
        if (i < 3) {
            text += period;
            i++;
        }
        else {
            text = "WAITING FOR OPPONENT";
            i = 0;
        }
    }, 500);
    function animate() {
        if (canvas == null)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.font = "bold 72px Arial, Helvetica, sans-serif";
        var gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height - 50);
        gradient.addColorStop(0, '#E93240');
        gradient.addColorStop(1, '#2196F3');
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = gradient;
        ctx.fillText(text, textX, canvas.height - 100);
        textX = canvas.width / 2;
        requestAnimationFrame(animate); // Loop animation
    }
    video.onloadeddata = function () {
        if (stat === "loading")
            animate(); // Start animation when video is ready
    };
}
function render() {
    connectWebSocket();
    drawingLoadingPage();
}
function renderGame() {
    if (!ctx)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 72px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game", canvas.width / 2, canvas.height / 2);
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
    socket.onmessage = function (event) {
        console.log('Message reçu:', event.data);
        var data = JSON.parse(event.data);
        if (data.type === 'match_found') {
            stat = "game";
            console.log('Match trouvé affichage du jeu');
            // Stop the video and clear the canvas
            if (video) {
                video = null; // Clear the video
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            renderGame(); // Show the game display
        }
    };
}
window.render = render;
