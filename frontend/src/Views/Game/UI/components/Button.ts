import { UIStyles } from '../styles/UIStyles.js';

export interface ButtonOptions {
    id: string;
    text: string;
    onClick?: () => void;
    className?: string;
    customStyles?: Partial<CSSStyleDeclaration>;
}

export class GameButton {
    private element: HTMLButtonElement;
    
    constructor(options: ButtonOptions) {
        this.element = document.createElement('button');
        this.element.id = options.id;
        this.element.textContent = options.text;
        this.element.className = options.className || 'game-button';
        
        // Apply base styles
        Object.entries(UIStyles.button.base).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
        
        // Apply custom styles if provided
        if (options.customStyles) {
            Object.entries(options.customStyles).forEach(([key, value]) => {
                if (value) this.element.style[key as any] = value.toString();
            });
        }
        
        // Add event listeners
        this.element.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.element.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        if (options.onClick) {
            this.element.addEventListener('click', options.onClick);
        }
    }
    
    private handleMouseOver(): void {
        Object.entries(UIStyles.button.hover).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
    }
    
    private handleMouseOut(): void {
        Object.entries(UIStyles.button.base).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
    }
    
    private handleMouseDown(): void {
        Object.entries(UIStyles.button.active).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
    }
    
    private handleMouseUp(): void {
        Object.entries(UIStyles.button.hover).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
    }
    
    public getElement(): HTMLButtonElement {
        return this.element;
    }
    
    public disable(): void {
        this.element.disabled = true;
        Object.entries(UIStyles.button.disabled).forEach(([key, value]) => {
            this.element.style[key as any] = value;
        });
    }
    
    public enable(): void {
        this.element.disabled = false;
        this.handleMouseOut();
    }
    
    public hide(): void {
        this.element.style.display = 'none';
    }
    
    public show(): void {
        this.element.style.display = 'block';
    }
}