class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    dx: number;
  
    constructor(x: number, y: number, width: number, height: number, speed: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.dx = 0; // Paddle's horizontal speed
    }

    moveLeft() {
      this.dx = -this.speed;
    }
  
    moveRight() {
      this.dx = this.speed;
    }
  
    stop() {
      this.dx = 0;
    }

    update() {
      this.x += this.dx;
    }
  
    checkBounds(minX: number, maxX: number) {
      if (this.x < minX) {                         
        this.x = minX;
      } else if (this.x + this.width > maxX) {
        this.x = maxX - this.width;
      }
    }-*+
  }

class Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    dx: number;
    dy: number;
  
    constructor(x: number, y: number, radius: number, speed: number) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.speed = speed;
      this.dx = speed;
      this.dy = -speed;
    }

    update() {
      this.x += this.dx;
      this.y += this.dy;
    }
  
    checkBounds(minX: number, minY: number, maxX: number, maxY: number) {
      if (this.x - this.radius < minX || this.x + this.radius > maxX) {
        this.dx = -this.dx;
      }
      if (this.y - this.radius < minY || this.y + this.radius > maxY) {
        this.dy = -this.dy;
      }
    }
  }

class player {
    username: string;
    score: number;
    paddle: Paddle;
    constructor(username: string, score: number, paddle: Paddle) {
        this.username = username;
        this.score = score;
        this.paddle = paddle;
    }
}

class Game {
    paddle_1: Paddle;
    paddle_2: Paddle;
    p1: player;
    p2: player;
    ball: Ball;
    score_p1: number;
    score_p2: number;
    width: number;
    height: number;

    constructor(paddle_1: Paddle, paddle_2: Paddle, ball: Ball, width: number, height: number) {
        this.paddle_1 = paddle_1;
        this.paddle_2 = paddle_2;
        this.ball = ball;
        this.score_p1 = 0;
        this.score_p2 = 0;
        this.width = width;
        this.height = height;

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
  }

export { Paddle, Ball, Game };