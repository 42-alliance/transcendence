export function createButton(id: string, text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = id + 'Button';
    button.textContent = text;
    button.style.backgroundColor = '#4a4a8f';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.padding = '10px 20px';
    button.style.margin = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '16px';
    button.style.fontWeight = 'bold';
    
    // Add hover effects
    button.onmouseover = () => {
        button.style.backgroundColor = '#6b6bad';
    };
    
    button.onmouseout = () => {
        button.style.backgroundColor = '#4a4a8f';
    };
    
    return button;
}

export function createContainer(id: string): HTMLDivElement {
    const container = document.createElement('div');
    container.id = id;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
    return container;
}