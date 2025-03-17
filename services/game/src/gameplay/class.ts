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

    // Fix movement directions (up should decrease y, down should increase y)
    moveUp() {
      this.y -= this.speed; // Changed from += to -=
    }

    moveDown() {
      this.y += this.speed; // Changed from -= to +=
    }
  
    stop() {
      this.dx = 0;
    }

    update() {
      this.x += this.dx;
    }
  
    checkBounds(minX: number, maxX: number, minY: number, maxY: number) {
      if (this.x < minX) {                         
        this.x = minX;
      } else if (this.x + this.width > maxX) {
        this.x = maxX - this.width;
      }
      // Add vertical bounds checking
      if (this.y < minY) {
        this.y = minY;
      } else if (this.y + this.height > maxY) {
        this.y = maxY - this.height;
      }
    }
  }

// Update the Ball constructor
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
        
        // Initial angle should be more horizontal than vertical for better gameplay
        const angle = (Math.random() * Math.PI/4) - Math.PI/8; // Small angle variation
        this.dx = speed * Math.cos(angle);
        this.dy = speed * Math.sin(angle) * 0.5; // Reduce vertical component
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
    ws: any;
    constructor(username: string, score: number, paddle: Paddle) {
        this.username = username;
        this.score = score;
        this.paddle = paddle;
    }
}

class Game {
    match: string = "";
    paddle_1: Paddle;
    paddle_2: Paddle;
    p1: player;
    p2: player;
    ball: Ball;
    score_p1: number;
    score_p2: number;
    width: number;
    height: number;
    mode: string;
    paddleWidth: number;
    paddleHeight: number;
    ballRadius: number;

    constructor(width: number, height: number) {
        // Calculate dimensions relative to screen size
        this.width = width;
        this.height = height;
        
        // Adjust paddle dimensions for better gameplay
        this.paddleWidth = Math.floor(width * 0.015); // 1.5% of screen width
        this.paddleHeight = Math.floor(height * 0.20); // 15% of screen height (shorter paddles)
        
        // Make ball slightly bigger for better visibility and easier hits
        this.ballRadius = Math.floor(Math.min(width, height) * 0.0155); // 1.25% of smaller dimension
        
        // Adjust speeds - ball should move faster than paddles for good gameplay
        const paddleSpeed = Math.floor(height * 0.04); // Slower paddle speed
        const ballSpeed = Math.floor(width * 0.01); // Slightly faster ball speed
        
        // Create game objects with relative dimensions
        this.paddle_1 = new Paddle(
            this.paddleWidth, 
            (height - this.paddleHeight) / 2, 
            this.paddleWidth, 
            this.paddleHeight, 
            paddleSpeed
        );
        
        this.paddle_2 = new Paddle(
            width - this.paddleWidth * 2, 
            (height - this.paddleHeight) / 2, 
            this.paddleWidth, 
            this.paddleHeight, 
            paddleSpeed
        );
        
        this.ball = new Ball(width / 2, height / 2, this.ballRadius, ballSpeed);
        
        this.score_p1 = 0;
        this.score_p2 = 0;
        this.mode = "local";
        this.p1 = new player("player1", 0, this.paddle_1);
        this.p2 = new player("player2", 0, this.paddle_2);
    }

    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        const angle = (Math.random() * Math.PI/4) - Math.PI/8; // Small random angle variation
        // Alternate ball direction based on who scored
        const direction = this.ball.dx > 0 ? -1 : 1;
        const speed = Math.max(Math.abs(this.ball.dx), Math.abs(this.ball.dy));
        // Set new velocity based on original ball speed from constructor
        this.ball.dx = direction * speed * Math.cos(angle);
        this.ball.dy = speed * Math.sin(angle);
    }

    update() {
        // Store previous positions for collision detection
        const prevBallX = this.ball.x;
        const prevBallY = this.ball.y;
        
        // Update paddle positions first
        this.paddle_1.update();
        this.paddle_2.update();
        
        // Check paddle bounds
        this.paddle_1.checkBounds(0, this.width, 0, this.height);
        this.paddle_2.checkBounds(0, this.width, 0, this.height);
        
        // Check for collisions BEFORE updating ball position
        this.checkPaddleCollision(this.paddle_1);
        this.checkPaddleCollision(this.paddle_2);
        
        // Then update ball position
        this.ball.update();
        
        // Check wall collisions
        this.checkWallCollisions();
    }
    
    checkWallCollisions() {
        // Horizontal bounds - scoring
        if (this.ball.x - this.ball.radius < 0) {
            this.score_p2++;
            this.resetBall();
        } else if (this.ball.x + this.ball.radius > this.width) {
            this.score_p1++;
            this.resetBall();
        }
        
        // Vertical bounds - bounce with more realistic physics
        if (this.ball.y - this.ball.radius < 0) {
            // Ceiling collision
            this.ball.dy = -this.ball.dy * 0.9; // 10% energy loss on bounce
            // Ensure the ball is positioned correctly
            this.ball.y = this.ball.radius + 1;
            
            // Log for debugging
            console.log("Ceiling bounce, new velocity:", this.ball.dy);
        } else if (this.ball.y + this.ball.radius > this.height) {
            // Floor collision
            this.ball.dy = -this.ball.dy * 0.9; // 10% energy loss on bounce
            // Ensure the ball is positioned correctly
            this.ball.y = this.height - this.ball.radius - 1;
            
            // Log for debugging
            console.log("Floor bounce, new velocity:", this.ball.dy);
        }
    }
    
    checkBounds() {
        // This method is now split into checkWallCollisions
        this.checkWallCollisions();
    }
    
    checkPaddleCollision(paddle: Paddle) {
        // Use swept collision detection for more reliable collision handling
        // This tracks the ball's path between frames to prevent tunneling
        
        // Get the ball's current and next positions
        const ballCurrX = this.ball.x;
        const ballCurrY = this.ball.y;
        const ballNextX = this.ball.x + this.ball.dx;
        const ballNextY = this.ball.y + this.ball.dy;
        
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;
        
        // Check if the ball is moving toward the paddle
        const movingTowardPaddle = 
            (paddle === this.paddle_1 && this.ball.dx < 0) || 
            (paddle === this.paddle_2 && this.ball.dx > 0);
            
        // Only check collision if ball is moving toward paddle
        if (!movingTowardPaddle) return;
        
        // Calculate the closest point on the line segment between current and next positions
        // to the paddle rectangle
        const closestX = Math.max(paddleLeft, Math.min(ballCurrX, paddleRight));
        const closestY = Math.max(paddleTop, Math.min(ballCurrY, paddleBottom));
        
        // Calculate distance from ball center to closest point
        const distX = ballCurrX - closestX;
        const distY = ballCurrY - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Check if any part of the trajectory intersects the paddle
        // We'll use a simplified line-rectangle intersection test
        
        // First check if start or end points are inside paddle
        const ballRadius = this.ball.radius;
        const startInPaddle = 
            ballCurrX + ballRadius > paddleLeft && 
            ballCurrX - ballRadius < paddleRight &&
            ballCurrY + ballRadius > paddleTop &&
            ballCurrY - ballRadius < paddleBottom;
        
        const endInPaddle = 
            ballNextX + ballRadius > paddleLeft && 
            ballNextX - ballRadius < paddleRight &&
            ballNextY + ballRadius > paddleTop &&
            ballNextY - ballRadius < paddleBottom;
        
        // Then check if the trajectory crosses the paddle
        let collision = startInPaddle || endInPaddle;
        
        // If no collision yet, check if the line segment crosses paddle boundaries
        if (!collision) {
            // Line representation: p + t*v where p is starting point, v is velocity, t is parameter
            const vx = this.ball.dx;
            const vy = this.ball.dy;
            
            // Check each edge of the paddle rectangle
            // Left edge
            if (vx !== 0) {
                const t = (paddleLeft - ballRadius - ballCurrX) / vx;
                if (t >= 0 && t <= 1) {
                    const y = ballCurrY + t * vy;
                    if (y + ballRadius >= paddleTop && y - ballRadius <= paddleBottom) {
                        collision = true;
                    }
                }
            }
            
            // Right edge
            if (vx !== 0 && !collision) {
                const t = (paddleRight + ballRadius - ballCurrX) / vx;
                if (t >= 0 && t <= 1) {
                    const y = ballCurrY + t * vy;
                    if (y + ballRadius >= paddleTop && y - ballRadius <= paddleBottom) {
                        collision = true;
                    }
                }
            }
            
            // Top edge
            if (vy !== 0 && !collision) {
                const t = (paddleTop - ballRadius - ballCurrY) / vy;
                if (t >= 0 && t <= 1) {
                    const x = ballCurrX + t * vx;
                    if (x + ballRadius >= paddleLeft && x - ballRadius <= paddleRight) {
                        collision = true;
                    }
                }
            }
            
            // Bottom edge
            if (vy !== 0 && !collision) {
                const t = (paddleBottom + ballRadius - ballCurrY) / vy;
                if (t >= 0 && t <= 1) {
                    const x = ballCurrX + t * vx;
                    if (x + ballRadius >= paddleLeft && x - ballRadius <= paddleRight) {
                        collision = true;
                    }
                }
            }
        }
        
        if (collision) {
            // Log collision for debugging
            console.log(`Collision detected with paddle at x=${paddle.x}, y=${paddle.y}`);
            
            // Calculate bounce angle based on where ball hits paddle
            const hitPosition = (this.ball.y - (paddle.y + paddle.height/2)) / (paddle.height/2);
            const bounceAngle = hitPosition * (Math.PI/3); // Max 60-degree angle
            
            // Determine direction based on which paddle was hit
            const direction = (paddle === this.paddle_1) ? 1 : -1;
            
            // Calculate speed, preserving current magnitude
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            
            // Cap the speed to prevent tunneling
            const maxSpeed = Math.max(this.width, this.height) * 0.02; // 2% of game size per frame max
            const cappedSpeed = Math.min(speed, maxSpeed);
            
            // Set new velocity components
            this.ball.dx = direction * cappedSpeed * Math.cos(bounceAngle);
            this.ball.dy = cappedSpeed * Math.sin(bounceAngle);
            
            // Ensure ball doesn't get stuck in paddle by moving it outside paddle bounds
            if (paddle === this.paddle_1) {
                this.ball.x = paddleRight + this.ball.radius + 1;
            } else {
                this.ball.x = paddleLeft - this.ball.radius - 1;
            }
        }
    }

    sendData() {
      const gameState = {
        paddle1: { x: this.paddle_1.x, y: this.paddle_1.y },
        paddle2: { x: this.paddle_2.x, y: this.paddle_2.y },
        ball: { x: this.ball.x, y: this.ball.y },
        score: { p1: this.score_p1, p2: this.score_p2 }
      };

      if (this.p1.ws) {
        this.p1.ws.send(JSON.stringify({ type: 'update', data : gameState}));
      }
      if (this.p2.ws) {
        this.p2.ws.send(JSON.stringify({ type: 'update', data : gameState}));
      }
    }
}


export { Paddle, Ball, Game };