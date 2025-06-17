import { BaseScreen } from '../components/Screen.js';
import { createButton } from '../utils/ElementFactory.js';

export class DifficultyScreen extends BaseScreen {
    constructor() {
        super('difficulty-screen');
    }
    
    public show(): Promise<string> {
        return new Promise((resolve) => {
            this.clearContainer();
            
            // Add title
            const title = document.createElement('h2');
            title.textContent = 'SELECT DIFFICULTY';
            title.style.color = 'white';
            title.style.marginBottom = '20px';
            this.addElement(title);
            
            // Define difficulties
            const difficulties = [
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
                { id: 'impossible', label: 'Impossible' }
            ];
            
            // Add difficulty buttons
            difficulties.forEach(diff => {
                const button = createButton(diff.id, diff.label);
                button.onclick = () => {
                    this.hide();
                    resolve(diff.id);
                };
                this.addElement(button);
            });
            
            this.container.style.display = 'block';
            this.isVisible = true;
        });
    }
}