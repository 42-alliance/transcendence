import { Game, Paddle, Ball } from "./class.js";

// Types d'IA disponibles
export enum AILevel {
    EASY,      // IA facile - mouvements lents, erreurs fréquentes
    MEDIUM,    // IA moyenne - mouvements normaux, erreurs occasionnelles
    HARD,      // IA difficile - mouvements rapides, peu d'erreurs
    IMPOSSIBLE // IA impossible - presque parfaite, vitesse maximale
}

export class GameAI {
    private readonly REACTION_TIME = {
        [AILevel.EASY]: 2500,      // Temps de réaction beaucoup plus lent (ms)
        [AILevel.MEDIUM]: 1500,    // Ralenti pour être plus facile à battre
        [AILevel.HARD]: 1000,      // Ralenti mais reste un défi
        [AILevel.IMPOSSIBLE]: 800  // Même l'IA impossible est battable maintenant
    };
    
    private readonly PREDICTION_ACCURACY = {
        [AILevel.EASY]: 0.1,      // Seulement 10% de précision
        [AILevel.MEDIUM]: 0.4,    // 40% de précision
        [AILevel.HARD]: 0.7,      // 70% de précision
        [AILevel.IMPOSSIBLE]: 0.9 // 90% précis (pas parfait)
    };
    
    private readonly ERROR_MARGIN = {
        [AILevel.EASY]: 180,      // Marge d'erreur très élevée
        [AILevel.MEDIUM]: 100,    // Erreurs fréquentes
        [AILevel.HARD]: 50,       // Erreurs occasionnelles 
        [AILevel.IMPOSSIBLE]: 20  // Même l'impossible peut faire des erreurs
    };
    
    private readonly AGGRESSION_FACTOR = {
        [AILevel.EASY]: 0.1,      // Presque pas agressif
        [AILevel.MEDIUM]: 0.3,    // Un peu agressif
        [AILevel.HARD]: 0.5,      // Moyennement agressif
        [AILevel.IMPOSSIBLE]: 0.7 // Agressif mais pas trop
    };
    
    // Nouvelle propriété pour faire parfois rater la balle complètement
    private readonly MISS_CHANCE = {
        [AILevel.EASY]: 0.4,      // 40% de chance de rater complètement
        [AILevel.MEDIUM]: 0.25,   // 25% de chance de rater
        [AILevel.HARD]: 0.12,     // 12% de chance de rater
        [AILevel.IMPOSSIBLE]: 0.05 // 5% de chance de rater
    };
    
    // Modifier les délais de mouvement pour réduire les à-coups
    private readonly MOVEMENT_DELAY = {
        [AILevel.EASY]: 30,      // Plus fluide pour l'IA facile
        [AILevel.MEDIUM]: 25,     // Plus fluide pour l'IA moyenne
        [AILevel.HARD]: 22,       // Plus fluide pour l'IA difficile
        [AILevel.IMPOSSIBLE]: 20  // Plus fluide pour l'IA impossible
    };
    
    private game: Game;
    private level: AILevel;
    private lastDecisionTime: number;
    private lastMovementTime: number; // Nouveau: timestamp du dernier mouvement
    private targetY: number | null = null;
    private defensivePosition: number;
    private isAttacking: boolean = false;
    private moveUp: boolean = false;
    private moveDown: boolean = false;
    private shouldMiss: boolean = false;  // Variable pour décider de rater intentionnellement
    private movementDistance: number = 0; // Distance maximale de mouvement par mise à jour
  
    constructor(game: Game, level: AILevel = AILevel.MEDIUM) {
        this.game = game;
        this.level = level;
        this.lastDecisionTime = Date.now();
        this.lastMovementTime = Date.now();
        this.defensivePosition = game.height / 2;
        this.moveUp = false;
        this.moveDown = false;
        this.shouldMiss = false;
        // Utiliser la même vitesse que celle définie dans class.ts pour les paddles
        this.movementDistance = game.p2.paddle.speed;
    }
    
    private move() {
        const paddle = this.game.p2.paddle;
        const now = Date.now();
        
        // Vérifier si assez de temps s'est écoulé depuis le dernier mouvement
        if (now - this.lastMovementTime < this.MOVEMENT_DELAY[this.level]) {
            return; // Ne pas bouger trop souvent
        }
        
        // Limiter la distance de mouvement pour éviter les à-coups
        // Réduire légèrement les distances pour des mouvements plus progressifs
        const maxDistance = this.movementDistance * 0.7; // Réduction pour plus de fluidité
        
        if (this.moveUp && paddle.y > 0) {
            // Déplacer le paddle vers le haut avec une vitesse limitée
            paddle.y = Math.max(0, paddle.y - maxDistance);
        } else if (this.moveDown && paddle.y + paddle.height < this.game.height) {
            // Déplacer le paddle vers le bas avec une vitesse limitée
            paddle.y = Math.min(this.game.height - paddle.height, paddle.y + maxDistance);
        }
        
        this.lastMovementTime = now;
    }
    
    setLevel(level: AILevel): void {
        this.level = level;
    }
    
    private predictBallLanding(): number | null {
        const ball = this.game.ball;
        const width = this.game.width;
        const height = this.game.height;
        
        // Si la balle ne se dirige pas vers l'IA, retourner null
        if (ball.dx <= 0) {
            return null;
        }
        
        // Vérifier si l'IA devrait rater intentionnellement cette balle
        if (this.shouldMiss) {
            // Retourner une position aléatoire très éloignée de la trajectoire
            const randomOffset = Math.random() > 0.5 ? height * 0.75 : height * 0.25;
            return randomOffset;
        }
        
        // Calculer le temps qu'il faudra à la balle pour atteindre le côté de l'IA
        const distanceToRightWall = width - ball.x - ball.radius;
        const timeToRightWall = distanceToRightWall / ball.dx;
        
        // Calculer la position Y de la balle lorsqu'elle atteindra le côté droit
        let predictedY = ball.y + (ball.dy * timeToRightWall);
        
        // Tenir compte des rebonds sur les murs supérieur et inférieur
        const ballRadius = ball.radius;
        
        // Simuler les rebonds jusqu'à ce que la balle atteigne le côté droit
        let remainingTime = timeToRightWall;
        let currentY = ball.y;
        let currentDy = ball.dy;
        
        // Limiter le nombre d'itérations pour éviter les boucles infinies
        let maxIterations = 10;
        let iterations = 0;
        
        while (remainingTime > 0 && iterations < maxIterations) {
            iterations++;
            
            // Calculer le temps pour atteindre le mur supérieur ou inférieur
            let timeToTopWall = currentDy < 0 ? (ballRadius - currentY) / currentDy : Infinity;
            let timeToBottomWall = currentDy > 0 ? (height - ballRadius - currentY) / currentDy : Infinity;
            let timeToWall = Math.min(timeToTopWall, timeToBottomWall);
            
            // Si aucun rebond avant d'atteindre le côté droit, sortir de la boucle
            if (timeToWall >= remainingTime) {
                currentY += currentDy * remainingTime;
                break;
            }
            
            // Mettre à jour la position Y et inverser la direction après le rebond
            currentY += currentDy * timeToWall;
            currentDy = -currentDy;
            remainingTime -= timeToWall;
        }
        
        // Ajouter une marge d'erreur basée sur le niveau de difficulté
        const accuracy = this.PREDICTION_ACCURACY[this.level];
        const maxError = this.ERROR_MARGIN[this.level];
        const errorFactor = 1 - Math.random() * (1 - accuracy) * 2;  // -1 à 1, pondéré par la précision
        currentY += errorFactor * maxError;
        
        // S'assurer que la prédiction reste dans les limites du terrain
        return Math.max(ballRadius, Math.min(height - ballRadius, currentY));
    }
    
    /**
     * Déterminer si l'IA doit adopter un style de jeu agressif ou défensif
     */
    private shouldPlayAggressive(): boolean {
        const ball = this.game.ball;
        const width = this.game.width;
        
        // Si la balle se dirige vers le joueur opposé, jamais agressif
        if (ball.dx < 0) {
            return false;
        }
        
        // Facteur d'agressivité basé sur la difficulté
        const aggressionThreshold = this.AGGRESSION_FACTOR[this.level];
        
        // Plus la balle est proche du milieu, plus l'IA est susceptible d'être agressive
        const distanceFromMiddle = Math.abs(ball.x - width / 2);
        const normalizedDistance = distanceFromMiddle / (width / 2); // 0 à 1
        
        // Réduire les chances d'agressivité
        return Math.random() < aggressionThreshold * (1 - normalizedDistance) * 0.7;
    }
    
    /**
     * Mettre à jour la logique de l'IA
     */
    async update(): Promise<void> {
        const now = Date.now();
        const paddle = this.game.p2.paddle;
        const ball = this.game.ball;
        const height = this.game.height;
        
        // Ne pas utiliser de délai de réaction pour chaque appel update
        // car update() est déjà appelé à intervalle régulier
        
        // Décider aléatoirement si l'IA devrait complètement rater cette balle
        if (now - this.lastDecisionTime > 1000) { // Vérifier moins souvent (1 seconde)
            this.lastDecisionTime = now;
            if (Math.random() < this.MISS_CHANCE[this.level]) {
                this.shouldMiss = true;
            } else {
                this.shouldMiss = false;
            }
            
            // Déterminer si l'IA doit jouer agressivement ou défensivement
            this.isAttacking = this.shouldPlayAggressive();
        }
        
        // Ajouter un déplacement aléatoire occasionnel pour l'IA facile et moyenne
        if ((this.level === AILevel.EASY || this.level === AILevel.MEDIUM) && 
            Math.random() < 0.05) { // Réduire la probabilité pour éviter les à-coups
            // Mouvements aléatoires qui peuvent désynchroniser l'IA
            this.moveUp = Math.random() < 0.5;
            this.moveDown = !this.moveUp;
            this.move();
            return;
        }
        
        if (ball.dx > 0 && !this.shouldMiss) {
            // La balle se dirige vers l'IA, prédire où elle va atterrir
            this.targetY = this.predictBallLanding();
        } else {
            // La balle s'éloigne, adopter une position défensive
            this.isAttacking = false;
            
            // Pour les niveaux facile et moyen, revenir lentement au centre
            if (this.level === AILevel.EASY) {
                // Réduire les changements trop brusques dans la position défensive
                const randomOffset = (Math.random() * 100 - 50); // Position moins aléatoire
                this.defensivePosition = height / 2 + randomOffset;
            } else if (this.level === AILevel.MEDIUM) {
                const randomOffset = (Math.random() * 60 - 30); // Position moins aléatoire
                this.defensivePosition = height / 2 + randomOffset;
            } else {
                // Pour les niveaux difficiles, anticiper un retour potentiel
                // en suivant légèrement la balle mais en gardant une position centrale
                this.defensivePosition = height / 2 + (ball.y - height / 2) * 0.2; // Réduit le facteur de suivi
            }
        }

        // Déterminer la direction de déplacement en fonction de la cible
        const targetY = this.targetY !== null ? this.targetY : this.defensivePosition;
        const paddleCenter = paddle.y + paddle.height / 2;
        
        // Réduire les changements brusques de direction
        // Ajouter une zone morte pour éviter les oscillations
        const deadZone = 5; // Zone morte de 5 pixels
        
        // Reset movement flags
        this.moveUp = false;
        this.moveDown = false;
        
        // Si l'IA est en mode attaque ou défense, définir les flags de mouvement
        if (this.level === AILevel.EASY && Math.random() < 0.05) { // Réduire pour moins d'à-coups
            // Parfois faire des mouvements aléatoires pour l'IA facile
            this.moveUp = Math.random() < 0.5;
            this.moveDown = !this.moveUp;
        } else if (this.level === AILevel.IMPOSSIBLE && ball.dx > 0) {
            // Pour le niveau impossible, suivre la balle avec une légère marge d'erreur
            if (paddleCenter < targetY - 15 - deadZone) {
                this.moveDown = true;
            } else if (paddleCenter > targetY + 15 + deadZone) {
                this.moveUp = true;
            }
        } else {
            // Mode normal - suivre la cible avec une marge plus grande
            const margin = this.level === AILevel.EASY ? 70 : 
                          this.level === AILevel.MEDIUM ? 45 : 
                          this.level === AILevel.HARD ? 25 : 15;
            
            if (paddleCenter < targetY - margin - deadZone) {
                this.moveDown = true;
                this.moveUp = false;
            } else if (paddleCenter > targetY + margin + deadZone) {
                this.moveUp = true;
                this.moveDown = false;
            }
            // Sinon, ne pas bouger (dans la zone morte)
        }
        
        this.move();
    }
    
    check_end_game() {
        return this.game.check_end();
    }
}