export { };

declare global {
    interface Window {
        render: () => void;
        BABYLON: any; // Add BABYLON to the global namespace
    }
}

let username = 'Test'; // Placeholder for username
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;

if (canvas == null) {
    console.error("Impossible de récupérer le canvas");
}

const ctx = canvas ? canvas.getContext("2d") : null;

let stat = "loading";
let video: HTMLVideoElement | null = null; // Declare video outside of the drawing function

function drawingLoadingPage() {
    if (!ctx) return;
    if (canvas == null) return;

    // Create video element only once
    if (!video) {
        video = document.createElement("video");
        video.src = "./asset/waiting.mp4"; // Make sure the path is correct
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.style.filter = "blur(20px)";
        video.play(); // Start playing
    }

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 700;

    let textX = -300; // Start position of text
    let textSpeed = 2; // Speed of text movement

    let text = "WAITING FOR OPPONENT";
    let period = ".";
    let i = 0;
    setInterval(() => {
        if (i < 3) {
            text += period;
            i++;
        } else {
            text = "WAITING FOR OPPONENT";
            i = 0;
        }
    }, 500);

    function animate() {
        if (canvas == null) return;
        if (ctx == null) return;
        if (video == null) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the video on canvas

        ctx.font = "bold 72px Arial, Helvetica, sans-serif";
        const gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height - 50);
        gradient.addColorStop(0, '#E93240');
        gradient.addColorStop(1, '#EE4B2B');

        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = gradient;
        ctx.fillText(text, textX, canvas.height - 100);
        textX = canvas.width / 2; // Update text position
        requestAnimationFrame(animate); // Loop animation
    }

    // Start animation when the video is ready
    video.onloadeddata = () => {
        if (stat === "loading") animate();
    };
}

function render() {
    connectWebSocket();
    drawingLoadingPage();
}

function renderGame() {
    // Check if WebGL is supported
    if (!window.BABYLON || !window.BABYLON.Engine.isSupported()) {
        console.error("WebGL not supported");
        alert("WebGL is not supported by your browser or environment.");
        return;
    }

    // Create the engine and scene when the game starts
    if (canvas == null) return;

    const engine = new window.BABYLON.Engine(canvas, true);
    const scene = new window.BABYLON.Scene(engine);

    // Create the camera
    const camera = new window.BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 10, new window.BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Create a light
    const light = new window.BABYLON.HemisphericLight("light1", new window.BABYLON.Vector3.Up(), scene);

    // Create a sphere
    const sphere = window.BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });
}

function connectWebSocket() {
    const socket = new WebSocket("ws://localhost:8790");

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'online', username: username }));
    };

    socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'match_found') {
            stat = "game";
            console.log('Match trouvé, affichage du jeu');

            // Stop the video and clear the canvas
            if (video) {
                video.pause();  // Pause the video
                video.currentTime = 0;  // Reset video to the beginning
            }

            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
                renderGame();  // Show the game display
            }
        }
    };
}

render();

