import { BaseScreen } from "../components/Screen.js";
import { FontHelper } from "../../FontHelper.js";

export class DifficultyScreen extends BaseScreen {
  private template!: string;

  constructor() {
    super("difficulty-screen");
  }

  private async loadTemplate(): Promise<void> {
    const response = await fetch(
      "/src/Views/Game/UI/screens/DifficultyScreen.html"
    );
    this.template = await response.text();
  }

  public async show(): Promise<string> {
    return new Promise(async (resolve) => {
      if (!this.template) {
        await this.loadTemplate();
      }

      this.clearContainer();
      this.container.innerHTML = this.template;

      // Apply fonts
      const title = this.container.querySelector(
        ".screen-title"
      ) as HTMLElement;
      const cardTitles = this.container.querySelectorAll(
        ".card-title"
      ) as NodeListOf<HTMLElement>;

      FontHelper.applyMightySoulyFont(title);
      cardTitles.forEach((cardTitle) => {
        FontHelper.applyMightySoulyFont(cardTitle);
      });

      // Add click handlers
      const cards = this.container.querySelectorAll(
        ".card"
      ) as NodeListOf<HTMLElement>;
      cards.forEach((card) => {
        card.addEventListener("click", () => {
          // Animation de sortie
          this.container.style.opacity = "0";
          this.container.style.transition = "all 0.3s ease";

          setTimeout(() => {
            this.hide();
            resolve(card.id);
          }, 300);
        });
      });

      // Add back button handler
      const backButton = this.container.querySelector(
        ".back-button"
      ) as HTMLElement;
      backButton.addEventListener("click", () => {
        // Animation de sortie
        this.container.style.opacity = "0";
        this.container.style.transition = "all 0.3s ease";

        setTimeout(() => {
          this.hide();
          resolve("back");
        }, 300);
      });

      // Animation d'entrée
      // Make the container visible
      this.container.style.display = "flex";
      this.container.style.opacity = "0";
      this.container.style.transition = "all 0.3s ease";
      this.isVisible = true;

      // Reset base screen styles that conflict with our custom CSS
      this.container.style.top = "0";
      this.container.style.left = "0";
      this.container.style.right = "0";
      this.container.style.bottom = "0";
      this.container.style.transform = "none";

      setTimeout(() => {
        this.container.style.opacity = "1";
      }, 10);
      this.container.style.padding = "0"; // Let the screen-content handle padding
      this.container.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    });
  }
}
