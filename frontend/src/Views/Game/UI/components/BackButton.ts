import { GameUI } from '../../GameUI.js';
import { FontHelper } from '../../FontHelper.js';
import { GameWebSocket } from '../../GameWebSocket.js';

export class BackButton {
    private element: HTMLButtonElement;
    private webSocket: GameWebSocket | null;
    private userInfo: any;
    public container: HTMLDivElement;  // Changé en public pour permettre un accès externe

    constructor(webSocket: GameWebSocket | null, userInfo: any) {
        this.webSocket = webSocket;
        this.userInfo = userInfo;
        
        // Create container that will be positioned at top-right
        this.container = document.createElement('div');
        this.container.id = 'back-button-container'; // Ajout d'un ID unique pour déboguer
        this.container.style.position = 'fixed'; // Changé à fixed pour être toujours visible
        this.container.style.top = '100px';
        this.container.style.right = '20px';
        
        // Create button element
        this.element = document.createElement('button');
        this.element.id = 'back-to-lobby-button'; // Ajout d'un ID unique pour déboguer
        this.element.textContent = 'Back to Lobby';
        
        // Style the button
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Plus opaque
        this.element.style.color = 'white';
        this.element.style.border = '2px solid #6e72ff';
        this.element.style.borderRadius = '8px';
        this.element.style.padding = '10px 15px';
        this.element.style.cursor = 'pointer';
        this.element.style.transition = 'all 0.2s ease';
        this.element.style.fontSize = '16px'; // Définir explicitement la taille de police
        this.element.style.fontWeight = 'bold'; // Rendre le texte plus visible
        this.element.style.boxShadow = '0 0 10px rgba(110, 114, 255, 0.7)'; // Plus visible
        
        // Add hover effects
        this.element.onmouseenter = () => {
            this.element.style.backgroundColor = 'rgba(110, 114, 255, 0.5)';
            this.element.style.transform = 'scale(1.05)';
            this.element.style.boxShadow = '0 0 15px rgba(110, 114, 255, 0.8)';
        };
        
        this.element.onmouseleave = () => {
            this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            this.element.style.transform = 'scale(1)';
            this.element.style.boxShadow = '0 0 10px rgba(110, 114, 255, 0.7)';
        };
        
        // Add click event
        this.element.onclick = this.handleClick.bind(this);
        
        // Add button to container
        this.container.appendChild(this.element);
    }
    
    private handleClick(): void {
        console.log('Back button clicked');
        
        // Send leave message to WebSocket if available
        if (this.webSocket) {
            console.log('Sending leave message to WebSocket');
            this.webSocket.sendMessage('leave', {
                user: this.userInfo,
                type: 'leave'
            });
        } else {
            console.warn('WebSocket not available, cannot send leave message');
        }
        
        // Hide game canvas if it exists
        const gameCanvas = document.getElementById('canvas-container');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }
        
        // Show lobby buttons
        GameUI.showLobbyButtons();
        GameUI.hideSpinner(); // S'assurer que le spinner est masqué
        
        // Remove the back button from DOM
        this.remove();
    }
    
    public render(): void {
        // Vérifier si le bouton est déjà dans le DOM
        if (document.getElementById('back-button-container')) {
            document.getElementById('back-button-container')?.remove();
        }
        
        const gameWrapper = document.getElementById('game-wrapper');
        
        if (gameWrapper) {
            // Ajouter le bouton au game-wrapper
            gameWrapper.appendChild(this.container);
            console.log('Back button added to game-wrapper');
        } else {
            // Fallback: ajouter au corps du document si game-wrapper n'existe pas
            document.body.appendChild(this.container);
            console.log('Game wrapper not found, back button added to body');
        }
        // S'assurer que le bouton est visible
        this.container.style.display = 'block';
    }
    
    public remove(): void {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
    
    public static createAndRender(webSocket: GameWebSocket | null, userInfo: any): BackButton {
        const backButton = new BackButton(webSocket, userInfo);
        backButton.render();
        return backButton;
    }
}