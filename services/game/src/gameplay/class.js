"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.Ball = exports.Paddle = void 0;
var Paddle = /** @class */ (function () {
    function Paddle(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.dx = 0; // Paddle's horizontal speed
    }
    Paddle.prototype.moveUp = function () {
        this.y += this.speed;
    };
    Paddle.prototype.moveDown = function () {
        this.y -= this.speed;
    };
    Paddle.prototype.stop = function () {
        this.dx = 0;
    };
    Paddle.prototype.update = function () {
        this.x += this.dx;
    };
    Paddle.prototype.checkBounds = function (minX, maxX) {
        if (this.x < minX) {
            this.x = minX;
        }
        else if (this.x + this.width > maxX) {
            this.x = maxX - this.width;
        }
    };
    return Paddle;
}());
exports.Paddle = Paddle;
var Ball = /** @class */ (function () {
    function Ball(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.dx = speed;
        this.dy = -speed;
    }
    Ball.prototype.update = function () {
        this.x += this.dx;
        this.y += this.dy;
    };
    Ball.prototype.checkBounds = function (minX, minY, maxX, maxY) {
        if (this.x - this.radius < minX || this.x + this.radius > maxX) {
            this.dx = -this.dx;
        }
        if (this.y - this.radius < minY || this.y + this.radius > maxY) {
            this.dy = -this.dy;
        }
    };
    return Ball;
}());
exports.Ball = Ball;
var player = /** @class */ (function () {
    function player(username, score, paddle) {
        this.username = username;
        this.score = score;
        this.paddle = paddle;
    }
    return player;
}());
var Game = /** @class */ (function () {
    function Game(paddle_1, paddle_2, ball, width, height) {
        this.match = "";
        this.paddle_1 = paddle_1;
        this.paddle_2 = paddle_2;
        this.ball = ball;
        this.score_p1 = 0;
        this.score_p2 = 0;
        this.width = width;
        this.height = height;
        this.mode = "local";
        // Set initial positions and sizes
        this.paddle_1.x = 10;
        this.paddle_1.y = (height - paddle_1.height) / 2;
        this.paddle_2.x = width - paddle_2.width - 10;
        this.paddle_2.y = (height - paddle_2.height) / 2;
        this.ball.x = width / 2;
        this.ball.y = height / 2;
        this.p1 = new player("player1", 0, paddle_1);
        this.p2 = new player("player2", 0, paddle_2);
    }
    Game.prototype.update = function () {
        this.paddle_1.update();
        this.paddle_2.update();
        this.ball.update();
    };
    Game.prototype.checkBounds = function (minX, minY, maxX, maxY) {
        this.ball.checkBounds(minX, minY, maxX, maxY);
    };
    Game.prototype.checkPaddleCollision = function (paddle) {
        if (this.ball.x - this.ball.radius < paddle.x + paddle.width &&
            this.ball.y > paddle.y &&
            this.ball.y < paddle.y + paddle.height) {
            this.ball.dx = -this.ball.dx;
        }
    };
    Game.prototype.sendData = function () {
        var gameState = {
            paddle1: { x: this.paddle_1.x, y: this.paddle_1.y },
            paddle2: { x: this.paddle_2.x, y: this.paddle_2.y },
            ball: { x: this.ball.x, y: this.ball.y },
            score: { p1: this.score_p1, p2: this.score_p2 }
        };
        if (this.p1.ws) {
            this.p1.ws.send(JSON.stringify(gameState));
        }
        if (this.p2.ws) {
            this.p2.ws.send(JSON.stringify(gameState));
        }
    };
    return Game;
}());
exports.Game = Game;
