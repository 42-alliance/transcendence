import { canvas } from "./Game";

export function drawingLoadingPage() {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const video = document.createElement("video");
        video.src = "./asset/waiting.mp4"; // Make sure the path is correct
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        //blur the viodeo
        video.style.filter = "blur(20px)";
        video.play(); // Start playing

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
            if (canvas == null || ctx == null) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.font = "bold 72px Arial, Helvetica, sans-serif";
            const gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height - 50);
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

        video.onloadeddata = () => {
            animate(); // Start animation when video is ready
        };
}