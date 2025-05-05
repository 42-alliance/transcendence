import e from "cors";

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
    mapPlayers: Map<string, player> = new Map();
    uuid_room: string = "";


    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        // Calculate scaling factors
      
        // Initialize paddle and ball dimensions
        this.paddleWidth = 15; // Fixed paddle width
        this.paddleHeight = 100; // Fixed paddle height
        this.ballRadius = 10; // Fixed ball radius

        const paddleSpeed = 8; // Fixed paddle speed
        const ballSpeed = 7; // Fixed ball speed

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
        this.ball.speed = 4; // Reset ball speed
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
            this.updateScore('p2'); // Player 2 marque un point
        } else if (this.ball.x + this.ball.radius > this.width) {
            this.updateScore('p1'); // Player 1 marque un point
        }
    
        // Vertical bounds - bounce
        if (this.ball.y - this.ball.radius < 0) {
            // Ajuster la position pour éviter que la balle ne sorte des limites
            this.ball.y = this.ball.radius;
            this.ball.dy = -this.ball.dy * 0.9; // Réduction de la vitesse verticale
        } else if (this.ball.y + this.ball.radius > this.height) {
            // Ajuster la position pour éviter que la balle ne sorte des limites
            this.ball.y = this.height - this.ball.radius;
            this.ball.dy = -this.ball.dy * 0.9; // Réduction de la vitesse verticale
        }
    }
    
    checkBounds() {
        // This method is now split into checkWallCollisions
        this.checkWallCollisions();
        this.checkPaddleCollision(this.paddle_1);
        this.checkPaddleCollision(this.paddle_2);
    }
    checkWinner() {
        if (this.score_p2 >= 5) {
            if (this.mode === "ia") {
                console.log(`Game finished. Winner: ${this.p2.username} (IA)`);
                this.endGame(this.p2.username); // Terminer le jeu sans envoyer de message WebSocket pour l'IA
            } else if (this.p2.ws) {
                this.p2.ws.send(JSON.stringify({
                    type: 'game_finished',
                    data: {
                        winner: this.p2.username,
                        score: {
                            p1: this.score_p1,
                            p2: this.score_p2,
                        },
                        mode: this.mode,
                    },
                }));
            }
            return this.p2.username; // Retourner le nom du gagnant
        } else if (this.score_p1 >= 5) {
            if (this.p1.ws) {
                this.p1.ws.send(JSON.stringify({
                    type: 'game_finished',
                    data: {
                        winner: this.p1.username,
                        score: {
                            p1: this.score_p1,
                            p2: this.score_p2,
                        },
                        mode: this.mode,
                    },
                }));
            }
            if (this.mode !== "ia" && this.p2.ws) {
                this.p2.ws.send(JSON.stringify({
                    type: 'game_finished',
                    data: {
                        winner: this.p1.username,
                        score: {
                            p1: this.score_p1,
                            p2: this.score_p2,
                        },
                        mode: this.mode,
                    },
                }));
            }
            return this.p1.username; // Retourner le nom du gagnant
        }
        return null; // Pas encore de gagnant
    }

    handlePaddleCollision(paddle: Paddle) {
        const relativeIntersectY = (this.ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        const bounceAngle = relativeIntersectY * (Math.PI / 4); // Limiter l'angle à 45 degrés
        const direction = this.ball.dx > 0 ? -1 : 1;

        this.ball.dx = direction * this.ball.speed * Math.cos(bounceAngle);
        this.ball.dy = this.ball.speed * Math.sin(bounceAngle);

        // Augmenter la vitesse de la balle après chaque collision
        this.ball.speed *= 1.1;
    }
    
    checkPaddleCollision(paddle: Paddle) {
        // Use swept collision detection for more reliable collision handling
        // This tracks the ball's path between frames to prevent tunneling
        
        // Get the ball's current and next positions
        const nextX = this.ball.x + this.ball.dx;
        const nextY = this.ball.y + this.ball.dy;
        if (this.ball.dx > 0 && nextX + this.ball.radius > paddle.x && this.ball.x - this.ball.radius < paddle.x + paddle.width && nextY > paddle.y && this.ball.y < paddle.y + paddle.height) {
            // Ball is moving right and collides with left paddle edge
            this.handlePaddleCollision(paddle);
        }
        else if (this.ball.dx < 0 && nextX - this.ball.radius < paddle.x + paddle.width && this.ball.x + this.ball.radius > paddle.x && nextY > paddle.y && this.ball.y < paddle.y + paddle.height) {
            // Ball is moving left and collides with right paddle edge
            this.handlePaddleCollision(paddle);
        }
    }  
    
    updateScore(player: 'p1' | 'p2') {
        if (player === 'p1') {
            this.score_p1++;
        } else {
            this.score_p2++;
        }
    
        // Vérifier si un joueur a gagné
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else {
            this.resetBall(); // Réinitialiser la balle si personne n'a encore gagné
        }
    }
    
    endGame(winner: string) {
        const gameFinishedMessage = {
            type: 'game_finished',
            data: {
                winner: winner,
                score: {
                    p1: this.score_p1,
                    p2: this.score_p2,
                },
                mode: this.mode,
            },
        };
    
        try {
            if (this.p1.ws) {
                this.p1.ws.send(JSON.stringify(gameFinishedMessage));
            }
            if (this.p2.ws) {
                this.p2.ws.send(JSON.stringify(gameFinishedMessage));
            }
        } catch (error) {
            console.error('Error sending game_finished message:', error);
        }
    }

    handleDisconnection(player: 'p1' | 'p2') {
        const winner = player === 'p1' ? this.p2.username : this.p1.username;
        this.endGame(winner);
    }

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

    synchronizeState() {
        const gameState = {
            paddle1: { x: this.paddle_1.x, y: this.paddle_1.y },
            paddle2: { x: this.paddle_2.x, y: this.paddle_2.y },
            ball: { x: this.ball.x, y: this.ball.y },
            score: { p1: this.score_p1, p2: this.score_p2 },
        };
    
        try {
            if (this.p1.ws) {
                this.p1.ws.send(JSON.stringify({ type: 'game_state', data: gameState }));
            }
            if (this.p2.ws) {
                this.p2.ws.send(JSON.stringify({ type: 'game_state', data: gameState }));
            }
        } catch (error) {
            console.error('Error sending game state:', error);
        }
    }

    logEvent(event: string, data: any) {
        console.log(`[Game Event] ${event}:`, data);
    }
}



export { Paddle, Ball, Game };

