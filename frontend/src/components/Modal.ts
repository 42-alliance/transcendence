export class Modal {
  private element: HTMLDivElement;
  private content: HTMLDivElement;
  private closeButton?: HTMLButtonElement;

  constructor(options: {
    id: string;
    title?: string;
    showClose?: boolean;
    onClose?: () => void;
  }) {
    this.element = document.createElement("div");
    this.element.id = options.id;
    this.element.className = "modal-dbz hidden";

    this.content = document.createElement("div");
    this.content.className = "modal-dbz-content";

    if (options.title) {
      const header = document.createElement("div");
      header.className = "flex items-center justify-between mb-4";

      const title = document.createElement("h2");
      title.className = "text-2xl font-dbz text-white";
      title.textContent = options.title;

      header.appendChild(title);

      if (options.showClose) {
        this.closeButton = document.createElement("button");
        this.closeButton.className =
          "text-white hover:text-dbz-orange transition-colors";
        this.closeButton.innerHTML = '<i class="fas fa-times"></i>';
        this.closeButton.onclick = () => this.hide();

        header.appendChild(this.closeButton);
      }

      this.content.appendChild(header);
    }

    this.element.innerHTML = `
            <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        `;
    this.element.appendChild(this.content);

    if (options.onClose) {
      this.element.addEventListener("click", (e) => {
        if (e.target === this.element) {
          options.onClose?.();
          this.hide();
        }
      });
    }

    document.body.appendChild(this.element);
  }

  setContent(content: string | HTMLElement) {
    if (typeof content === "string") {
      this.content.innerHTML = content;
    } else {
      this.content.appendChild(content);
    }
  }

  show() {
    this.element.classList.remove("hidden");
    this.content.classList.add("animate-power-up");
  }

  hide() {
    this.element.classList.add("hidden");
  }

  destroy() {
    this.element.remove();
  }
}

// Usage exemple:
/*
const modal = new Modal({
    id: 'my-modal',
    title: 'Modal Title',
    showClose: true,
    onClose: () => console.log('Modal closed')
});

modal.setContent(`
    <div class="p-4">
        <p class="text-white">Modal content goes here</p>
        <button class="btn-ki-primary mt-4">Action Button</button>
    </div>
`);

modal.show();
*/
