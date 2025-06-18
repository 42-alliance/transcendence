import { GameUI } from './GameUI.js';
import { FontHelper } from './FontHelper.js';

// Précharger la police
FontHelper.loadFonts().then(() => {
    console.log('Police Mighty Souly chargée avec succès');
}).catch(err => {
    console.warn('Échec du chargement de la police Mighty Souly:', err);
});



export class GameRenderer {

    static renderGame(gameState: any) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        GameUI.hideSpinner();
        GameUI.hideGameButtons();
        GameUI.hideDifficultyButtons();
        //hide gamearea
        GameUI.hideGameArea();

       /// GameUI.hideOptionButtons();
        if (!gameCanvas) return;
        const ctx = gameCanvas.getContext('2d');
        if (!ctx || !gameState) return;
    
        // Clear the canvas
        ctx.fillStyle = '#091053';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        const game = gameState;
    
        // Draw the net
        ctx.fillStyle = 'white';
        ctx.imageSmoothingQuality = 'high';
        const netX = (gameCanvas.width - 2) / 2;
        for (let i = 0; i <= gameCanvas.height; i += 15) {
            ctx.fillRect(netX, i, 4, 20);
        }
        if (game.paddle1) {
            ctx.fillStyle = '#b9d6f2';
            ctx.fillRect(
                game.paddle1.x , 
                game.paddle1.y , 
                game.paddle1.width , 
                game.paddle1.height 
            );
        }
    
        if (game.paddle2) {
            ctx.fillStyle = '#b9d6f2';
            ctx.fillRect(
                game.paddle2.x ,
                game.paddle2.y, 
                game.paddle2.width ,
                game.paddle2.height 
            );
        }
    
        if (game.ball) {
            // Save the current canvas state
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#CAFE48';
            ctx.beginPath();
            ctx.arc(
            game.ball.x, 
            game.ball.y,
            game.ball.radius, 
            0,
            Math.PI * 2
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    
        // Draw scores
        ctx.fillStyle = 'white';
        ctx.font = FontHelper.getScoreFont();
        ctx.textAlign = 'center';
    
        if (game.score) {
            ctx.fillText(game.score.p1_name, gameCanvas.width / 4, 50);
            ctx.fillText(game.score.p2_name.toString() , (3 * gameCanvas.width) / 4, 50);
            
            ctx.font = `180px ${FontHelper.MIGHTY_SOULY_FONT}`;
            ctx.fillText(game.score.p1.toString(), gameCanvas.width / 4, 300, 200);
            ctx.fillText(game.score.p2.toString(), (3 * gameCanvas.width) / 4, 300, 200);
        }
    
        if (game.opponent && game.opponent.score !== undefined) {
            ctx.fillText(game.opponent.score.toString(), (3 * gameCanvas.width) / 4, 50);
        }
    }


    static showGameFinished(data: any) {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        gameCanvas.innerHTML = '';
        const resultContainer = GameRenderer.createResultContainer();

        const gameInstance = (window as any).gameInstance;
        const currentUser = GameRenderer.getCurrentUser(gameInstance);

        const userId = String(currentUser.id);
        console.log("Current user ID:", userId);
        console.log("Winner user ID:", data.winner);
        console.log("Game mode:", data.mode);

        if (data.mode === 'local' || data.mode === 'ia') {
            GameRenderer.handleLocalOrAIMode(resultContainer, data);
        } else {
            GameRenderer.handleOnlineMode(resultContainer, data, userId);
        }

        document.body.appendChild(resultContainer);
    }

    private static createResultContainer(): HTMLDivElement {
        const resultContainer = document.createElement('div');
        resultContainer.id = 'game-result';
        resultContainer.style.position = 'fixed';
        resultContainer.style.width = '300px';
        resultContainer.style.height = '300px';
        resultContainer.style.top = '50%';
        resultContainer.style.left = '50%';
        resultContainer.style.transform = 'translate(-50%, -50%)';
        resultContainer.style.backgroundColor = '';
        resultContainer.style.padding = '20px';
        resultContainer.style.borderRadius = '10px';
        resultContainer.style.textAlign = 'center';
        resultContainer.style.color = 'white';
        resultContainer.style.zIndex = '1000';
        resultContainer.style.fontFamily = FontHelper.MIGHTY_SOULY_FONT;
        return resultContainer;
    }

    private static getCurrentUser(gameInstance: any): any {
        if (gameInstance && typeof gameInstance.getUser === 'function') {
            console.log("Retrieved user from Game instance:", gameInstance.getUser());
            return gameInstance.getUser();
        } else {
            console.warn("Game instance not found, using default user");
            return { id: "player1", name: "Player 1" };
        }
    }

    private static handleLocalOrAIMode(resultContainer: HTMLDivElement, data: any): void {
        const title = document.createElement('h2');
        title.textContent = `${data.winner_name} wins!`;
        title.style.color = '#4CAF50';
        title.style.marginBottom = '60px';
        resultContainer.style.top = '30%';
        FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE);
        resultContainer.appendChild(title);

        const button = GameRenderer.createReturnToLobbyButton(resultContainer);
        resultContainer.appendChild(button);
    }

    private static handleOnlineMode(resultContainer: HTMLDivElement, data: any, userId: string): void {
        const isWinner = data.winner.toString() === userId.toString();

        const title = document.createElement('h2');
        title.textContent = isWinner ? "Vous avez gagné !" : "Vous avez perdu !";
        title.style.color = isWinner ? '#4CAF50' : '#F44336';
        FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE);
        resultContainer.appendChild(title);

        const message = document.createElement('p');
        if (data.disconnection) {
            message.textContent = `Votre adversaire (${data.disconnected_player}) s'est déconnecté !`;
            message.style.color = '#FFC107';
        } else {
            message.textContent = `Score final: ${data.score.p1} - ${data.score.p2}`;
            if (data.winner_name) {
                message.textContent += ` | Gagnant: ${data.winner_name}`;
            }
        }
        message.style.marginBottom = '60px';
        FontHelper.applyMightySoulyFont(message, FontHelper.TEXT_FONT_SIZE);
        resultContainer.appendChild(message);

        const button = GameRenderer.createReturnToLobbyButton(resultContainer);
        resultContainer.appendChild(button);
    }

    private static createReturnToLobbyButton(resultContainer: HTMLDivElement): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = 'Retourner au lobby';
        button.style.width = '100%';
        button.style.padding = '20px';
        button.style.marginTop = '20px';

        button.style.backgroundColor = '#B9D6F2';
        button.style.color = '#091053';
        button.style.cursor = 'pointer';
        FontHelper.applyMightySoulyFont(button, FontHelper.BUTTON_FONT_SIZE);
        button.onclick = () => {
            const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
            if (gameCanvas) {
                const gameContext = gameCanvas.getContext('2d');
                if (gameContext) {
                    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
                }
            }
            
            resultContainer.remove();
            GameUI.showLobbyButtons();
        };
        return button;
    }
}
