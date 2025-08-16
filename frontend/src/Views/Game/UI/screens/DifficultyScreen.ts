import { BaseScreen } from "../components/Screen.js";

export class DifficultyScreen extends BaseScreen {
  private template!: string;
  private hasResolved = false; // Prevent multiple resolutions

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
      this.hasResolved = false;

      const finalize = (value: string) => {
        if (this.hasResolved) return;
        this.hasResolved = true;
        // Animation de sortie
        this.container.style.opacity = "0";
        this.container.style.transition = "all 0.3s ease";
        setTimeout(() => {
          this.hide();
          resolve(value);
        }, 300);
      };

      // Cibles: sections de difficulté
      const sections = this.container.querySelectorAll(
        ".difficulty-section"
      ) as NodeListOf<HTMLElement>;

      sections.forEach((section) => {
        section.addEventListener("click", () => finalize(section.id));
        section.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            finalize(section.id);
          }
        });
      });

      // Back button
      const backButton = this.container.querySelector(
        ".back-button"
      ) as HTMLElement | null;
      backButton?.addEventListener("click", () => finalize("back"));
      backButton?.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          finalize("back");
        }
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
