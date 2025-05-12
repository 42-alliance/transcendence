import { userInfo } from 'os';
import Game from './Game.js';
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
       /// GameUI.hideOptionButtons();
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
        // Cacher le canvas de jeu
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        // if (gameCanvas) gameCanvas.style.display = 'none';
    
        // Créer l'élément de résultat
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
        resultContainer.style.zIndex = '1000'; // S'assurer qu'il est au-dessus de tout
    
        const gameInstance = (window as any).gameInstance;
    
        let currentUser;
        if (gameInstance && typeof gameInstance.getUser === 'function') {
            currentUser = gameInstance.getUser();
            console.log("Retrieved user from Game instance:", currentUser);
        } else {
            // Fallback si l'instance n'est pas disponible
            console.warn("Game instance not found, using default user");
            currentUser = { id: "player1", name: "Player 1" };
        }
    
        // Convertir l'ID en string pour la comparaison (car data.winner pourrait être une string)
        const userId = String(currentUser.id);
        console.log("Current user ID:", userId);
        console.log("winner user_ID", data.winner);
        console.log("game_mode", data.mode);

        if (data.mode === 'local' || data.mode === 'ia') {
            console.log("Local or AI mode detected");
            const title = document.createElement('h2');
            title.textContent = `${data.winner_name} wins!`;
            title.style.color = '#4CAF50';
            resultContainer.appendChild(title);

            const button = document.createElement('button');
            button.textContent = 'Retourner au lobby';
            button.style.padding = '50px 40px';
            button.style.backgroundColor = '#4a4a8f';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.onclick = () => {
                // Clear the game
                const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
                if (gameCanvas) {
                    const gameContext = gameCanvas.getContext('2d');
                    if (gameContext) {
                        gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
                    }
                    gameCanvas.style.display = 'block';
                }
                resultContainer.remove();
                GameUI.showLobbyButtons();
            };

            resultContainer.appendChild(button);
            document.body.appendChild(resultContainer);
            return;
        } else {
            const isWinner = data.winner.toString() === userId.toString();
            
            // Titre du résultat
            const title = document.createElement('h2');
            title.textContent = isWinner ? "Vous avez gagné !" : "Vous avez perdu !";
            title.style.color = isWinner ? '#4CAF50' : '#F44336';
        
            // Message spécial pour la déconnexion
            let message = document.createElement('p');
            if (data.disconnection) {
                message.textContent = `Votre adversaire (${data.disconnected_player}) s'est déconnecté !`;
                message.style.color = '#FFC107';
            } else {
                message.textContent = `Score final: ${data.score.p1} - ${data.score.p2}`;
                if (data.winner_name) {
                    message.textContent += ` | Gagnant: ${data.winner_name}`;
                }
            }
            message.style.marginBottom = '20px';
            resultContainer.appendChild(title);

        }

        // Bouton pour retourner au lobby
        const button = document.createElement('button');
        button.textContent = 'Retourner au lobby';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#4a4a8f';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.onclick = () => {
            //clear the game
            const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
            const gameContext = gameCanvas.getContext('2d');
            if (gameContext) {
                gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            }
            resultContainer.remove();
            if (gameCanvas) gameCanvas.style.display = 'block';
            GameUI.showLobbyButtons();
        
        };
    
        if (data.mode !== 'tournament') {
            resultContainer.appendChild(button);
        } else {
            // En mode tournoi, le comportement dépend si on est gagnant ou perdant
            const isWinner = data.winner.toString() === userId.toString();
            
            if (isWinner) {
                // Pour le gagnant - afficher un message d'attente
                const waitingMessage = document.createElement('div');
                waitingMessage.innerHTML = `
                    <h3>Vous passez au tour suivant!</h3>
                    <p>Veuillez patienter pendant que les autres matchs se terminent...</p>
                    <div class="loading-spinner" style="margin: 20px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite;"></div>
                `;
                
                // Ajouter le style de l'animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
                
                resultContainer.appendChild(waitingMessage);
                
                // Pour les gagnants de tournoi: le résultat sera automatiquement nettoyé après 5 secondes
                // afin qu'ils soient prêts pour la finale
                setTimeout(() => {
                    if (resultContainer && resultContainer.parentNode) {
                        resultContainer.remove();
                        
                        // S'assurer que le canvas est réinitialisé pour la prochaine partie
                        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
                        if (gameCanvas) {
                            const ctx = gameCanvas.getContext('2d');
                            if (ctx) {
                                ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
                            }
                            gameCanvas.style.display = 'block';
                        }
                    }
                }, 5000);
            } else {
                // Pour le perdant - afficher le bouton de retour au lobby
                const defeatMessage = document.createElement('p');
                defeatMessage.textContent = "Vous êtes éliminé du tournoi.";
                defeatMessage.style.color = '#F44336';
                defeatMessage.style.marginBottom = '20px';
                
                resultContainer.appendChild(defeatMessage);
                resultContainer.appendChild(button);
            }
        }
    }
}

