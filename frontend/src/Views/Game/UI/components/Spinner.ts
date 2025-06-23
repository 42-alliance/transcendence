export class UISpinner {
    private container: HTMLDivElement;
    private message: HTMLParagraphElement;
    
    constructor() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'game-spinner';
        this.container.style.display = 'none';
        this.container.style.position = 'fixed';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.zIndex = '1000';
        this.container.style.backgroundColor = '';
        this.container.style.padding = '20px';
        this.container.style.borderRadius = '10px';
        this.container.style.textAlign = 'center';
        
        // Create spinner
        const spinner = document.createElement('div');
        spinner.style.border = '10px solid #f3f3f3';
        spinner.style.borderTop = '9px solid #3498db';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.animation = 'spin 2s linear infinite';
        spinner.style.margin = '0 auto 15px auto';
        
        // Create message
        this.message = document.createElement('p');
        this.message.style.color = 'white';
        this.message.style.fontSize = '32px';
        this.message.style.margin = '0';
        
        // Add keyframes for spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Append elements
        this.container.appendChild(spinner);
        this.container.appendChild(this.message);
        document.body.appendChild(this.container);
    }
    
    public show(message: string = 'Loading...'): void {
        this.message.textContent = message;
        this.container.style.display = 'block';
    }
    
    public hide(): void {
        this.container.style.display = 'none';
    }
    
    public updateMessage(message: string): void {
        this.message.textContent = message;
    }
}

export class ReturnArrowButton {
    private element: HTMLButtonElement;
    private container: HTMLDivElement;

    constructor() {
        // Create container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '20px';
        this.container.style.left = '20px';
        this.container.style.zIndex = '1000';

        // Create button element
        this.element = document.createElement('button');
        this.element.textContent = '← Back';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.element.style.color = 'white';
        this.element.style.border = '2px solid #6e72ff';
        this.element.style.borderRadius = '8px';
        this.element.style.padding = '10px 15px';
        this.element.style.cursor = 'pointer';
        this.element.style.transition = 'all 0.2s ease';
        this.element.style.backdropFilter = 'blur(4px)';
        this.element.style.boxShadow = '0 0 10px rgba(110, 114, 255, 0.3)';

        // Add hover effects
        this.element.onmouseenter = () => {
            this.element.style.backgroundColor = 'rgba(110, 114, 255, 0.3)';
            this.element.style.transform = 'scale(1.05)';
            this.element.style.boxShadow = '0 0 15px rgba(110, 114, 255, 0.5)';
        };

        this.element.onmouseleave = () => {
            this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            this.element.style.transform = 'scale(1)';
            this.element.style.boxShadow = '0 0 10px rgba(110, 114, 255, 0.3)';
        };

        // Add click event
        this.element.onclick = () => {
            window.history.back();
        };

        // Add button to container
        this.container.appendChild(this.element);
    }

    public show(): void {
        this.container.style.display = 'block';
    }

    public getElement(): HTMLDivElement {
        return this.container;
    }
}