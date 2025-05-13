import { DifficultyScreen } from './UI/screens/DifficultyScreen.js';
import { UISpinner } from './UI/components/Spinner.js';
import { IScreen } from './UI/interfaces/IScreen.js';
import { TournamentScreen } from './UI/screens/TournamentScreen.js';

export class GameUI {
    private static lobbyButtons = ['randomAdversaireButton', 'localButton', 'tournamentButton', 'iaButton'];
    private static spinner = new UISpinner();
    private static screens: Map<string, IScreen> = new Map();
    private static activeScreen: string | null = null;
    
    static initialize(): void {
        // Initialize screens
        this.screens.set('difficulty', new DifficultyScreen());
        this.screens.set('tournament', new TournamentScreen())
    }
    
    static displaySpinner(message = 'Finding opponent...'): void {
        this.spinner.show(message);
    }
    
    static hideSpinner(): void {
        this.spinner.hide();
    }
    
    static toggleButtonVisibility(ids: string[], show: boolean): void {
        ids.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.style.display = show ? 'block' : 'none';
                if (show) {
                    button.removeAttribute('disabled');
                } else {
                    button.setAttribute('disabled', 'true');
                }
            }
        });
    }
    
    static showLobbyButtons(): void {
        this.toggleButtonVisibility(this.lobbyButtons, true);
        this.hideSpinner();
        this.lobbyButtons.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            // @ts-ignore
            import('./FontHelper.js').then(({ FontHelper }) => {
                FontHelper.applyMightySoulyFont(button, FontHelper.BUTTON_FONT_SIZE);
            });
        }
    });
    }
    
    static hideGameButtons(): void {
        this.toggleButtonVisibility(this.lobbyButtons, false);
    }
    
    static displayWaiting(): void {
        this.hideGameButtons();
        this.displaySpinner();
    }
    
    static showScreen(screenName: string): Promise<string> {
        this.hideAll();
        
        if (!this.screens.has(screenName)) {
            console.error(`Screen ${screenName} not found`);
            return Promise.resolve('');
        }
        
        this.activeScreen = screenName;
        return this.screens.get(screenName)!.show();
    }
    
    static hideScreen(screenName: string): void {
        if (this.screens.has(screenName)) {
            this.screens.get(screenName)!.hide();
            if (this.activeScreen === screenName) {
                this.activeScreen = null;
            }
        }
    }
    
                       // Ajouter cette méthode à GameUI
    static clearGameResults(): void {
     // Supprimer tous les résultats de jeu existants
     const existingResultModal = document.getElementById('game-result');
     if (existingResultModal) {
         existingResultModal.remove();
     }
     
     // Réinitialiser le canvas de jeu
     const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
     if (gameCanvas) {
         const ctx = gameCanvas.getContext('2d');
         if (ctx) {
             ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
         }
         gameCanvas.style.display = 'block'; // S'assurer que le canvas est visible
     }
     
     // Supprimer aussi les notifications qui pourraient rester
     const notifications = document.querySelectorAll('.tournament-notification');
     notifications.forEach(notification => notification.remove());
    }
    // Maintient la compatibilité avec l'API existante
    static displayDifficultyButtons(): Promise<string> {
        return this.showScreen('difficulty');
    }
    
    static hideDifficultyButtons(): void {
        this.hideScreen('difficulty');
    }
        
    static hideAll(): void {
        // Hide all screens
        this.screens.forEach((screen, name) => {
            screen.hide();
        });
        this.hideGameButtons();
        this.hideSpinner();
        this.activeScreen = null;
    }

    static showTournamentButtons(): Promise<string> {
        return this.showScreen('tournament');
    }


    // Ajouter cette méthode à la classe GameUI
    static getScreen(screenName: string): IScreen | null {
        if (!this.screens.has(screenName)) {
            console.error(`Screen ${screenName} not found`);
            return null;
        }
        
        return this.screens.get(screenName)!;
    }

    static hasScreen(screenName: string): boolean {
        return this.screens.has(screenName);
    }
}

// Initialize screens
GameUI.initialize();