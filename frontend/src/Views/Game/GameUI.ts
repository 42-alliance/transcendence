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
        const buttons = ['randomAdversaireButton', 'localButton', 
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
            const buttons = ['randomAdversaireButton', 'localButton',  
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

    

    static hideGameButtons() {
        document.getElementById('randomAdversaireButton')?.setAttribute('disabled', 'true');
        document.getElementById('localButton')?.setAttribute('disabled', 'true');
        document.getElementById('tournamentButton')?.setAttribute('disabled', 'true');
        document.getElementById('iaButton')?.setAttribute('disabled', 'true');
        
        const buttons = ['randomAdversaireButton', 'localButton', 
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
        this.hideAll();
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

    static showTournamentButtons(): Promise<string> {
        return new Promise((resolve) => {

            this.hideAll();
            const OptionContainer = document.createElement('div');
            OptionContainer.id = 'Option-container';
            OptionContainer.className = 'Option-container';
            OptionContainer.style.position = 'fixed';
            OptionContainer.style.top = '50%';
            OptionContainer.style.left = '50%';
            OptionContainer.style.transform = 'translate(-50%, -50%)';
            OptionContainer.style.display = 'flex';
            OptionContainer.style.flexDirection = 'column';
            OptionContainer.style.alignItems = 'center';
            OptionContainer.style.gap = '15px';
            OptionContainer.style.zIndex = '1000';
            OptionContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            OptionContainer.style.padding = '30px';
            OptionContainer.style.borderRadius = '12px';
            OptionContainer.style.border = '2px solid #4a4a8f';
            OptionContainer.style.boxShadow = '0 0 20px rgba(93, 93, 170, 0.5)';
    
            // Ajouter un titre
            const title = document.createElement('h2');
            title.textContent = 'SELECT Option';
            title.style.color = 'white';
            title.style.marginBottom = '20px';
            title.style.fontFamily = "'Arial', sans-serif";
            title.style.fontSize = '24px';
            title.style.fontWeight = 'bold';
            title.style.textTransform = 'uppercase';
            title.style.letterSpacing = '2px';
            title.style.textAlign = 'center';
            OptionContainer.appendChild(title);
    
            // Define Option levels
            const Options = [
                { id: 'createTournament', text: 'Create a Tournament' },
                { id: 'joinTournament', text: 'Join a Tournament' },
                { id: 'cancel', text: 'Cancel' }
            ];
    
            // Create buttons for each Option level
           Options.forEach(Option => {
                const button = document.createElement('button');
                button.id = Option.id;
                button.textContent = Option.text;
                button.className = 'Option-button';
                
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
                    // Send the selected Option level to the server
                    const selectedOption = Option.text.toLowerCase();
                    console.log(`Selected Option: ${selectedOption}`);
                    if (selectedOption === 'cancel') {
                        // Remove the container
                        this.hideAll();
                        return;
                    }
                    else if (selectedOption === 'create a tournament') {
                        // Call the function to create a tournament
                        console.log("Creating a tournament...");
                        const InputContainer = document.createElement('div');
                        InputContainer.id = 'Input-container';
                        InputContainer.className = 'Input-container';
                        InputContainer.style.position = 'fixed';
                        InputContainer.style.top = '50%';
                        InputContainer.style.left = '50%';
                        InputContainer.style.transform = 'translate(-50%, -50%)';
                        InputContainer.style.display = 'flex';
                        InputContainer.style.flexDirection = 'column';
                        InputContainer.style.alignItems = 'center';
                        InputContainer.style.gap = '15px';
                        InputContainer.style.zIndex = '1000';
                        InputContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                        InputContainer.style.padding = '30px';
                        InputContainer.style.borderRadius = '12px';
                        InputContainer.style.border = '2px solid #4a4a8f';
                        InputContainer.style.boxShadow = '0 0 20px rgba(93, 93, 170, 0.5)';
                        InputContainer.style.width = '300px';
                        InputContainer.style.height = '200px';
                        InputContainer.style.overflow = 'hidden';
                        InputContainer.style.textAlign = 'center';
                        InputContainer.style.color = 'white';
                        InputContainer.style.fontFamily = "'Arial', sans-serif";
                        InputContainer.style.fontSize = '16px';
                        const text = document.createElement('p');
                        text.textContent = 'Create your own tournament and play with your friends!';
                        text.style.color = 'white';
                        text.style.marginBottom = '20px';
                        text.style.fontFamily = "'Arial', sans-serif";
                        text.style.fontSize = '16px';
                        text.style.fontWeight = 'bold';
                        text.style.textTransform = 'uppercase';
                        text.style.letterSpacing = '2px';
                        text.style.textAlign = 'center';
                        InputContainer.appendChild(text);
                        // Create input field 
                        const Input = document.createElement('input');
                        Input.id = 'tournamentName';
                        Input.type = 'text';
                        Input.placeholder = 'Enter tournament name';
                        Input.style.width = '100%';
                        Input.style.padding = '10px';
                        Input.style.borderRadius = '6px';
                        document.body.appendChild(InputContainer);
                        InputContainer.appendChild(Input);
                    }
                    else if (selectedOption === 'join a tournament') {
                        // Call the function to join a tournament
                        console.log("Joining a tournament...");
                        const InputContainer = document.createElement('div');
                        InputContainer.id = 'Input-container';
                        InputContainer.className = 'Input-container';
                        InputContainer.style.position = 'fixed';
                        InputContainer.style.top = '50%';
                        InputContainer.style.left = '50%';
                        InputContainer.style.transform = 'translate(-50%, -50%)';
                        InputContainer.style.display = 'flex';
                        InputContainer.style.flexDirection = 'column';
                        InputContainer.style.alignItems = 'center';
                        InputContainer.style.gap = '15px';
                        InputContainer.style.zIndex = '1000';
                        InputContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                        InputContainer.style.padding = '30px';
                        InputContainer.style.borderRadius = '12px';
                        InputContainer.style.border = '2px solid #4a4a8f';
                        InputContainer.style.boxShadow = '0 0 20px rgba(93, 93, 170, 0.5)';
                        InputContainer.style.width = '300px';
                        InputContainer.style.height = '200px';
                        InputContainer.style.overflow = 'hidden';
                        InputContainer.style.textAlign = 'center';
                        InputContainer.style.color = 'white';
                        InputContainer.style.fontFamily = "'Arial', sans-serif";
                        InputContainer.style.fontSize = '16px';
                        const text = document.createElement('p');
                        text.textContent = 'Join a tournament and play with your friends!';
                        text.style.color = 'white';
                        text.style.marginBottom = '20px';
                        text.style.fontFamily = "'Arial', sans-serif";
                        text.style.fontSize = '16px';
                        text.style.fontWeight = 'bold';
                        text.style.textTransform = 'uppercase';
                        text.style.letterSpacing = '2px';
                        text.style.textAlign = 'center';
                        InputContainer.appendChild(text);
                        // Create select field
                        const select = document.createElement('select');
                        select.id = 'tournamentSelect';
                        select.style.width = '100%';
                        select.style.padding = '10px';
                        select.style.borderRadius = '6px';
                        select.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        select.style.color = 'white';
                        select.style.border = '1px solid #5d5daa';
                        select.style.fontSize = '16px';
                        select.style.fontFamily = "'Arial', sans-serif";
                        select.style.fontWeight = 'bold';
                        select.style.cursor = 'pointer';
                        select.style.marginBottom = '10px';
                        // Add options to the select field
                        const option1 = document.createElement('option');
                        option1.value = 'tournament1';
                        option1.textContent = 'Tournament 1';
                        const option2 = document.createElement('option');
                        option2.value = 'tournament2';
                        option2.textContent = 'Tournament 2';
                        InputContainer.appendChild(select);
                        select.appendChild(option1);
                        select.appendChild(option2);
                        // Create join button
                        const joinButton = document.createElement('button');
                        joinButton.id = 'joinButton';
                        joinButton.textContent = 'Join';
                        joinButton.className = 'join-button';
                        joinButton.style.background = 'linear-gradient(to bottom, #4a4a8f, #2d2d64)';
                        joinButton.style.color = 'white';
                        joinButton.style.border = 'none';
                        joinButton.style.borderRadius = '6px';
                        joinButton.style.padding = '12px 24px';
                        joinButton.style.fontSize = '16px';
                        joinButton.style.fontWeight = 'bold';
                        joinButton.style.cursor = 'pointer';
                        joinButton.style.transition = 'all 0.3s ease';
                        joinButton.style.minWidth = '160px';
                        joinButton.style.textTransform = 'uppercase';
                        joinButton.style.letterSpacing = '1px';
                        joinButton.style.margin = '5px 0';
                        joinButton.style.border = '1px solid #5d5daa';
                        joinButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        // Hover effect
                        joinButton.addEventListener('mouseover', () => {
                            joinButton.style.background = 'linear-gradient(to bottom, #5d5daa, #4a4a8f)';
                            joinButton.style.transform = 'translateY(-2px)';
                            joinButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
                        });
                        joinButton.addEventListener('mouseout', () => {
                            joinButton.style.background = 'linear-gradient(to bottom, #4a4a8f, #2d2d64)';
                            joinButton.style.transform = 'translateY(0)';
                            joinButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        });
                        // Add click effect
                        joinButton.addEventListener('mousedown', () => {
                            joinButton.style.transform = 'translateY(1px)';
                            joinButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.4)';
                        });
                        // Add click event
                        joinButton.addEventListener('click', () => {
                            // Send the selected tournament to the server
                            const selectedTournament = (document.getElementById('tournamentSelect') as HTMLSelectElement).value;
                            console.log(`Selected tournament: ${selectedTournament}`);
                            // Remove the container
                            document.body.removeChild(InputContainer);
                            // Resolve the promise with the selected tournament
                            resolve(selectedTournament);
                        });
                        InputContainer.appendChild(joinButton);
                        document.body.appendChild(InputContainer);

                    }
                    // Append the input container to the body
                    document.body.removeChild(OptionContainer);
                    resolve(selectedOption);
                });
                OptionContainer.appendChild(button);
            });
    
            // Append the container to the body
            document.body.appendChild(OptionContainer);
        });
    }
    static hideAll() {
        const containers = ['Option-container', 'difficulty-container', 'Input-container', 'spinner-container'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.parentElement?.removeChild(container);
            }
        });
    }
}