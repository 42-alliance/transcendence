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
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.padding = '20px';
        this.container.style.borderRadius = '10px';
        this.container.style.textAlign = 'center';
        
        // Create spinner
        const spinner = document.createElement('div');
        spinner.style.border = '5px solid #f3f3f3';
        spinner.style.borderTop = '5px solid #3498db';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.animation = 'spin 2s linear infinite';
        spinner.style.margin = '0 auto 15px auto';
        
        // Create message
        this.message = document.createElement('p');
        this.message.style.color = 'white';
        this.message.style.fontSize = '16px';
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