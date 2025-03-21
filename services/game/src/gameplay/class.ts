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
    this.height = height ;
    this.speed = speed;
    this.dx = 0;
  }

  moveUp() {
    if (this.y > 0) {
        this.y -= this.speed;
    }
  }

  moveDown() {
    if (this.y + this.height < 800) {
        this.y += this.speed;
    }
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
    if (this.y < minY) {
      this.y = minY;
    } else if (this.y + this.height > maxY) {
      this.y = maxY - this.height;
    }
  }
}

class Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    dx: number;
    dy: number;


    constructor(x: number, y: number, radius: number, speed: number) {
        this.x = x ;
        this.y = y;
        this.radius = radius ; // Scale radius proportionally
        this.speed = speed ; // Speed is scaled based on horizontal dimension

        const angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
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
        this.width = width;
        this.height = height;

        // Calculate scaling factors
      
        // Initialize paddle and ball dimensions
        this.paddleWidth = 15; // Fixed paddle width
        this.paddleHeight = 100; // Fixed paddle height
        this.ballRadius = 20; // Fixed ball radius

        const paddleSpeed = 5; // Fixed paddle speed
        const ballSpeed = 2; // Fixed ball speed

        // Create paddles and ball with scaling
        this.paddle_1 = new Paddle(10, (height - this.paddleHeight) / 2, this.paddleWidth, this.paddleHeight, paddleSpeed);
        this.paddle_2 = new Paddle(
            this.width - this.paddleWidth - 10, // Position paddle_2 at the right edge
            (this.height - this.paddleHeight) / 2, // Center paddle_2 vertically
            this.paddleWidth,
            this.paddleHeight,
            paddleSpeed,
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
        // Update paddle positions first
        this.paddle_1.update();
        this.paddle_2.update();
        
        // Check paddle bounds
        this.paddle_1.checkBounds(0, this.width , 0, this.height );
        this.paddle_2.checkBounds(0, this.width , 0, this.height);
        
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
        } else if (this.ball.x + this.ball.radius > this.width ) {
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
        } else if (this.ball.y + this.ball.radius > this.height ) {
            // Floor collision
            this.ball.dy = -this.ball.dy * 0.9; // 10% energy loss on bounce
            // Ensure the ball is positioned correctly
            this.ball.y = this.height  - this.ball.radius - 1;
            
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
        
        // Check if any part of the trajectory intersects the paddle
        const startInPaddle = 
            ballCurrX + this.ball.radius > paddleLeft && 
            ballCurrX - this.ball.radius < paddleRight &&
            ballCurrY + this.ball.radius > paddleTop &&
            ballCurrY - this.ball.radius < paddleBottom;
        
        const endInPaddle = 
            ballNextX + this.ball.radius > paddleLeft && 
            ballNextX - this.ball.radius < paddleRight &&
            ballNextY + this.ball.radius > paddleTop &&
            ballNextY - this.ball.radius < paddleBottom;
        
        // Then check if the trajectory crosses the paddle
        let collision = startInPaddle || endInPaddle;
        
        // If no collision yet, check if the line segment crosses paddle boundaries
        if (!collision) {
            // Line representation: p + t*v where p is starting point, v is velocity, t is parameter
            const vx = this.ball.dx;
            const vy = this.ball.dy;
            
            // Check each edge of the paddle rectangle
            // Check each edge of the paddle rectangle
            // Left edge
            if (vx !== 0) {
                const t = (paddleLeft - this.ball.radius - ballCurrX) / vx;
                if (t >= 0 && t <= 1) {
                    const y = ballCurrY + t * vy;
                    if (y + this.ball.radius >= paddleTop && y - this.ball.radius <= paddleBottom) {
                        collision = true;
                    }
                }
            }
            
            // Right edge
            if (vx !== 0 && !collision) {
                const t = (paddleRight + this.ball.radius - ballCurrX) / vx;
                if (t >= 0 && t <= 1) {
                    const y = ballCurrY + t * vy;
                    if (y + this.ball.radius >= paddleTop && y - this.ball.radius <= paddleBottom) {
                        collision = true;
                    }
                }
            }
            
            // Top edge
            if (vy !== 0 && !collision) {
                const t = (paddleTop - this.ball.radius - ballCurrY) / vy;
                if (t >= 0 && t <= 1) {
                    const x = ballCurrX + t * vx;
                    if (x + this.ball.radius >= paddleLeft && x - this.ball.radius <= paddleRight) {
                        collision = true;
                    }
                }
            }
            
            // Bottom edge
            if (vy !== 0 && !collision) {
                const t = (paddleBottom + this.ball.radius - ballCurrY) / vy;
                if (t >= 0 && t <= 1) {
                    const x = ballCurrX + t * vx;
                    if (x + this.ball.radius >= paddleLeft && x - this.ball.radius <= paddleRight) {
                        collision = true;
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
    }}

    sendData() {
        const gameState = {
            paddle1: {
                x: this.paddle_1.x , // Unscale x-coordinate
                y: this.paddle_1.y , // Unscale y-coordinate
                width: this.paddle_1.width , // Unscale width
                height: this.paddle_1.height  // Unscale height
            },
            paddle2: {
                x: this.paddle_2.x , // Unscale x-coordinate
                y: this.paddle_2.y , // Unscale y-coordinate
                width: this.paddle_2.width , // Unscale width
                height: this.paddle_2.height  // Unscale height
            },
            ball: {
                x: this.ball.x , // Unscale x-coordinate
                y: this.ball.y , // Unscale y-coordinate
                radius: this.ball.radius // Unscale radius proportionally
            },
            score: {
                p1: this.score_p1,
                p2: this.score_p2,
                p1_name: this.p1.username,
                p2_name: this.p2.username
            },
            width: this.width, // Logical game width
            height: this.height // Logical game height
        };
    
        if (this.p1.ws) {
            this.p1.ws.send(JSON.stringify({ type: 'game_state', data: gameState }));
        }
        if (this.p2.ws) {
            this.p2.ws.send(JSON.stringify({ type: 'game_state', data: gameState }));
        }
    }
}



export { Paddle, Ball, Game };

