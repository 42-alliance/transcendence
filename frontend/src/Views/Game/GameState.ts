export class GameState {
    static initializeGame(gameCanvas: HTMLCanvasElement) {
        console.log("Initializing game...");
        
        if (gameCanvas) {
            const ctx = gameCanvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            }
        }
        
        const paddle_1 = {
            x: 10,
            y: 10,
            width: 10,
            height: 100,
            color: 'white',
            dy: 0
        };
        
        const paddle_2 = {
            x: 10,
            y: 10,
            width: 10,
            height: 100,
            color: 'white',
            dy: 0
        };
        
        const ball = {
            x: 10,
            y: 10,
            dx: 4,
            dy: 4,
            size: 5,
            color: 'white'
        };
        
        const net = {
            x: (gameCanvas.width - 2) / 2,
            y: 0,
            height: 10,
            width: 2,
            color: 'white'
        };
        
        const user = {
            x: 10,
            y: gameCanvas.height / 2 - 50,
            width: 10,
            height: 100,
            color: 'white',
            score: 0
        };
        
        const com = {
            x: gameCanvas.width - 20,
            y: gameCanvas.height / 2 - 50,
            width: 10,
            height: 100,
            color: 'white',
            score: 0
        };
        
        const game = {
            gameCanvas,
            ctx: gameCanvas.getContext('2d'),
            paddle_1,
            paddle_2,
            ball,
            net,
            user,
            com
        };
        
        // Draw initial state
        if (game.ctx) {
            // Draw the net
            game.ctx.fillStyle = game.net.color;
            for (let i = 0; i <= game.gameCanvas.height; i += 15) {
                game.ctx.fillRect(game.net.x, game.net.y + i, game.net.width, game.net.height);
            }

            // Draw the user paddle
            game.ctx.fillStyle = game.user.color;
            game.ctx.fillRect(game.user.x, game.user.y, game.user.width, game.user.height);

            // Draw the computer paddle
            game.ctx.fillStyle = game.com.color;
            game.ctx.fillRect(game.com.x, game.com.y, game.com.width, game.com.height);

            // Draw the ball
            game.ctx.fillStyle = game.ball.color;
            game.ctx.beginPath();
            game.ctx.arc(game.ball.x, game.ball.y, game.ball.size, 0, Math.PI * 2);
            game.ctx.closePath();
            game.ctx.fill();
        }
        
        return game;
    }
}