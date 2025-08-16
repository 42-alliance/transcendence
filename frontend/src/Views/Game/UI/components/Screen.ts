import { IScreen } from "../interfaces/IScreen.js";

export abstract class BaseScreen implements IScreen {
  protected container: HTMLDivElement;
  protected isVisible: boolean = false;

  constructor(id: string) {
    this.container = document.createElement("div");
    this.container.id = id;
    this.container.style.display = "none"; // Only set display none, let CSS handle the rest

    document.body.appendChild(this.container);
  }

  public abstract show(): Promise<string>;

  public hide(): void {
    this.container.style.display = "none";
    this.isVisible = false;
  }

  protected addElement(element: HTMLElement): void {
    this.container.appendChild(element);
  }

  protected clearContainer(): void {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}
