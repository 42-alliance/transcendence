export class GameRenderer {
    static renderGame(gameState: any) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!gameCanvas) return;
        const ctx = gameCanvas.getContext('2d');
        if (!ctx || !gameState) return;
    
        // Clear the canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        const game = gameState;
    
        // Draw the net
        ctx.fillStyle = 'white';
        const netX = (gameCanvas.width - 2) / 2;
        for (let i = 0; i <= gameCanvas.height; i += 15) {
            ctx.fillRect(netX, i, 2, 10);
        }
    
        // Draw paddles and ball if we have their positions
        if (game.paddle1) {
            ctx.fillStyle = 'white';
            ctx.fillRect(
                game.paddle1.x , 
                game.paddle1.y , 
                game.paddle1.width , 
                game.paddle1.height 
            );
        }
    
        if (game.paddle2) {
            ctx.fillStyle = 'white';
            ctx.fillRect(
                game.paddle2.x ,
                game.paddle2.y, 
                game.paddle2.width ,
                game.paddle2.height 
            );
        }
    
        if (game.ball) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                game.ball.x , 
                game.ball.y ,
                game.ball.radius , 
                0,
                Math.PI * 2
            );
            ctx.closePath();
            ctx.fill();
        }
    
        // Draw scores
        ctx.fillStyle = 'white';
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
    
        if (game.score) {
            ctx.fillText(game.score.p1_name + " :" + game.score.p1.toString(), gameCanvas.width / 4, 50);
            ctx.fillText(game.score.p2.toString() + ": " + game.score.p2_name, (3 * gameCanvas.width) / 4, 50);
        }
    
        if (game.opponent && game.opponent.score !== undefined) {
            ctx.fillText(game.opponent.score.toString(), (3 * gameCanvas.width) / 4, 50);
        }
    }

    static showGameOver(winner: string) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!gameCanvas) return;
        
        const ctx = gameCanvas.getContext('2d');
        if (!ctx) return;
        
        // Slightly darken the screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Show winner
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Game Over`, gameCanvas.width / 2, gameCanvas.height / 2 - 50);
        ctx.fillText(`${winner} wins!`, gameCanvas.width / 2, gameCanvas.height / 2 + 20);
        
        // Add return button
        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return to Lobby';
        returnButton.style.position = 'absolute';
        returnButton.style.left = '50%';
        returnButton.style.top = `${gameCanvas.height / 2}px`;
        returnButton.style.transform = 'translateX(-50%)';
        returnButton.style.padding = '10px 20px';
        returnButton.style.fontSize = '18px';
        returnButton.onclick = () => {
            window.location.reload();
            // Optionally, you can redirect to a specific URL
        };
        
        gameCanvas.parentElement?.appendChild(returnButton);
    }
}