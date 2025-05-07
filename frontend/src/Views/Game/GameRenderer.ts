import { GameUI } from './GameUI.js'; // Adjust the path as necessary



function DrawCircleScore(ctx: CanvasRenderingContext2D, x: number, y: number, score: number) {
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'white';
        if (i < score) {
            ctx.fill();
        }
        x += 50;
    }
    ctx.closePath();
}


export class GameRenderer {

    static renderGame(gameState: any) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        GameUI.hideSpinner();
        GameUI.hideGameButtons();
        GameUI.hideDifficultyButtons();
        GameUI.hideOptionButtons();
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
            ctx.fillText(game.score.p1_name /*+ " | " + game.score.p1.toString()*/, gameCanvas.width / 4, 50);
            DrawCircleScore(ctx, (gameCanvas.width / 4) - 100, 90, game.score.p1);
            ctx.fillText(game.score.p2_name.toString() /*+ " | " + game.score.p2_name*/, (3 * gameCanvas.width) / 4, 50);
            DrawCircleScore(ctx, ((3 * gameCanvas.width)  / 4) - 100 , 90, game.score.p2);
        }
    
        if (game.opponent && game.opponent.score !== undefined) {
            ctx.fillText(game.opponent.score.toString(), (3 * gameCanvas.width) / 4, 50);
        }
    }


    static showGameFinished(data: any) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!gameCanvas) return;
        
        const ctx = gameCanvas.getContext('2d');
        if (!ctx) return;
        

        // Slightly darken the screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        //data is a object with the winner name
    
        // Show winner
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${data.winner} wins!`, gameCanvas.width / 2, gameCanvas.height / 2 - 40);
        ctx.fillText(`Final Score: ${data.score.p1} - ${data.score.p2}`, gameCanvas.width / 2, gameCanvas.height / 2 + 40);
        
        // Vérifier si un bouton existe déjà et le supprimer
        const existingButton = document.getElementById('return-lobby-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Add return button
        const returnButton = document.createElement('button');
        returnButton.id = 'return-lobby-button'; // Donner un ID au bouton pour le retrouver facilement
        returnButton.textContent = 'Return to Lobby';
        returnButton.style.position = 'absolute';
        returnButton.style.left = '50%';
        returnButton.style.top = `${gameCanvas.height / 2 + 400}px`;
        returnButton.style.transform = 'translateX(-50%)';
        returnButton.style.backgroundColor = 'white';
        returnButton.style.color = 'black';
        returnButton.style.border = 'none';
        returnButton.style.borderRadius = '5px';
        returnButton.style.cursor = 'pointer';
        returnButton.style.zIndex = '1000';
        returnButton.style.padding = '10px 20px';
        returnButton.style.fontSize = '18px';
       
        returnButton.addEventListener('click', function handleClick(e) {
            // Désactiver le bouton immédiatement pour éviter les clics multiples
            returnButton.disabled = true;
            returnButton.style.opacity = '0.5';
            returnButton.style.cursor = 'default';
           
            console.log("Return to lobby button clicked");
            
            // Clear the canvas completely
            if (ctx) {
                ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
                // Redessiner un arrière-plan noir propre
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            }
            
            // Logic to return to the lobby
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                // Garder une référence au canvas avant de vider
                const canvasToKeep = gameCanvas.cloneNode(true);
                gameContainer.innerHTML = ''; // Clear the game area
                gameContainer.appendChild(canvasToKeep); // Remettre un canvas propre
            }
            
            // Supprimer le bouton
            returnButton.removeEventListener('click', handleClick);
            returnButton.remove();
            
            // Afficher les boutons du lobby
            GameUI.showLobbyButtons();
            GameUI.hideSpinner();
            
            // Forcer un rafraîchissement de l'interface
            requestAnimationFrame(() => {
                console.log("Lobby UI refreshed");
            });
        }, { once: true }); // L'option once:true garantit que l'écouteur ne s'exécute qu'une fois
        
        gameCanvas.parentElement?.appendChild(returnButton);
    }
}