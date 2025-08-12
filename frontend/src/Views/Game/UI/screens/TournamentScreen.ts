import { BaseScreen } from '../components/Screen.js';
import { GameUI } from '../../GameUI.js';
import { ModalStyles } from '../styles/ModalStyles.js';


export class TournamentScreen extends BaseScreen {
  private template: string | null = null;
  private resolving = false;

  constructor() { super('tournament-screen'); }

  private async loadTemplate(): Promise<void> {
    if (this.template) return;
    const response = await fetch('/src/Views/Game/UI/screens/TournamentScreen.html');
    this.template = await response.text();
    // Inject CSS if not already present
    if (!document.querySelector('link[data-tournament-screen-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/src/Views/Game/UI/screens/TournamentScreen.css';
      link.setAttribute('data-tournament-screen-css', '');
      document.head.appendChild(link);
    }
  }

  public show(): Promise<string> {
    return new Promise(async (resolve) => {
      await this.loadTemplate();
      this.clearContainer();
      this.container.innerHTML = this.template!;
      this.container.style.display = 'block';
      this.isVisible = true;

      const screenRoot = this.container.querySelector('.tournament-screen') as HTMLElement | null;
      const contentRoot = this.getContentRoot();

      // Helper to render root options (Create / Join / Back)
      const renderRootOptions = () => {
        if (!contentRoot) return;
        contentRoot.innerHTML = `
          <h2 id="tournament-title" class="tournament-title">Tournament Mode</h2>
          <p class="tournament-subtitle">Forge your path to victory</p>
          <div class="tournament-buttons">
            <button id="tournament-create" class="t-btn primary" type="button">Create Tournament</button>
            <button id="tournament-join" class="t-btn secondary" type="button">Join Tournament</button>
          </div>
          <button id="tournament-back" class="t-btn ghost" type="button">Back</button>`;

        const btnCreate = contentRoot.querySelector('#tournament-create') as HTMLButtonElement | null;
        const btnJoin = contentRoot.querySelector('#tournament-join') as HTMLButtonElement | null;
        const btnBack = contentRoot.querySelector('#tournament-back') as HTMLButtonElement | null;

        btnCreate?.addEventListener('click', () => finalize('create'));
        btnJoin?.addEventListener('click', () => finalize('join'));
        btnBack?.addEventListener('click', () => finalize('cancel'));

        [btnCreate, btnJoin, btnBack].forEach(btn => {
          btn?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.target as HTMLElement).click(); }
          });
        });
      };

      if (screenRoot) {
        screenRoot.style.opacity = '0';
        requestAnimationFrame(() => {
          screenRoot.style.transition = 'opacity .3s ease';
          screenRoot.style.opacity = '1';
        });
      }

      const finalize = (val: string) => {
        if (this.resolving) return; this.resolving = true;
        if (screenRoot) {
          screenRoot.style.opacity = '0';
          setTimeout(() => { this.hide(); resolve(val); }, 300);
        } else {
          this.hide(); resolve(val);
        }
      };

      renderRootOptions();
    });
  }

  // Helper to get card content root
  private getContentRoot(): HTMLElement | null {
    return this.container.querySelector('.tournament-card-content');
  }

  // New in-card creation flow
  public showCreateTournament(): Promise<string | null> {
    // Ensure screen visible if previous show() hid it
    if (this.container.style.display === 'none') {
      this.container.style.display = 'block';
      const screenRoot = this.container.querySelector('.tournament-screen') as HTMLElement | null;
      if (screenRoot) {
        screenRoot.style.opacity = '1';
      }
    }
    const content = this.getContentRoot();
    if (!content) return Promise.resolve(null);
    content.innerHTML = `
      <h2 class="tournament-title">Create Tournament</h2>
      <p class="tournament-subtitle">Enter a name</p>
      <div style="width:100%;display:flex;flex-direction:column;gap:1rem;">
        <input id="tournament-name-input" type="text" placeholder="Tournament name" style="padding:.9rem 1rem;border-radius:14px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.35);color:#fff;font-family:Poppins,sans-serif;font-size:.95rem;outline:none;backdrop-filter:blur(3px);" />
        <div id="tournament-name-error" style="color:#ff6b6b;font-size:.75rem;min-height:1em;letter-spacing:.5px;text-align:center;"></div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;">
          <button id="tournament-create-confirm" class="t-btn primary" style="flex:1;min-width:140px;opacity:.6;pointer-events:none;">Create</button>
          <button id="tournament-create-cancel" class="t-btn ghost" style="flex:1;min-width:140px;">Back</button>
        </div>
      </div>`;

    const input = content.querySelector('#tournament-name-input') as HTMLInputElement;
    const error = content.querySelector('#tournament-name-error') as HTMLDivElement;
    const btnConfirm = content.querySelector('#tournament-create-confirm') as HTMLButtonElement;
    const btnBack = content.querySelector('#tournament-create-cancel') as HTMLButtonElement;

    return new Promise((resolve) => {
      let done = false;
      const finish = (val: string | null) => { if (done) return; done = true; resolve(val); };

      const validate = () => {
        const value = input.value.trim();
        if (value.length === 0) {
          btnConfirm.style.opacity = '.6';
          btnConfirm.style.pointerEvents = 'none';
          return;
        }
        btnConfirm.style.opacity = '1';
        btnConfirm.style.pointerEvents = 'auto';
      };

      input.addEventListener('input', validate);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          btnConfirm.click();
        } else if (e.key === 'Escape') {
          btnBack.click();
        }
      });

      btnConfirm.addEventListener('click', () => {
        const name = input.value.trim();
        if (!name) {
          error.textContent = 'Name required';
          return;
        }
        finish(name);
      });

      btnBack.addEventListener('click', () => {
        finish(null);
        // Re-render root options for UX
        const showPromise = this.show();
        showPromise.then(()=>{}); // ignore
      });

      setTimeout(() => input.focus(), 20);
      validate();
    });
  }

  // New in-card join flow
  public showJoinTournament(): Promise<string | null> {
    // Ensure screen visible if it was hidden
    if (this.container.style.display === 'none') {
      this.container.style.display = 'block';
      const screenRoot = this.container.querySelector('.tournament-screen') as HTMLElement | null;
      if (screenRoot) {
        screenRoot.style.opacity = '1';
      }
    }
    const content = this.getContentRoot();
    if (!content) return Promise.resolve(null);
    content.innerHTML = `
      <h2 class="tournament-title">Join Tournament</h2>
      <p class="tournament-subtitle" id="join-subtitle">Loading tournaments...</p>
      <div id="tournament-list" style="width:100%;max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:.6rem;padding:.25rem 0 .5rem;"></div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;width:100%;margin-top:.5rem;">
        <button id="tournament-join-back" class="t-btn ghost" style="flex:1;min-width:140px;">Back</button>
      </div>`;

    const list = content.querySelector('#tournament-list') as HTMLDivElement;
    const subtitle = content.querySelector('#join-subtitle') as HTMLParagraphElement;
    const backBtn = content.querySelector('#tournament-join-back') as HTMLButtonElement;

    return new Promise((resolve) => {
      let done = false; const finish = (val: string | null) => { if (done) return; done = true; resolve(val); };

      backBtn.addEventListener('click', () => { finish(null); const p = this.show(); p.then(()=>{}); });
      backBtn.addEventListener('keydown', (e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); backBtn.click(); } });

      // Fetch tournaments
      this.requestTournaments().then(tournaments => {
        if (done) return;
        if (!tournaments || tournaments.length === 0) {
          subtitle.textContent = 'No tournaments available';
          return;
        }
        subtitle.textContent = 'Select a tournament';
        tournaments.forEach(t => {
          const btn = document.createElement('button');
          btn.className = 't-btn secondary';
            btn.style.textAlign = 'left';
          btn.innerHTML = `<strong>${t.name || 'Unnamed'} </strong><span style="opacity:.8;font-size:.75rem;margin-left:.35rem;">(${(t.players||[]).length}/4)</span>`;
          btn.addEventListener('click', () => { finish(t.id); });
          btn.addEventListener('keydown', (e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); btn.click(); } });
          list.appendChild(btn);
        });
      }).catch(err => {
        if (done) return;
        subtitle.textContent = 'Failed to load tournaments';
        const retry = document.createElement('button');
        retry.className = 't-btn primary';
        retry.textContent = 'Retry';
        retry.addEventListener('click', () => { finish(null); const p = this.showJoinTournament(); p.then(()=>{}); });
        list.appendChild(retry);
      });
    });
  }
  // Stockage de l'état du tournoi
  private activeTournamentId: string | null = null;
  private activeTournamentModal: HTMLDivElement | null = null;
  private playersContainer: HTMLDivElement | null = null;

  // Helper methods reintroduced
  private createModalElement(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'create-tournament-modal';
    Object.entries(ModalStyles.container).forEach(([k,v]) => (modal.style as any)[k] = v);
    return modal;
  }
  private createTitleElement(text: string): HTMLHeadingElement {
    const title = document.createElement('h3');
    title.textContent = text;
    Object.entries(ModalStyles.title).forEach(([k,v]) => (title.style as any)[k] = v);
    return title;
  }
  private createActionButton(text: string, onClick: () => void, isCancel = false): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.entries(ModalStyles.button.base).forEach(([k,v]) => (btn.style as any)[k] = v);
    const specific = isCancel ? ModalStyles.button.cancel : ModalStyles.button.create;
    Object.entries(specific).forEach(([k,v]) => (btn.style as any)[k] = v);
    btn.onclick = onClick;
    return btn;
  }
  private closeModal(modal: HTMLDivElement): void {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
  }

  // Méthode pour afficher le tournoi en attente
  public showTournamentWaiting(tournamentId: string, tournamentName: string, initialPlayers: any[]): void {
      this.activeTournamentId = tournamentId;
  
      const modal = this.createModalElement();
      this.activeTournamentModal = modal;

      const title = this.createTitleElement(`Tournoi: ${tournamentName}`);

      const playersInfo = document.createElement('div');
      playersInfo.textContent = 'Joueurs: 1/4';
      playersInfo.style.color = '#ffcc00';
      playersInfo.style.fontSize = '18px';
      playersInfo.style.marginBottom = '15px';
      
      const playersContainer = document.createElement('div');
      this.playersContainer = playersContainer;
      playersContainer.style.width = '90%';
      playersContainer.style.maxHeight = '200px';
      playersContainer.style.overflowY = 'auto';
      playersContainer.style.padding = '10px';
      playersContainer.style.margin = '10px 0';
      playersContainer.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      playersContainer.style.borderRadius = '5px';
      
     
      const infoMessage = document.createElement('div');
      infoMessage.textContent = 'Le tournoi commencera automatiquement lorsque 4 joueurs auront rejoint';
      infoMessage.style.color = '#aaaaaa';
      infoMessage.style.fontSize = '14px';
      infoMessage.style.margin = '15px 0';
      infoMessage.style.textAlign = 'center';
      
      // Bouton pour quitter le tournoi
      const cancelButton = this.createActionButton('Quitter le tournoi', () => {
          this.leaveTournament(tournamentId);
          this.closeModal(modal);
         GameUI.showLobbyButtons();
      }, true);
      cancelButton.style.margin = '15px auto';
      cancelButton.style.display = 'block';

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
                  console.log('Received tournaments:', data.tournaments);
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