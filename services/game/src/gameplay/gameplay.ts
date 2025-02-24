import { compileFunction } from "vm";
import { match, session, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";

let width = 800;
let height = 600;

let sessions: { game: Game }[] = [];

async function HandleMatch() {
    // if a match is added to the session
    if (session.length > 0) {
        console.log(session);
        console.log("Creating game");
        let paddle_1 = new Paddle(10, 10, 100, 20, 10);
        let paddle_2 = new Paddle(width - 10 , 10, 100, 20, 10);
        let ball = new Ball(width / 2, height / 2, 10, 5);
        let game = new Game(paddle_1, paddle_2, ball, width, height);
        game.mode = session[0].match.players[0].type;
        if (session[0].match.players.length === 2) {
            game.p1.username = session[0].match.players[0].username;
            game.p2.username = session[0].match.players[1].username;
            game.match = session[0].match.players[0].username + " vs " + session[0].match.players[1].username;
            game.p1.ws = session[0].match.players[0].socket;
            game.p2.ws = session[0].match.players[1].socket;
            if (game.p1.ws.readyState !== wss.close && game.p2.ws.readyState !== wss.close) {
                game.p1.ws.send(JSON.stringify({ type: 'game_start', player: game.p1.username }));
                game.p2.ws.send(JSON.stringify({ type: 'game_start', player: game.p2.username }));
            }
        }
        else {
            game.p1.username = "player1";
            game.p2.username = "player2";
            game.p1.ws = session[0].match.players[0].socket;
            game.p2.ws = session[0].match.players[0].socket;
            if (game.p1.ws.readyState !== wss.close) {
                game.p1.ws.send(JSON.stringify({ type: 'game_start', player: game.p1.username }));
                console.log("Game start message sent to player1");
            }
        }
        if (game)
        {
            console.log("Game created");
            sessions.push({ game: game });
            sessions.forEach((session) => {
                console.log(session);
            });
            session.shift();
        }
        else
            console.error("Error creating game");
    }
}

async function UpdateGame() {
    sessions.forEach((session) => {
        session.game.update();
        session.game.checkBounds(0, 0, width, height);
        if (session.game.ball.x - session.game.ball.radius < session.game.paddle_1.x + session.game.paddle_1.width &&
            session.game.ball.y > session.game.paddle_1.y &&
            session.game.ball.y < session.game.paddle_1.y + session.game.paddle_1.height) {
            session.game.ball.dx = -session.game.ball.dx;
        }
        if (session.game.ball.x + session.game.ball.radius > session.game.paddle_2.x &&
            session.game.ball.y > session.game.paddle_2.y &&
            session.game.ball.y < session.game.paddle_2.y + session.game.paddle_2.height) {
            session.game.ball.dx = -session.game.ball.dx;
        }
        if (session.game.ball.x - session.game.ball.radius < 0) {
            session.game.score_p2++;
            session.game.ball.x = width / 2;
            session.game.ball.y = height / 2;
            session.game.ball.dx = -session.game.ball.dx;
        }
        if (session.game.ball.x + session.game.ball.radius > width) {
            session.game.score_p1++;
            session.game.ball.x = width / 2;
            session.game.ball.y = height / 2;
            session.game.ball.dx = -session.game.ball.dx;
        }
        if (session.game.ball.y - session.game.ball.radius < 0 || session.game.ball.y + session.game.ball.radius > height) {
            session.game.ball.dy = -session.game.ball.dy;
        }
        if (session.game.score_p1 === 5) {
            session.game.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p1.username }));
            session.game.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p1.username }));
           // sessions.splice(sessions.indexOf(session), 1);
        }
        if (session.game.score_p2 === 5) {
            session.game.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p2.username }));
            session.game.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p2.username }));
           // sessions.splice(sessions.indexOf(session), 1);
        }
        session.game.sendData();
    });
}

async function handleKeyCommand()
{
    wss.on('message', (message: string) => {
        let data = JSON.parse(message);
        sessions.forEach((session) => {
            if (data.type === 'key_command' && data.username === session.game.p1.username) {
                if (data.key === 'ArrowUp') {
                    session.game.paddle_1.moveUp();
                }
                if (data.key === 'ArrowDown') {
                    session.game.paddle_1.moveDown();
                }
            }
            if (data.type === 'key_command' && data.username === session.game.p2.username) {
                if (data.key === 'ArrowUp') {
                    session.game.paddle_2.moveUp();
                }
                if (data.key === 'ArrowDown') {
                    session.game.paddle_2.moveDown();
                }
            }
        });
    });
}

export async function GameLoop() {
    await HandleMatch();
    await UpdateGame();
    await handleKeyCommand();
    setTimeout(GameLoop, 1000 / 60);
}   


