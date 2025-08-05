// Ajouter ceci au début du fichier
import { getUserInfos } from "../../User/me.js";
import { GameWebSocket } from "./GameWebSocket.js";
import { GameUI } from "./GameUI.js";
import AView from "../AView.js";
import { fetchApi } from "../../fetchApi.js";

// Classe pour gérer le carrousel linéaire
class CarouselManager {
  private currentIndex: number = 0;
  private cards: NodeListOf<HTMLElement>;
  private carousel: HTMLElement;
  private indicators: NodeListOf<HTMLElement>;
  private totalCards: number;

  constructor() {
    this.carousel = document.getElementById("carousel") as HTMLElement;
    this.cards = document.querySelectorAll(".card");
    this.indicators = document.querySelectorAll(".indicator");
    this.totalCards = this.cards.length;
    this.setupEventListeners();
    this.updateCarousel();
  }

  private setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("next");

    prevBtn?.addEventListener("click", () => this.previous());
    nextBtn?.addEventListener("click", () => this.next());

    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.previous();
      if (e.key === "ArrowRight") this.next();
    });

    // Card click events (pour navigation seulement, pas pour jouer)
    this.cards.forEach((card, index) => {
      card.addEventListener("click", (e) => {
        // Vérifier si le clic n'est pas sur le bouton play
        const target = e.target as HTMLElement;
        if (!target.closest(".play-button")) {
          if (index !== this.currentIndex) {
            this.goToSlide(index);
          }
        }
      });
    });
  }

  private updateCarousel() {
    // Positions : 0=gauche, 1=centre(active), 2=droite, 3=caché
    const positions = [
      "position-left",
      "position-center",
      "position-right",
      "position-hidden",
    ];

    this.cards.forEach((card, index) => {
      // Calculer la position relative de chaque carte par rapport à l'index actuel
      let relativePosition =
        (index - this.currentIndex + this.totalCards) % this.totalCards;

      // Ajuster pour notre système de 4 positions (0,1,2,3)
      if (relativePosition >= 3) {
        relativePosition = 3; // Toutes les autres cartes sont cachées
      }

      // Supprimer toutes les classes de position
      card.classList.remove(
        "position-left",
        "position-center",
        "position-right",
        "position-hidden"
      );

      // Ajouter la nouvelle classe de position
      card.classList.add(positions[relativePosition]);

      // La carte au centre est active
      card.classList.toggle("active", relativePosition === 1);
    });

    // Mise à jour des indicateurs
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === this.currentIndex);
    });
  }

  public next() {
    this.currentIndex = (this.currentIndex + 1) % this.totalCards;
    this.updateCarousel();
  }

  public previous() {
    this.currentIndex =
      (this.currentIndex - 1 + this.totalCards) % this.totalCards;
    this.updateCarousel();
  }

  public goToSlide(index: number) {
    if (index >= 0 && index < this.totalCards) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public destroy() {
    // Supprimer tous les event listeners
    const prevBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("next");

    prevBtn?.removeEventListener("click", () => this.previous());
    nextBtn?.removeEventListener("click", () => this.next());

    this.indicators.forEach((indicator) => {
      indicator.removeEventListener("click", () => {});
    });

    this.cards.forEach((card) => {
      card.removeEventListener("click", () => {});
    });

    document.removeEventListener("keydown", () => {});
  }

  // Méthodes supplémentaires
  public addPulseToCard(index: number) {
    if (index >= 0 && index < this.totalCards) {
      this.cards[index].classList.add("pulse");
    }
  }

  public removePulseFromCard(index: number) {
    if (index >= 0 && index < this.totalCards) {
      this.cards[index].classList.remove("pulse");
    }
  }

  public getActiveCard(): HTMLElement | null {
    return this.cards[this.currentIndex] || null;
  }
}

export default class extends AView {
  private webSocket: GameWebSocket | null = null;
  private user_info: any;
  private carouselManager: CarouselManager | null = null;
  private routeChangeHandler: ((event: PopStateEvent | null) => void) | null =
    null;

  constructor() {
    super();
    // Conserver l'instance dans la variable globale
    (window as any).gameInstance = this;
    this.initializeUserInfo();
    this.setupRouteChangeListener();
  }

  private async initializeUserInfo() {
    this.user_info = await getUserInfos();
  }

  private setupRouteChangeListener() {
    // Créer une fonction pour gérer les changements de route
    this.routeChangeHandler = () => {
      // Vérifier si nous quittons la page du jeu
      if (!window.location.pathname.includes("/game")) {
        // effacetr tout les element qui peuvent etre encore pressent
        GameUI.clearScreens();
        console.warn("Quitting game page, sending leave_queue message");

        // Informer le serveur que l'utilisateur quitte la page
        this.webSocket?.sendMessage("leave", {
          user: this.user_info,
          type: "leave",
        });

        window.removeEventListener("popstate", this.routeChangeHandler!);
        this.routeChangeHandler = null;
      }
    };

    // Ajouter l'écouteur d'événements pour les changements d'historique du navigateur
    window.addEventListener("popstate", this.routeChangeHandler);

    // Intercepter les clics sur les liens pour détecter les changements de route
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest("[data-link]");

      if (linkElement instanceof HTMLElement) {
        const href = linkElement.getAttribute("href");
        if (href) {
          event.preventDefault(); // Empêcher le comportement par défaut du lien
          GameUI.clearScreens();
          console.log(
            "Clicking link to leave game page, sending leave_queue message"
          );
          this.webSocket?.sendMessage("leave", {
            user: this.user_info,
            type: "leave",
          });

          // On laisse l'événement se poursuivre normalement
        }
      }
    });
  }

  async executeViewScript() {
    console.log("Executing view script...");
    await this.connectToMatchmaking();
  }

  getUser(): { id: string; name: string } {
    // Replace with actual logic to retrieve the current user's I
    return { id: this.user_info.id, name: this.user_info.name };
  }
  async connectToMatchmaking() {
    console.log("Connecting to matchmaking...");
    if (this.user_info === null) {
      console.error("User info not found");
      return;
    }

    const user_info = await getUserInfos();

    console.log("User info: --------", this.user_info);
    (window as any).user_info = this.user_info; // Store user info globally for access in other parts of the app
    // Remplace l'URL vide par celle du gateway qui route vers le service game
    fetchApi("/game/matchmaking", {
      method: "GET",
      headers: {
        "x-user-name": user_info?.name ?? "",
      },
    })
      .then((response) => {
        console.log("Matchmaking response received:", response);
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        console.log("Matchmaking data:", data);
        if (data.success) {
          // Initialize WebSocket
          this.webSocket = new GameWebSocket(this.user_info);
          this.webSocket.initializeWebSocket();
          // Store the WebSocket instance globally for access in other parts of the app
          (window as any).gameWsClass = this.webSocket;

          // S'assurer que GameUI est initialisé pour charger les écrans
          GameUI.initialize();

          // Initialiser le carrousel 3D
          this.initializeCarousel();

          // Set up event listeners for buttons
          this.setupButtonEventListeners();
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  private setupButtonEventListeners() {
    // Écouter les clics sur les boutons play des cartes
    const randomPlayBtn = document.querySelector(
      "#randomAdversaireButton .play-button"
    );
    const localPlayBtn = document.querySelector("#localButton .play-button");
    const tournamentPlayBtn = document.querySelector(
      "#tournamentButton .play-button"
    );
    const iaPlayBtn = document.querySelector("#iaButton .play-button");

    randomPlayBtn?.addEventListener("click", (e) => {
      e.stopPropagation(); // Empêcher le clic de remonter à la carte
      console.log("Random adversaire play button clicked");
      GameUI.displayWaiting();
      GameUI.displayBackButton(this.webSocket, this.user_info);
      this.webSocket?.sendMessage("random_adversaire", {
        user: this.user_info,
        type: "random_adversaire",
      });
    });

    localPlayBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Local play button clicked");
      GameUI.displayWaiting();
      this.hideCarousel();
      setTimeout(() => {
        // GameUI.displayBackButton(this.webSocket, this.user_info);
        console.log("Sending local play message");
        this.webSocket?.sendMessage("local", {
          user: this.user_info,
          type: "local",
        });
      }, 1000);
    });

    iaPlayBtn?.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        console.log("button ia clicked");
        this.hideCarousel();
        const difficultyMode = await GameUI.displayDifficultyButtons();
        console.log("Selected difficulty:", difficultyMode);
        if (difficultyMode === "back") {
          this.showCarousel();
          return;
        }
        if (difficultyMode) {
          GameUI.displayWaiting();
          this.webSocket?.sendMessage("ia", {
            user: this.user_info,
            difficulty: difficultyMode,
            type: "ia",
          });
        }
      } catch (error) {
        console.error("Error selecting difficulty:", error);
        this.showCarousel();
      }
    });

    tournamentPlayBtn?.addEventListener("click", async (e) => {
      e.stopPropagation();
      console.log("Tournament play button clicked");
      try {
        if (!GameUI.hasScreen("tournament")) {
          console.error("Tournament screen not found");
          return;
        }

        const optionSelect = await GameUI.showScreen("tournament");

        if (optionSelect) {
          console.log("Tournament option selected:", optionSelect);

          if (optionSelect === "create") {
            try {
              const tournamentScreen = GameUI.getScreen("tournament");
              if (
                tournamentScreen &&
                "showCreateTournament" in tournamentScreen
              ) {
                const tournamentName = await (
                  tournamentScreen as {
                    showCreateTournament: () => Promise<string | null>;
                  }
                ).showCreateTournament();

                if (tournamentName) {
                  console.log("Tournament name:", tournamentName);
                  GameUI.displayWaiting();

                  this.webSocket?.sendMessage("create_tournament", {
                    user: this.user_info,
                    tournament_name: tournamentName,
                    type: "create_tournament",
                  });
                } else {
                  GameUI.showScreen("tournament");
                  this.showCarousel();
                }
              }
            } catch (error) {
              console.error("Error creating tournament:", error);
              this.showCarousel();
            }
          } else if (optionSelect === "join") {
            const tournamentScreen = GameUI.getScreen("tournament");
            if (tournamentScreen && "showJoinTournament" in tournamentScreen) {
              const tournamentId = await (
                tournamentScreen as {
                  showJoinTournament: () => Promise<string | null>;
                }
              ).showJoinTournament();

              if (tournamentId) {
                console.log("Tournament ID:", tournamentId);
                GameUI.displayWaiting();

                this.webSocket?.sendMessage("join_tournament", {
                  user: this.user_info,
                  tournament_id: tournamentId,
                  type: "join_tournament",
                });
              } else {
                GameUI.showScreen("tournament");
              }
            }
          } else if (optionSelect === "cancel") {
            GameUI.hideScreen("tournament");
            this.showCarousel();
          }
        } else {
          this.showCarousel();
        }
      } catch (error) {
        console.error("Error with tournament selection:", error);
        this.showCarousel();
      }
    });
  }

  private initializeCarousel() {
    // Attendre que le DOM soit prêt avant d'initialiser le carrousel
    setTimeout(() => {
      this.carouselManager = new CarouselManager();
    }, 100);
  }

  disconnect() {
    if (this.webSocket) {
      this.webSocket.disconnect();
      this.webSocket = null;
    }
  }
  destroy() {
    console.log("Destroying Game view...");

    // Nettoyer le carrousel
    if (this.carouselManager) {
      this.carouselManager.destroy();
      this.carouselManager = null;
    }

    this.disconnect();
    // Supprimer l'instance de jeu de la variable globale
    (window as any).gameInstance = null;
    // Supprimer l'écouteur de changement de route
    if (this.routeChangeHandler) {
      window.removeEventListener("popstate", this.routeChangeHandler);
      this.routeChangeHandler = null;
    }
    // Appeler la méthode destroy de la classe parente
  }

  // Méthodes publiques pour accéder au carrousel depuis l'extérieur
  public getCarouselManager(): CarouselManager | null {
    return this.carouselManager;
  }

  public goToGameMode(index: number) {
    if (this.carouselManager) {
      this.carouselManager.goToSlide(index);
    }
  }

  async getHtml() {
    try {
      const response = await fetch("src/Views/Game/Game.html");
      if (!response.ok) {
        throw new Error(`Failed to load HTML file: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(error);
      return `<p>Erreur lors du chargement du formulaire</p>`;
    }
  }

  private hideCarousel(): void {
    const carousel = document.getElementById("carousel");
    if (carousel) {
      carousel.style.display = "none";
    }
    // hide arrow buttons
    const prevBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("next");
    if (prevBtn) {
      prevBtn.style.display = "none";
    }
    if (nextBtn) {
      nextBtn.style.display = "none";
    }
  }

  private showCarousel(): void {
    const carousel = document.getElementById("carousel");
    if (carousel) {
      carousel.style.display = "block";
    }
    // show arrow buttons
    const prevBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("next");
    if (prevBtn) {
      prevBtn.style.display = "block";
    }
    if (nextBtn) {
      nextBtn.style.display = "block";
    }
  }
}
