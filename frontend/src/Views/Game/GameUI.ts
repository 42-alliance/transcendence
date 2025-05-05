import { get } from "http";

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
    static displayDifficultyButtons(): Promise<string> {
    return new Promise((resolve) => {
        // Create a container for the difficulty buttons
        const difficultyContainer = document.createElement('div');
        difficultyContainer.id = 'difficulty-container';
        difficultyContainer.className = 'difficulty-container';
        difficultyContainer.style.position = 'fixed';
        difficultyContainer.style.top = '50%';
        difficultyContainer.style.left = '50%';
        difficultyContainer.style.transform = 'translate(-50%, -50%)';
        difficultyContainer.style.display = 'flex';
        difficultyContainer.style.flexDirection = 'column';
        difficultyContainer.style.alignItems = 'center';
        difficultyContainer.style.gap = '15px';
        difficultyContainer.style.zIndex = '1000';
        difficultyContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        difficultyContainer.style.padding = '30px';
        difficultyContainer.style.borderRadius = '12px';
        difficultyContainer.style.border = '2px solid #4a4a8f';
        difficultyContainer.style.boxShadow = '0 0 20px rgba(93, 93, 170, 0.5)';

        // Ajouter un titre
        const title = document.createElement('h2');
        title.textContent = 'SELECT DIFFICULTY';
        title.style.color = 'white';
        title.style.marginBottom = '20px';
        title.style.fontFamily = "'Arial', sans-serif";
        title.style.fontSize = '24px';
        title.style.fontWeight = 'bold';
        title.style.textTransform = 'uppercase';
        title.style.letterSpacing = '2px';
        title.style.textAlign = 'center';
        difficultyContainer.appendChild(title);

        // Define difficulty levels
        const difficulties = [
            { id: 'easyButton', text: 'Easy' },
            { id: 'mediumButton', text: 'Medium' },
            { id: 'hardButton', text: 'Hard' },
            { id: 'impossibleButton', text: 'Impossible' }
        ];

        // Create buttons for each difficulty level
        difficulties.forEach(difficulty => {
            const button = document.createElement('button');
            button.id = difficulty.id;
            button.textContent = difficulty.text;
            button.className = 'difficulty-button';
            
            // Style identique aux boutons de jeu
            button.style.background = 'linear-gradient(to bottom, #4a4a8f, #2d2d64)';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '6px';
            button.style.padding = '12px 24px';
            button.style.fontSize = '16px';
            button.style.fontWeight = 'bold';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.minWidth = '160px';
            button.style.textTransform = 'uppercase';
            button.style.letterSpacing = '1px';
            button.style.margin = '5px 0';
            button.style.border = '1px solid #5d5daa';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            
            // Hover effect
            button.addEventListener('mouseover', () => {
                button.style.background = 'linear-gradient(to bottom, #5d5daa, #4a4a8f)';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.background = 'linear-gradient(to bottom, #4a4a8f, #2d2d64)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            });
            
            // Add click effect
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(1px)';
                button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.4)';
            });
            
            // Add click event
            button.addEventListener('click', () => {
                // Send the selected difficulty level to the server
                const selectedDifficulty = difficulty.text.toLowerCase();
                console.log(`Selected difficulty: ${selectedDifficulty}`);
                
                // Remove the container
                document.body.removeChild(difficultyContainer);
                
                // Resolve the promise with the selected difficulty
                resolve(selectedDifficulty);
            });
            
            // Important: add the button to the container
            difficultyContainer.appendChild(button);
        });

        // Append the container to the body
        document.body.appendChild(difficultyContainer);
    });
}
    static hideDifficultyButtons() {
        const difficultyContainer = document.getElementById('difficulty-container');
        if (difficultyContainer) {
            difficultyContainer.parentElement?.removeChild(difficultyContainer);
        }
    }
}