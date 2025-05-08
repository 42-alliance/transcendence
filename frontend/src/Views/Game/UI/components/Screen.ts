import { IScreen } from '../interfaces/IScreen.js';

export abstract class BaseScreen implements IScreen {
    protected container: HTMLDivElement;
    protected isVisible: boolean = false;
    
    constructor(id: string) {
        this.container = document.createElement('div');
        this.container.id = id;
        this.container.style.position = 'fixed';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.display = 'none';
        this.container.style.zIndex = '1000';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.padding = '20px';
        this.container.style.borderRadius = '10px';
        this.container.style.textAlign = 'center';
        
        document.body.appendChild(this.container);
    }
    
    public abstract show(): Promise<string>;
    
    public hide(): void {
        this.container.style.display = 'none';
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