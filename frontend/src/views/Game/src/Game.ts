import { BallAndSocketConstraint } from "babylonjs";

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

const loadingCanvas = document.getElementById("loading-canvas") as HTMLCanvasElement | null;
const gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
const ctx = loadingCanvas ? loadingCanvas.getContext("2d") : null;

let stat = "loading";
let video: HTMLVideoElement | null = null; // Declare video outside of the drawing function

// Global variables for game objects
let ball: any;
let paddle1: any;
let paddle2: any;
let gameSocket: WebSocket; // Single WebSocket instance

// Add a score display element
let scoreElement: HTMLDivElement | null;

function setupGameScoreDisplay() {
    // Create a div for score display if it doesn't exist
    if (!document.getElementById('game-score')) {
        scoreElement = document.createElement('div');
        scoreElement.id = 'game-score';
        scoreElement.style.position = 'absolute';
        scoreElement.style.top = '10px';
        scoreElement.style.left = '50%';
        scoreElement.style.transform = 'translateX(-50%)';
        scoreElement.style.color = 'white';
        scoreElement.style.fontSize = '24px';
        scoreElement.style.fontWeight = 'bold';
        scoreElement.style.textShadow = '2px 2px 4px #000000';
        scoreElement.innerText = '0 - 0';
        document.body.appendChild(scoreElement);
    } else {
        scoreElement = document.getElementById('game-score') as HTMLDivElement;
    }
}

function drawingLoadingPage() {
    if (!ctx) return;
    if (loadingCanvas == null) return;  // Use loadingCanvas instead of canvas

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
    loadingCanvas.width = 1200;  // Use loadingCanvas instead of canvas
    loadingCanvas.height = 700;

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
        if (loadingCanvas == null) return;  // Use loadingCanvas instead of canvas
        if (ctx == null) return;
        if (video == null) return;

        ctx.clearRect(0, 0, loadingCanvas.width, loadingCanvas.height); // Clear canvas
        ctx.drawImage(video, 0, 0, loadingCanvas.width, loadingCanvas.height); // Draw the video on canvas

        ctx.font = "bold 72px Arial, Helvetica, sans-serif";
        const gradient = ctx.createLinearGradient(0, loadingCanvas.height - 150, 0, loadingCanvas.height - 50);
        gradient.addColorStop(0, '#E93240');
        gradient.addColorStop(1, '#EE4B2B');

        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = gradient;
        ctx.fillText(text, textX, loadingCanvas.height - 100);
        textX = loadingCanvas.width / 2; // Update text position
        requestAnimationFrame(animate); // Loop animation
    }

    // Start animation when the video is ready
    video.onloadeddata = () => {
        if (stat === "loading") animate();
    };
}

function render() {
    connectWebSocket(); // Set up WebSocket with proper message handlers
    drawingLoadingPage();
    // Start animation loop separately
    requestAnimationFrame(animate);
}

function renderGame() {
    if (loadingCanvas) loadingCanvas.style.display = "none";
    if (gameCanvas) gameCanvas.style.display = "block";
    
    // Check if WebGL is supported
    if (!window.BABYLON || !window.BABYLON.Engine.isSupported()) {
        console.error("WebGL not supported");
        alert("WebGL is not supported by your browser or environment.");
        return;
    }

    // Create the engine and scene when the game starts
    if (gameCanvas == null) return;

    const engine = new window.BABYLON.Engine(gameCanvas, true);
    const scene = new window.BABYLON.Scene(engine);
    
    // Add post-processing for visual quality
    const pipeline = new window.BABYLON.DefaultRenderingPipeline("pipeline", true, scene);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.3;
    pipeline.bloomKernel = 64;
    
    // Setup camera with better angle for gameplay
    const camera = new window.BABYLON.ArcRotateCamera("camera", 
        Math.PI / 2, Math.PI / 4, 15, 
        new window.BABYLON.Vector3(0, 0, 0), scene);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 20;
    camera.attachControl(gameCanvas, true, false, false);
    
    // Add ambient lighting
    const hemisphericLight = new window.BABYLON.HemisphericLight("light", 
        new window.BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.7;
    
    // Add point lights for dramatic effect
    
    // const tableMaterial = new window.BABYLON.StandardMaterial("tableMaterial", scene);
    // tableMaterial.diffuseColor = new window.BABYLON.Color3(0, 0.3, 0);
    // table.material = tableMaterial;
    
    // Create the net
    // const net = window.BABYLON.MeshBuilder.CreateBox("net", {
    //     width: 0.05, 
    //     height: 0.3, 
    //     depth: 4
    // }, scene);
    // net.position.y = 0.15;
    
    // const netMaterial = new window.BABYLON.StandardMaterial("netMaterial", scene);
    // netMaterial.diffuseColor = new window.BABYLON.Color3(1, 1, 1);
    // net.material = netMaterial;
    
    // Create the ball
    ball = window.BABYLON.MeshBuilder.CreateSphere("ball", {
        diameter: 0.1
    }, scene);
    ball.position.y = 0.2;
    
    const ballMaterial = new window.BABYLON.StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new window.BABYLON.Color3(1, 0.8, 0.2);
    ball.material = ballMaterial;
    
    // Create paddles
    paddle1 = window.BABYLON.MeshBuilder.CreateBox("paddle1", {
        width: 0.05, 
        height: 0.2, 
        depth: 1
    }, scene);
    paddle1.position.x = -7.5;
    paddle1.position.y = 0.25;
    
    paddle2 = window.BABYLON.MeshBuilder.CreateBox("paddle2", {
        width: 0.05, 
        height: 0.2, 
        depth: 1
    }, scene);
    paddle2.position.x = 7.5;
    paddle2.position.y = 0.25;
    
    const paddleMaterial = new window.BABYLON.StandardMaterial("paddleMaterial", scene);
    paddleMaterial.diffuseColor = new window.BABYLON.Color3(0.8, 0.2, 0.2);
    paddle1.material = paddleMaterial;
    paddle2.material = paddleMaterial;
    
    // Run the render loop
    engine.runRenderLoop(() => {
        scene.render();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
    });

    // Setup game communication once objects are created
    // At the end, make sure to remove the unnecessary animate() call
    // since we'll start it separately
}

const socket = new WebSocket("ws://localhost:8790");
function connectWebSocket() {

    socket.onopen = () => {
        console.log("WebSocket connection established");
        socket.send(JSON.stringify({ type: 'online', username: username }));
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };
    
    // Set up the message handler to process game updates
    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            
            switch(message.type) {
                case 'match_found':
                    stat = "game";
                    console.log('Match found, starting game');
                    console.log('Opponent:', message.opponent);
                    console.log('Game UUID:', message.uuid);
                    
                    // Clean up loading screen
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                    
                    if (ctx && loadingCanvas) {
                        ctx.clearRect(0, 0, loadingCanvas.width, loadingCanvas.height);
                        renderGame();
                        setupGameScoreDisplay();
                        setupKeyboardControls(); // Add this line to set up keyboard controls
                    }
                    break;
                    
                case 'update':
                    // Handle game object updates using the correct data structure
                    if (!message.data) {
                        console.error("Missing data in update message:", message);
                        return;
                    }
                    
                    const gameState = message.data;
                    const scaleFactor = 0.01; // Define a scale factor for the coordinates
                    
                    // Map 2D coordinates to 3D world space with scaling
                    ball.position.x = (gameState.ball.x - 255) * scaleFactor;
                    ball.position.z = (gameState.ball.y - 255 )* scaleFactor;
                    paddle1.position.z = (gameState.paddle1.y - 235) * scaleFactor;
                    paddle2.position.z = (gameState.paddle2.y - 235) * scaleFactor;
                    paddle1.position.x = -2.4;
                    paddle2.position.x = 5;
                    
                    console.log("Game state updated:", gameState);
                    
                    break;
                    
                default:
                    console.log("Unhandled message type:", message.type);
            }
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
        }
    };
}

// Add this function to handle keyboard controls
function setupKeyboardControls() {
    // Remove any existing event listeners first to prevent duplicates
    document.removeEventListener('keydown', handleKeyDown);
    
    // Add the event listener for keydown events with useCapture=true to intercept before camera
    document.addEventListener('keydown', handleKeyDown, true);
    
    // For debugging purposes, let's add a visual indicator that a key was pressed
    console.log("Keyboard controls set up");
}

// Function to handle key presses and send commands to the server
function handleKeyDown(event: KeyboardEvent) {
    // Only react to arrow keys
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        // Prevent default behavior and stop propagation
        event.preventDefault();
        event.stopPropagation(); // This prevents the event from reaching the camera
        
        console.log(`Key pressed: ${event.key}`); // Debug output
        
        // Send the command to the WebSocket server
        if (socket && socket.readyState === WebSocket.OPEN) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'key_command',
                    username: username,
                    key: event.key
                }));
            } else {
                console.error('WebSocket is not open. ReadyState:', socket.readyState);
            }
            
            console.log('Key command sent to server'); // Debug output
        }
    }
}

function animate() {
    // No need to reassign socket.onmessage here - it's already set in connectWebSocket
    // Just set up a frame loop to keep the game rendering
    requestAnimationFrame(animate);
}
//animate loop
render();

