import { BaseScreen } from '../components/Screen.js';
import { createButton } from '../utils/ElementFactory.js';
import { ModalStyles } from '../styles/ModalStyles.js';
import { GameUI } from '../../GameUI.js';
import { FontHelper } from '../../FontHelper.js'


export class TournamentScreen extends BaseScreen {
    constructor() {
        super('tournament-screen');
    }
    
    public show(): Promise<string> {
        return new Promise((resolve) => {
            this.clearContainer();
            
            // Add title
            const title = document.createElement('h2');
            title.textContent = 'TOURNAMENT OPTIONS';
            title.style.color = 'white';
            title.style.marginBottom = '20px';
            FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE); // Ajoute cette ligne
            this.addElement(title);
            
            // Define options (à compléter plus tard)
            const options = [
                { id: 'create', label: 'Create Tournament' },
                { id: 'join', label: 'Join Tournament' }
            ];
            
            // Add option buttons
            options.forEach(option => {
                const button = createButton(option.id, option.label);
                FontHelper.applyMightySoulyFont(button, FontHelper.BUTTON_FONT_SIZE); // Ajoute cette ligne
                button.onclick = () => {
                    this.hide();
                    resolve(option.id);
                };
                this.addElement(button);
            });
            
            // Add cancel button
            const cancelButton = createButton('cancel', 'Cancel');
            cancelButton.onclick = () => {
                this.clearContainer();
                resolve('cancel');
            };
            cancelButton.style.backgroundColor = '#8f4a4a';
            
            FontHelper.applyMightySoulyFont(cancelButton, '30px'); // Ajoute cette ligne
            this.addElement(cancelButton);
            this.container.style.display = 'block';
            this.isVisible = true;
        });
    }

     private static createReturnToLobbyButton(resultContainer: HTMLDivElement): HTMLButtonElement {
        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return to Lobby';
        returnButton.style.backgroundColor = '#4CAF50';
        returnButton.style.color = 'white';
        returnButton.style.border = 'none';
        returnButton.style.padding = '10px 20px';
        returnButton.style.textAlign = 'center';
        returnButton.style.textDecoration = 'none';
        returnButton.style.display = 'inline-block';
        returnButton.style.fontSize = '16px';
        returnButton.style.marginTop = '20px';
        returnButton.style.cursor = 'pointer';
        FontHelper.applyMightySoulyFont(returnButton, FontHelper.BUTTON_FONT_SIZE); // Ajoute cette ligne
        returnButton.onclick = () => {
            resultContainer.remove();
            GameUI.showLobbyButtons();
        };
        return returnButton;
    }
    private updateTournamentMatchWin(tournamentId: string, match: any, winner: string, user_id: string): void {
        if (winner.toString() === user_id.toString()) {
            console.log("winner");
            // Create a modal overlay
            const modal = this.createModalElement();
            // Message
            const message = document.createElement('div');
            message.textContent = 'Tournoi terminé ! Vous avez gagné !';
            message.style.color = '#4CAF50';
            message.style.textAlign = 'center';
            message.style.padding = '10px';
            message.style.fontSize = '20px';
            FontHelper.applyMightySoulyFont(message, FontHelper.TEXT_FONT_SIZE);
            // Button
            const returnButton = TournamentScreen.createReturnToLobbyButton(modal);
      
            // Add to modal
            modal.appendChild(message);
            modal.appendChild(returnButton);
            document.body.appendChild(modal);
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 50);
        }
    }
    private updateTournamentEndMatch(tournamentId: string, match: any, winner: string, user_id: string): void {
 
      
       if (winner.toString() !== user_id.toString()) {

        console.log("looser");
        // Create a modal overlay
        const modal = this.createModalElement();
        // Message
        const message = document.createElement('div');
        message.textContent = 'Match terminé ! Vous avez perdu !';
        message.style.color = '#ff6b6b';
        message.style.textAlign = 'center';
        message.style.padding = '10px';
        message.style.fontSize = '20px';
        FontHelper.applyMightySoulyFont(message, FontHelper.TEXT_FONT_SIZE);
        // Button

        const returnButton = TournamentScreen.createReturnToLobbyButton(modal);
      
        // Add to modal
        modal.appendChild(message);
        modal.appendChild(returnButton);
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 50);
        }
        else {
            console.log("winner");
        }
    }

    public showCreateTournament(): Promise<string> {
        return new Promise((resolve, reject) => {
            // Créer le modal
            const modal = this.createModalElement();
            // Créer les éléments du formulaire
            const title = this.createTitleElement('Create Tournament');
            const textInput = this.createInputElement('Tournament Name');
            const errorMsg = this.createErrorMsgElement();
            const buttonContainer = this.createButtonContainerElement();
            FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE); // Ajoute cette ligne
            FontHelper.applyMightySoulyFont(textInput, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
            FontHelper.applyMightySoulyFont(errorMsg, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
            FontHelper.applyMightySoulyFont(buttonContainer, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
            // Appliquer les styles
            Object.entries(ModalStyles.title).forEach(([key, value]) => {
                title.style[key as any] = value;
            });
            Object.entries(ModalStyles.input).forEach(([key, value]) => {
                textInput.style[key as any] = value;
            });
            
            // Créer les boutons
            const createButton = this.createActionButton('Create', () => {
                if (!textInput.value.trim()) {
                    errorMsg.textContent = 'Please enter a tournament name';
                    errorMsg.style.visibility = 'visible';
                    return;
                }

                resolve(textInput.value);
                //show modal waiting
                
                this.closeModal(modal);
            });
            
            const cancelButton = this.createActionButton('Cancel', () => {
                reject('Cancelled');
                this.closeModal(modal);
            }, true);
            cancelButton.style.justifyContent = 'center';
            cancelButton.style.display = 'block';
            cancelButton.style.margin = '0 auto';

            // Assembler les éléments
            buttonContainer.appendChild(cancelButton);
            //buttonContainer.appendChild(createButton);
            
            
            modal.appendChild(title);
            modal.appendChild(textInput);
            modal.appendChild(errorMsg);
            modal.appendChild(buttonContainer);
            
            // Ajouter le modal au DOM et l'animer
            document.body.appendChild(modal);
            
            // Focus et animation
            setTimeout(() => {
                textInput.focus();
                modal.style.opacity = '1';
            }, 50);
            
            // Support des raccourcis clavier
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') createButton.click();
                if (e.key === 'Escape') cancelButton.click();
            });
        });
    }

    public showJoinTournament(): Promise<string> {
        return new Promise((resolve, reject) => {
            // Créer le modal
            const modal = this.createModalElement();
            FontHelper.applyMightySoulyFont(modal, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
            // Créer les éléments du formulaire
            const title = this.createTitleElement('Join Tournament');
            
            // Container pour la liste des tournois
            const tournamentListContainer = this.createTournamentListContainer();
            
            // Message de chargement initial
            const loadingMsg = document.createElement('div');
            loadingMsg.textContent = 'Loading tournaments...';
            loadingMsg.style.color = 'white';
            loadingMsg.style.textAlign = 'center';
            loadingMsg.style.padding = '10px';
            tournamentListContainer.appendChild(loadingMsg);
            
            // Container pour les boutons d'action
            const buttonContainer = this.createButtonContainerElement();
            
            // Bouton d'annulation
            const cancelButton = this.createActionButton('Cancel', () => {
                reject('Cancelled');
                this.closeModal(modal);
            }, true);
            
            buttonContainer.appendChild(cancelButton);
            
            // Assembler les éléments
            modal.appendChild(title);
            modal.appendChild(tournamentListContainer);
            modal.appendChild(buttonContainer);
            
            // Ajouter le modal au DOM et l'animer
            document.body.appendChild(modal);
            
            // Focus et animation
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 50);
            
            // Envoyer une requête pour obtenir la liste des tournois
            this.requestTournaments().then(tournaments => {
                // Rendre la liste des tournois une fois reçue
                this.renderTournamentList(tournaments, tournamentListContainer, modal, resolve);
            }).catch(error => {
                // Gérer l'erreur
                this.renderErrorMessage(error, tournamentListContainer, modal, resolve, reject);
            });
        });
    }

    // Méthodes d'aide pour créer les éléments UI
    private createModalElement(): HTMLDivElement {
        const modal = document.createElement('div');
        modal.id = 'create-tournament-modal';
        
        // Appliquer les styles
        Object.entries(ModalStyles.container).forEach(([key, value]) => {
            modal.style[key as any] = value;
        });
        
        return modal;
    }
    
    private createTitleElement(text: string): HTMLHeadingElement {
        const title = document.createElement('h3');
        title.textContent = text;
        FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE); // Ajoute cette ligne
        
        Object.entries(ModalStyles.title).forEach(([key, value]) => {
            title.style[key as any] = value;
        });
        
        return title;
    }
    
    private createInputElement(placeholder: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        FontHelper.applyMightySoulyFont(input, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        
        Object.entries(ModalStyles.input).forEach(([key, value]) => {
            input.style[key as any] = value;
        });
        
        return input;
    }
    
    private createErrorMsgElement(): HTMLDivElement {
        const errorMsg = document.createElement('div');
        FontHelper.applyMightySoulyFont(errorMsg, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        Object.entries(ModalStyles.errorMessage).forEach(([key, value]) => {
            errorMsg.style[key as any] = value;
        });
        
        return errorMsg;
    }
    
    private createButtonContainerElement(): HTMLDivElement {
        const container = document.createElement('div');
        FontHelper.applyMightySoulyFont(container, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        Object.entries(ModalStyles.buttonContainer).forEach(([key, value]) => {
            container.style[key as any] = value;
        });
        
        return container;
    }
    
    private createActionButton(text: string, onClick: () => void, isCancel = false): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = text;
        FontHelper.applyMightySoulyFont(button,'30px'); // Ajoute cette ligne
        // Appliquer les styles de base
        Object.entries(ModalStyles.button.base).forEach(([key, value]) => {
            button.style[key as any] = value;
        });
        
        // Appliquer les styles spécifiques
        const specificStyles = isCancel ? ModalStyles.button.cancel : ModalStyles.button.create;
        Object.entries(specificStyles).forEach(([key, value]) => {
            button.style[key as any] = value;
        });
        FontHelper.applyMightySoulyFont(button, FontHelper.BUTTON_FONT_SIZE); // Ajoute cette ligne
        button.onclick = onClick;
        
        return button;
    }
    
    private closeModal(modal: HTMLDivElement): void {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }

    // Méthodes privées pour la fonctionnalité de jointure de tournoi
    private createTournamentListContainer(): HTMLDivElement {
        const container = document.createElement('div');
        FontHelper.applyMightySoulyFont(container, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        // Styles pour le container de liste
        const styles = {
            width: '90%',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px',
            margin: '10px 0',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '5px'
        };
        
        Object.entries(styles).forEach(([key, value]) => {
            container.style[key as any] = value;
        });
        
        return container;
    }

    
    private renderTournamentList(
        tournaments: Array<{id: string, name: string, players: any[], host: any, max_players?: number}>,
        container: HTMLDivElement,
        modal: HTMLDivElement,
        resolve: (value: string | PromiseLike<string>) => void
    ): void {
        // Vider le container
        container.innerHTML = '';
        
        console.log("Rendering tournaments:", tournaments);
        
        if (!tournaments || tournaments.length === 0) {
            const noTournamentMsg = document.createElement('div');
            noTournamentMsg.textContent = 'No tournaments available.';
            noTournamentMsg.style.color = 'white';
            noTournamentMsg.style.textAlign = 'center';
            noTournamentMsg.style.padding = '10px';
            FontHelper.applyMightySoulyFont(noTournamentMsg, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
            container.appendChild(noTournamentMsg);
            return;
        }
        
        // Créer un bouton pour chaque tournoi
        tournaments.forEach(tournament => {
            // Déterminer le nombre de joueurs
            console.log(tournament);
            console.log(tournament.players);
            const playerCount = Array.isArray(tournament.players) ? tournament.players.length : 0;
            const maxPlayers = tournament.max_players || 4;
            
            const tournamentButton = document.createElement('button');
            tournamentButton.textContent = tournament.name || 'Unnamed Tournament';
            FontHelper.applyMightySoulyFont(tournamentButton, FontHelper.BUTTON_FONT_SIZE); // Ajoute cette ligne
            
            // Styles pour les boutons de tournoi
            const styles = {
                width: '100%',
                padding: '10px',
                margin: '5px 0',
                backgroundColor: 'rgba(74, 74, 143, 0.7)',
                color: 'white',
                border: '1px solid #5d5daa',
                borderRadius: '5px',
                cursor: 'pointer',
                textAlign: 'left'
            };
            
            Object.entries(styles).forEach(([key, value]) => {
                tournamentButton.style[key as any] = value;
            });
            
            // Informations additionnelles
            const infoSpan = document.createElement('span');
            infoSpan.textContent = ` (${playerCount}/${maxPlayers} players)`;
            infoSpan.style.fontSize = '0.8em';
            infoSpan.style.opacity = '0.8';
            FontHelper.applyMightySoulyFont(infoSpan, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
            tournamentButton.appendChild(infoSpan);
            
            // Nom de l'hôte si disponible
            if (tournament.host && tournament.host.username) {
                const hostSpan = document.createElement('span');
                hostSpan.textContent = ` • Host: ${tournament.host.username}`;
                hostSpan.style.fontSize = '0.8em';
                hostSpan.style.opacity = '0.8';
                hostSpan.style.display = 'block';
                FontHelper.applyMightySoulyFont(hostSpan, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
                tournamentButton.appendChild(hostSpan);
            }
            
            // Effets de survol
            tournamentButton.addEventListener('mouseover', () => {
                tournamentButton.style.backgroundColor = 'rgba(93, 93, 170, 0.8)';
            });
            
            tournamentButton.addEventListener('mouseout', () => {
                tournamentButton.style.backgroundColor = 'rgba(74, 74, 143, 0.7)';
            });
            
            // Action lors du clic
            tournamentButton.onclick = () => {
                resolve(tournament.id);
                this.closeModal(modal);
            };
            
            container.appendChild(tournamentButton);
        });
    }

    private renderErrorMessage(
        error: Error, 
        container: HTMLDivElement,
        modal: HTMLDivElement,
        resolve: (value: string | PromiseLike<string>) => void,
        reject: (reason?: any) => void
    ): void {
        console.error('Error fetching tournaments:', error);
        container.innerHTML = '';
        
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Failed to load tournaments. Please try again.';
        errorMsg.style.color = '#ff6b6b';
        errorMsg.style.textAlign = 'center';
        errorMsg.style.padding = '10px';
        container.appendChild(errorMsg);
        
        // Bouton pour réessayer
        const retryButton = this.createActionButton('Retry', () => {
            this.closeModal(modal);
            setTimeout(() => {
                this.showJoinTournament().then(resolve).catch(reject);
            }, 300);
        });
        
        // Ajouter le bouton au centre
        retryButton.style.display = 'block';
        retryButton.style.margin = '10px auto';
        container.appendChild(retryButton);
    }

    // Ajouter ces méthodes à votre classe TournamentScreen

    // Stockage de l'état du tournoi
    private activeTournamentId: string | null = null;
    private activeTournamentModal: HTMLDivElement | null = null;
    private playersContainer: HTMLDivElement | null = null;

    // Méthode pour afficher le tournoi en attente
    public showTournamentWaiting(tournamentId: string, tournamentName: string, initialPlayers: any[]): void {
        this.activeTournamentId = tournamentId;
    
        const modal = this.createModalElement();
        this.activeTournamentModal = modal;

        const title = this.createTitleElement(`Tournoi: ${tournamentName}`);
        FontHelper.applyMightySoulyFont(title, FontHelper.TITLE_FONT_SIZE); // Ajoute cette ligne

        const playersInfo = document.createElement('div');
        playersInfo.textContent = 'Joueurs: 1/4';
        playersInfo.style.color = '#ffcc00';
        playersInfo.style.fontSize = '18px';
        playersInfo.style.marginBottom = '15px';
        FontHelper.applyMightySoulyFont(playersInfo, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        
        const playersContainer = document.createElement('div');
        this.playersContainer = playersContainer;
        playersContainer.style.width = '90%';
        playersContainer.style.maxHeight = '200px';
        playersContainer.style.overflowY = 'auto';
        playersContainer.style.padding = '10px';
        playersContainer.style.margin = '10px 0';
        playersContainer.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        playersContainer.style.borderRadius = '5px';
        FontHelper.applyMightySoulyFont(playersContainer, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        
       
        const infoMessage = document.createElement('div');
        infoMessage.textContent = 'Le tournoi commencera automatiquement lorsque 4 joueurs auront rejoint';
        infoMessage.style.color = '#aaaaaa';
        infoMessage.style.fontSize = '14px';
        infoMessage.style.margin = '15px 0';
        infoMessage.style.textAlign = 'center';
        FontHelper.applyMightySoulyFont(infoMessage, FontHelper.TEXT_FONT_SIZE); // Ajoute cette ligne
        
        // Bouton pour quitter le tournoi
        const cancelButton = this.createActionButton('Quitter le tournoi', () => {
            this.leaveTournament(tournamentId);
            this.closeModal(modal);
           GameUI.showLobbyButtons();
        }, true);
        cancelButton.style.margin = '15px auto';
        cancelButton.style.display = 'block';
        FontHelper.applyMightySoulyFont(cancelButton, FontHelper.BUTTON_FONT_SIZE); // Ajoute cette ligne

        modal.appendChild(title);
        modal.appendChild(playersInfo);
        modal.appendChild(playersContainer);
        modal.appendChild(infoMessage);
        modal.appendChild(cancelButton);
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 50);
        
        this.updateTournamentPlayers(tournamentId, initialPlayers);
    }

    //methode pour afficher les match a venir
    public showTournamentMatch(tournamentId: string, tournamentName: string, opponentName: string, userName:string): void {
        this.activeTournamentId = tournamentId;
        GameUI.showAnimationMatch(userName, opponentName, tournamentName);
        setTimeout(() => {     
                // Indiquer au serveur que le joueur est prêt après l'animation
                const customEvent = new CustomEvent('websocket_request', { 
                    detail: {
                        type: 'tournament_player_ready',
                        tournament_id: tournamentId
                    },
                    bubbles: true
                });
                document.dispatchEvent(customEvent);
            }, 500);
    }
        
    // Méthode pour mettre à jour la liste des joueurs
    public updateTournamentPlayers(tournamentId: string, players: any[]): void {
        if (this.activeTournamentId !== tournamentId || !this.activeTournamentModal || !this.playersContainer) {
            console.error("Tournament display not active");
            return;
        }
        const playersInfo = this.activeTournamentModal.querySelector('div') as HTMLDivElement;
        if (playersInfo) {
            playersInfo.textContent = `Joueurs: ${players.length}/4`;
        }

        this.playersContainer.innerHTML = '';
        
        players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.style.padding = '8px';
            playerElement.style.margin = '5px 0';
            playerElement.style.backgroundColor = index === 0 ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            playerElement.style.borderRadius = '4px';
            playerElement.style.display = 'flex';
            playerElement.style.alignItems = 'center';
            
            if (index === 0) {
                const hostBadge = document.createElement('div');
                hostBadge.textContent = 'HOST';
                hostBadge.style.backgroundColor = '#ffcc00';
                hostBadge.style.color = '#333';
                hostBadge.style.padding = '2px 6px';
                hostBadge.style.borderRadius = '3px';
                hostBadge.style.fontSize = '10px';
                hostBadge.style.marginRight = '8px';
                hostBadge.style.fontWeight = 'bold';
                playerElement.appendChild(hostBadge);
            }
            const playerName = document.createElement('span');
            playerName.textContent = player.username || 'Unknown Player';
            playerElement.appendChild(playerName);
            this.playersContainer?.appendChild(playerElement);
        });

        if (players.length >= 4) {
            this.prepareStartTournament();
        }
    }

    // Méthode pour quitter un tournoi
    private leaveTournament(tournamentId: string): void {
        // Envoyer la requête au serveur
        const customEvent = new CustomEvent('websocket_request', { 
            detail: {
                type: 'leave_tournament',
                tournament_id: tournamentId
            },
            bubbles: true
        });
        document.dispatchEvent(customEvent);
        
        // Nettoyer les ressources
        if (this.activeTournamentModal) {
            clearInterval((this.activeTournamentModal as any).loadingAnimation);
            this.activeTournamentModal = null;
        }
        this.activeTournamentId = null;
        this.playersContainer = null;
    }

    // Méthode pour préparer le démarrage du tournoi
    
    // Modifier la méthode prepareStartTournament pour qu'elle se ferme plus rapidement
    private prepareStartTournament(): void {
        if (this.activeTournamentModal) {
            this.activeTournamentModal.innerHTML = '';
            setTimeout(() => {
                this.closeModal(this.activeTournamentModal!);
                this.activeTournamentModal = null;
                this.activeTournamentId = null;
                this.playersContainer = null;
            }, 100);
        }
    }


    private requestTournaments(): Promise<Array<{id: string, name: string, players: any[], host: any}>> {
        return new Promise((resolve, reject) => {
            const requestId = `tournament_request_${Date.now()}`;
            const handleResponse = (event: Event) => {
                const customEvent = event as CustomEvent;
                const data = customEvent.detail;
                if (data.type === 'all_tournaments') {
                    document.removeEventListener('websocket_response', handleResponse);
                    const formattedTournaments = data.tournaments.map((tournament: any) => ({
                        id: tournament.id,
                        name: tournament.name,
                        players: tournament.players || [],
                        host: tournament.host,
                        max_players: 4  
                    }));
                    
                    resolve(formattedTournaments);
                }
            };
            
            document.addEventListener('websocket_response', handleResponse);
            
            const customEvent = new CustomEvent('websocket_request', {
                detail: {
                    type: 'get_all_tournaments',
                    request_id: requestId
                },
                bubbles: true
            });
            document.dispatchEvent(customEvent);
            setTimeout(() => {
                document.removeEventListener('websocket_response', handleResponse);
                reject(new Error('Request timed out'));
            }, 10000);
        });
    }

    public closeActiveTournamentModal(): void {
        if (this.activeTournamentModal) {
           
            if ((this.activeTournamentModal as any).loadingAnimation) {
                clearInterval((this.activeTournamentModal as any).loadingAnimation);
            }
            
         
            this.closeModal(this.activeTournamentModal);
            
            this.activeTournamentModal = null;
            this.activeTournamentId = null;
            this.playersContainer = null;
        }
    }

}