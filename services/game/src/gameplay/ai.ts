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
        [AILevel.EASY]: 800,      // Temps de réaction plus lent (ms)
        [AILevel.MEDIUM]: 440,
        [AILevel.HARD]: 220,
        [AILevel.IMPOSSIBLE]: 40  // Réaction quasi instantanée
    };
    
    private readonly PREDICTION_ACCURACY = {
        [AILevel.EASY]: 0.5,      // 70% de précision
        [AILevel.MEDIUM]: 0.75,
        [AILevel.HARD]: 0.85,
        [AILevel.IMPOSSIBLE]: 1.0 // 100% précis
    };
    
    private readonly ERROR_MARGIN = {
        [AILevel.EASY]: 90,       // Marge d'erreur élevée
        [AILevel.MEDIUM]: 40,
        [AILevel.HARD]: 15,
        [AILevel.IMPOSSIBLE]: 0   // Pas d'erreur
    };
    
    private readonly AGGRESSION_FACTOR = {
        [AILevel.EASY]: 0.2,      // Moins agressif
        [AILevel.MEDIUM]: 0.5,
        [AILevel.HARD]: 0.7,
        [AILevel.IMPOSSIBLE]: 0.9 // Très agressif
    };
    
    private game: Game;
    private level: AILevel;
    private lastDecisionTime: number;
    private targetY: number | null = null;
    private defensivePosition: number;
    private isAttacking: boolean = false;
  
    
    constructor(game: Game, level: AILevel = AILevel.MEDIUM) {
        this.game = game;
        this.level = level;
        this.lastDecisionTime = Date.now();
        this.defensivePosition = game.height / 2;
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
        
        while (remainingTime > 0) {
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
        if (this.level !== AILevel.IMPOSSIBLE) {
            const accuracy = this.PREDICTION_ACCURACY[this.level];
            const maxError = this.ERROR_MARGIN[this.level];
            const errorFactor = 1 - Math.random() * (1 - accuracy) * 2;  // -1 à 1, pondéré par la précision
            currentY += errorFactor * maxError;
        }
        
        // S'assurer que la prédiction reste dans les limites du terrain
        return Math.max(ballRadius, Math.min(height - ballRadius, currentY));
    }
    
    /**
     * Déterminer si l'IA doit adopter un style de jeu agressif ou défensif
     */
    private shouldPlayAggressive(): boolean {
        const ball = this.game.ball;
        const width = this.game.width;
        
        // Si la balle se dirige vers le joueur opposé
        if (ball.dx < 0) {
            return false;
        }
        
        // Facteur d'agressivité basé sur la difficulté
        const aggressionThreshold = this.AGGRESSION_FACTOR[this.level];
        
        // Plus la balle est proche du milieu, plus l'IA est susceptible d'être agressive
        const distanceFromMiddle = Math.abs(ball.x - width / 2);
        const normalizedDistance = distanceFromMiddle / (width / 2); // 0 à 1
        
        return Math.random() < aggressionThreshold * (1 - normalizedDistance);
    }
    
    /**
     * Mettre à jour la logique de l'IA
     */
    async update(): Promise<void> {
        const now = Date.now();
        const paddle = this.game.p2.paddle;
        const ball = this.game.ball;
        const height = this.game.height;
        const width = this.game.width;
        
        // Attendre 50 ms avant de continuer
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(50);
        // Mettre à jour les décisions selon le temps de réaction défini par le niveau
        if (now - this.lastDecisionTime >= this.REACTION_TIME[this.level]) {
            this.lastDecisionTime = now;
            
            // Déterminer si l'IA doit jouer agressivement ou défensivement
            this.isAttacking = this.shouldPlayAggressive();
            
            if (ball.dx > 0) {
                // La balle se dirige vers l'IA, prédire où elle va atterrir
                this.targetY = this.predictBallLanding();
            } else {
                // La balle s'éloigne, adopter une position défensive
                this.isAttacking = false;
                
                // Pour les niveaux facile et moyen, revenir au centre
                if (this.level === AILevel.EASY || this.level === AILevel.MEDIUM) {
                    this.defensivePosition = height / 2;
                } else {
                    // Pour les niveaux difficiles, anticiper un retour potentiel
                    // en suivant légèrement la balle mais en gardant une position centrale
                    this.defensivePosition = height / 2 + (ball.y - height / 2) * 0.3;
                }
            }
        }
        
        // Si l'IA est en mode attaque et a une cible
        if (this.isAttacking && this.targetY !== null) {
            // Mode agressif: se positionner plus près du filet
            const aggressiveX = width * 0.85;
            const currentDistanceFromNet = width - paddle.x;
            
            // Déplacer le paddle vers la cible
            if (paddle.y + paddle.height / 2 < this.targetY - 10) {
                paddle.moveDown();
            } else if (paddle.y + paddle.height / 2 > this.targetY + 10) {
                paddle.moveUp();
            }
        } else {
            // Mode défensif
            const targetY = this.targetY !== null ? this.targetY : this.defensivePosition;
            
            // Déplacer le paddle vers la position cible, avec une petite zone de repos
            if (paddle.y + paddle.height / 2 < targetY - 15) {
                paddle.moveDown();
            } else if (paddle.y + paddle.height / 2 > targetY + 15) {
                paddle.moveUp();
            }
        }
        
        // Ajouter un comportement différent selon le niveau
        if (this.level === AILevel.EASY && Math.random() < 0.1) {
            // Parfois faire des mouvements aléatoires pour l'IA facile
            if (Math.random() < 0.5) {
                paddle.moveUp();
            } else {
                paddle.moveDown();
            }
        } else if (this.level === AILevel.IMPOSSIBLE && ball.dx > 0) {
            // Pour le niveau impossible, suivre la balle presque parfaitement
            if (paddle.y + paddle.height / 2 < ball.y) {
                paddle.moveDown();
            } else {
                paddle.moveUp();
            }
        }
    }
    check_end_game() {
        return this.game.check_end();
    }

}