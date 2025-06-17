import { UIStyles } from '../styles/UIStyles.js';

export interface ContainerOptions {
    id: string;
    title?: string;
    width?: string;
    height?: string;
    customStyles?: Partial<CSSStyleDeclaration>;
}

export class UIContainer {
    private element: HTMLDivElement;
    private titleElement: HTMLHeadingElement | null = null;
    
    constructor(options: ContainerOptions) {
        this.element = document.createElement('div');
        this.element.id = options.id;
        this.element.className = 'ui-container';
        
        // Apply base styles
        Object.entries(UIStyles.container).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
        
        // Set size if provided
        if (options.width) this.element.style.width = options.width;
        if (options.height) this.element.style.height = options.height;
        
        // Apply custom styles if provided
        if (options.customStyles) {
            Object.entries(options.customStyles).forEach(([key, value]) => {
                if (value) this.element.style[key as any] = value.toString();
            });
        }
        
        // Add title if provided
        if (options.title) {
            this.addTitle(options.title);
        }
    }
    
    private addTitle(titleText: string): void {
        this.titleElement = document.createElement('h2');
        this.titleElement.textContent = titleText;
        
        // Apply title styles
        Object.entries(UIStyles.title).forEach(([key, value]) => {
            this.titleElement!.style[key as any] = value;
        });
        
        this.element.appendChild(this.titleElement);
    }
    
    public addElement(element: HTMLElement): void {
        this.element.appendChild(element);
    }
    
    public getElement(): HTMLDivElement {
        return this.element;
    }
    
    public show(): void {
        document.body.appendChild(this.element);
    }
    
    public hide(): void {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
    
    public clear(): void {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        
        // Re-add title if it exists
        if (this.titleElement) {
            this.element.appendChild(this.titleElement);
        }
    }
}