export class GameUI {
    static displaySpinner() {
        // Check if spinner already exists
        let spinner = document.getElementById('spinner-container');
        
        // If spinner doesn't exist, create it
        if (!spinner) {
            // Create container
            const spinnerContainer = document.createElement('div');
            spinnerContainer.id = 'spinner-container';
            spinnerContainer.className = 'spinner-container';
            
            // Create spinner element
            const spinnerElement = document.createElement('div');
            spinnerElement.className = 'spinner';
            
            // Create text element
            const spinnerText = document.createElement('div');
            spinnerText.className = 'spinner-text';
            spinnerText.textContent = 'Finding opponent...';
            
            spinnerContainer.appendChild(spinnerElement);
            spinnerContainer.appendChild(spinnerText);
            
            // Add to the game area
            const gameCanvas = document.getElementById('gameCanvas');
            gameCanvas?.parentElement?.appendChild(spinnerContainer);
        } else {
            spinner.style.display = 'flex';
        }
    }
    static showLobbyButtons() {
        const buttons = ['randomAdversaireButton', 'localButton', 'roomCodeButton',
                        'tournamentButton', 'iaButton'];
        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.style.display = 'block';
                button.removeAttribute('disabled');
            }
        });
        // Show spinner
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'none';
        }
        // Remove spinner from DOM
        const spinnerContainer = document.getElementById('spinner-container');
        if (spinnerContainer) {
            spinnerContainer.parentElement?.removeChild(spinnerContainer);
        }
    }

    static hideSpinner() {
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    static displayWaiting() {
        const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (gameCanvas) {
            // Hide all buttons
            const buttons = ['randomAdversaireButton', 'localButton', 'roomCodeButton', 
                            'tournamentButton', 'iaButton'];
            
            buttons.forEach(id => {
                const button = document.getElementById(id);
                if (button) {
                    button.style.display = 'none';
                    button.setAttribute('disabled', 'true');
                }
            });
            
            // Show spinner
            GameUI.displaySpinner();
        }
    }

    static showRoomCodeModal(
        sendMessageCallback: ((type: string, data?: any) => void) | undefined, 
        user_info: any
    ) {
        console.log("Room code button clicked");
        // Open a modal to enter the room code
        const modal = document.createElement('div');
        modal.id = 'room-code-modal';
        modal.className = 'modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '1000';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        modal.style.borderRadius = '8px';

        modal.innerHTML = `
            <div class="modal-content height-1000">
                <button id="join-room-button" style="color: red;">Join Room</button>
                <br>
                <button id="create-room-button" style="color: red;">Create Room</button>
            </div>
        `;

        const closeButton = modal.querySelector('.close');
        closeButton?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.body.appendChild(modal);
        
        // Utilisez sendMessageCallback au lieu de socket.send
        document.getElementById('join-room-button')?.addEventListener('click', () => {
            sendMessageCallback?.('join_room', { user: user_info });
        });
        
        document.getElementById('create-room-button')?.addEventListener('click', () => {
            sendMessageCallback?.('create_room', { user: user_info });
        });
    }

    static hideGameButtons() {
        document.getElementById('randomAdversaireButton')?.setAttribute('disabled', 'true');
        document.getElementById('localButton')?.setAttribute('disabled', 'true');
        document.getElementById('roomCodeButton')?.setAttribute('disabled', 'true');
        document.getElementById('tournamentButton')?.setAttribute('disabled', 'true');
        document.getElementById('iaButton')?.setAttribute('disabled', 'true');
        
        const buttons = ['randomAdversaireButton', 'localButton', 'roomCodeButton', 
                        'tournamentButton', 'iaButton'];
        
        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.style.display = 'none';
            }
        });
    }
}