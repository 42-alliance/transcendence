"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawingLoadingPage = drawingLoadingPage;
var Game_1 = require("./Game");
function drawingLoadingPage() {
    var ctx = Game_1.canvas.getContext("2d");
    if (!ctx)
        return;
    var video = document.createElement("video");
    video.src = "./asset/waiting.mp4"; // Make sure the path is correct
    video.loop = true;
    video.autoplay = true;
    video.muted = true;
    //blur the viodeo
    video.style.filter = "blur(20px)";
    video.play(); // Start playing
    // Set canvas size
    Game_1.canvas.width = 1200;
    Game_1.canvas.height = 700;
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
        if (Game_1.canvas == null || ctx == null)
            return;
        ctx.clearRect(0, 0, Game_1.canvas.width, Game_1.canvas.height); // Clear canvas
        ctx.drawImage(video, 0, 0, Game_1.canvas.width, Game_1.canvas.height);
        ctx.font = "bold 72px Arial, Helvetica, sans-serif";
        var gradient = ctx.createLinearGradient(0, Game_1.canvas.height - 150, 0, Game_1.canvas.height - 50);
        gradient.addColorStop(0, '#E93240');
        gradient.addColorStop(1, '#2196F3');
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = gradient;
        ctx.fillText(text, textX, Game_1.canvas.height - 100);
        textX = Game_1.canvas.width / 2;
        requestAnimationFrame(animate); // Loop animation
    }
    video.onloadeddata = function () {
        animate(); // Start animation when video is ready
    };
}
