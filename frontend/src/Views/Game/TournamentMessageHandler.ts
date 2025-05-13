import { GameUI } from './GameUI.js';
import { getUserInfo } from './UserStore.js';

export class TournamentMessageHandler {
    handleTournamentMessage(message: any): boolean {
        switch (message.type) {
            case 'tournament_created':
                this.handleTournamentCreated(message);
                return true;

            case 'tournament_players_update':
                this.handleTournamentPlayersUpdate(message);
                return true;
            case 'tournament_match_starting':
                console.log("Tournament match starting:", message);
                this.handleTournamentMatchStarting(message);
                return true;
            case 'all_tournaments':
                this.handleAllTournamentsResponse(message);
                return true;

            case 'tournament_joined':
                this.handleTournamentJoined(message);
                return true;

            case 'tournament_match_update':
                this.handleTournamentMatchUpdate(message);
                return true;

            case 'tournament_match_result':
                this.handleTournamentMatchResult(message);
                return true;

            case 'tournament_final_match':
                this.handleTournamentFinalMatch(message);
                return true;

            default:
                return false; // Not a tournament message
        }
    }

    private handleTournamentMatchStarting(message: any): void {
        GameUI.hideSpinner();
        const tournamentScreen = GameUI.getScreen('tournament');
        if (tournamentScreen && 'showTournamentMatch' in tournamentScreen) {
            (tournamentScreen as any).showTournamentMatch(
                message.tournament_id,
                message.tournament,
                message.opponent
            );
        }
    }

    private handleTournamentCreated(message: any): void {
        GameUI.hideSpinner();
        const tournamentScreen = GameUI.getScreen('tournament');
        if (tournamentScreen && 'showTournamentWaiting' in tournamentScreen) {
            (tournamentScreen as any).showTournamentWaiting(
                message.id || message.tournament.id,
                message.name || message.tournament.name,
                message.players || message.tournament.players || []
            );
        }
    }

    private handleTournamentPlayersUpdate(message: any): void {
        console.log("Tournament players updated:", message.players);
        const tourScreen = GameUI.getScreen('tournament');
        if (tourScreen && 'updateTournamentPlayers' in tourScreen) {
            (tourScreen as any).updateTournamentPlayers(
                message.tournament_id,
                message.players
            );
        }
    }

    private handleAllTournamentsResponse(message: any): void {
        const tournamentEvent = new CustomEvent('websocket_response', {
            detail: {
                type: 'all_tournaments',
                request_id: message.request_id,
                tournaments: message.tournaments
            }
        });
        document.dispatchEvent(tournamentEvent);

        const tournamentEventResponse = new CustomEvent('websocket_response', {
            detail: message
        });
        document.dispatchEvent(tournamentEventResponse);
    }

    private handleTournamentJoined(message: any): void {
        GameUI.hideSpinner();
        const joinedTournamentScreen = GameUI.getScreen('tournament');
        if (joinedTournamentScreen && 'showTournamentWaiting' in joinedTournamentScreen) {
            (joinedTournamentScreen as any).showTournamentWaiting(
                message.tournament.id,
                message.tournament.name,
                message.tournament.players || []
            );
        } else {
            console.error("Tournament waiting screen not available");
            GameUI.showLobbyButtons();
        }
    }

    private handleTournamentMatchUpdate(message: any): void {
        const tournamentScreenUpdate = GameUI.getScreen('tournament');
        if (tournamentScreenUpdate && 'updateTournamentMatch' in tournamentScreenUpdate) {
            (tournamentScreenUpdate as any).updateTournamentMatch(
                message.tournament_id,
                message.match
            );
        }
    }

    private handleTournamentMatchResult(message: any): void {
        console.log("Tournament match result:", message);
        const tournamentScreenResult = GameUI.getScreen('tournament');
        if (tournamentScreenResult && 'updateTournamentEndMatch' in tournamentScreenResult) {
            (tournamentScreenResult as any).updateTournamentEndMatch(
                message.tournament_id,
                message.match_id,
                message.winner,
                message.current_user_id
            );
        }
    }

    private handleTournamentFinalMatch(message: any): void {
        console.log("Tournament final match starting:", message);

        this.closeTournamentModals();
        GameUI.clearGameResults();
        this.showFinalMatchOverlay(message.opponent);
    }

    private closeTournamentModals(): void {
        const finaltournamentScreen = GameUI.getScreen('tournament');
        if (finaltournamentScreen && 'closeActiveTournamentModal' in finaltournamentScreen) {
            (finaltournamentScreen as any).closeActiveTournamentModal();
        }
    }

    private showFinalMatchOverlay(opponent: string): void {
        // Créer une transition visuelle pour la finale
        const finalOverlay = document.createElement('div');
        finalOverlay.style.position = 'fixed';
        finalOverlay.style.top = '0';
        finalOverlay.style.left = '0';
        finalOverlay.style.width = '100%';
        finalOverlay.style.height = '100%';
        finalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        finalOverlay.style.display = 'flex';
        finalOverlay.style.flexDirection = 'column';
        finalOverlay.style.alignItems = 'center';
        finalOverlay.style.justifyContent = 'center';
        finalOverlay.style.zIndex = '1000';
        finalOverlay.style.transition = 'opacity 2s';

        const finalTitle = document.createElement('h1');
        finalTitle.textContent = 'FINALE DU TOURNOI';
        finalTitle.style.color = '#ffcc00';
        finalTitle.style.fontSize = '36px';
        finalTitle.style.marginBottom = '20px';

        const vsContainer = document.createElement('div');
        vsContainer.style.display = 'flex';
        vsContainer.style.alignItems = 'center';
        vsContainer.style.justifyContent = 'center';
        vsContainer.style.marginBottom = '30px';

        const player1 = document.createElement('div');
        player1.textContent = getUserInfo().name || 'You';
        player1.style.fontSize = '24px';
        player1.style.color = '#4CAF50';
        player1.style.padding = '10px 20px';

        const vsText = document.createElement('div');
        vsText.textContent = 'VS';
        vsText.style.margin = '0 15px';
        vsText.style.fontSize = '38px';
        vsText.style.color = 'white';

        const player2 = document.createElement('div');
        player2.textContent = opponent;
        player2.style.fontSize = '24px';
        player2.style.color = '#F44336';
        player2.style.padding = '10px 20px';

        vsContainer.appendChild(player1);
        vsContainer.appendChild(vsText);
        vsContainer.appendChild(player2);

        finalOverlay.appendChild(finalTitle);
        finalOverlay.appendChild(vsContainer);

        document.body.appendChild(finalOverlay);

        // Animation de l'écran de finale et suppression après 3 secondes
        setTimeout(() => {
            finalOverlay.style.opacity = '0';
            setTimeout(() => finalOverlay.remove(), 2000);
        }, 3000);
    }
}