import { BaseScreen } from '../components/Screen.js';
import { FontHelper } from '../../FontHelper.js';

export class DifficultyScreen extends BaseScreen {
    constructor() {
        super('difficulty-screen');
    }
    
    public show(): Promise<string> {
        return new Promise((resolve) => {
            this.clearContainer();
            
            // Styliser le conteneur
            this.container.style.background = 'linear-gradient(180deg, rgba(20,20,50,0.9) 0%, rgba(30,30,80,0.8) 100%)';
            this.container.style.border = '4px solid #6e72ff';
            this.container.style.borderRadius = '15px';
            this.container.style.boxShadow = '0 0 20px rgba(110, 114, 255, 0.7), 0 0 40px rgba(110, 114, 255, 0.4)';
            this.container.style.padding = '30px';
            this.container.style.maxWidth = '800px';
            this.container.style.width = '80%';
            this.container.style.margin = '0 auto';
            this.container.style.textAlign = 'center';
            this.container.style.position = 'absolute';
            this.container.style.top = '50%';
            this.container.style.left = '50%';
            this.container.style.transform = 'translate(-50%, -50%)';
            
            // Add title with FontHelper
            const title = document.createElement('h2');
            title.textContent = 'SELECT DIFFICULTY';
            title.style.color = '#ffffff';
            title.style.fontSize = '48px';
            title.style.textShadow = '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(110, 114, 255, 0.8)';
            title.style.marginBottom = '35px';
            title.style.letterSpacing = '2px';
            
            // Apply Mighty Soul font using FontHelper
            FontHelper.applyMightySoulyFont(title);
            
            this.addElement(title);
            
            // Ajouter un conteneur pour les boutons
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.flexDirection = 'column';
            buttonsContainer.style.gap = '15px';
            buttonsContainer.style.alignItems = 'center';
            
            // Define difficulties with colors
            const difficulties = [
                { id: 'easy', label: 'Easy', color: '#4CAF50' },
                { id: 'medium', label: 'Medium', color: '#FF9800' },
                { id: 'hard', label: 'Hard', color: '#F44336' },
            ];
            
            // Add difficulty buttons with enhanced styling
            difficulties.forEach(diff => {
                const button = document.createElement('button');
                button.id = diff.id;
                button.textContent = diff.label;
                button.style.fontSize = '28px';
                button.style.padding = '15px 40px';
                button.style.margin = '8px 0';
                button.style.width = '80%';
                button.style.border = 'none';
                button.style.borderRadius = '8px';
                button.style.backgroundColor = diff.color;
                button.style.color = 'white';
                button.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
                button.style.boxShadow = `0 5px 15px rgba(0,0,0,0.3), 0 0 10px ${diff.color}80`;
                button.style.cursor = 'pointer';
                button.style.transition = 'all 0.2s ease';
                
                // Apply Mighty Soul font using FontHelper
                FontHelper.applyMightySoulyFont(button);
                
                // Hover effect
                button.onmouseenter = () => {
                    button.style.transform = 'translateY(-3px) scale(1.05)';
                    button.style.boxShadow = `0 8px 20px rgba(0,0,0,0.4), 0 0 15px ${diff.color}`;
                };
                
                button.onmouseleave = () => {
                    button.style.transform = '';
                    button.style.boxShadow = `0 5px 15px rgba(0,0,0,0.3), 0 0 10px ${diff.color}80`;
                };
                
                // Click animation
                button.onmousedown = () => {
                    button.style.transform = 'translateY(2px) scale(0.98)';
                    button.style.boxShadow = `0 2px 10px rgba(0,0,0,0.3), 0 0 5px ${diff.color}80`;
                };
                
                button.onmouseup = () => {
                    button.style.transform = '';
                };
                
                button.onclick = () => {
                    // Animation de sortie
                    this.container.style.opacity = '0';
                    this.container.style.transform = 'translate(-50%, -50%) scale(0.95)';
                    this.container.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        this.hide();
                        resolve(diff.id);
                    }, 300);
                };
                
                buttonsContainer.appendChild(button);
            });
            
            this.addElement(buttonsContainer);
            
            // Ajouter un bouton de retour
            const backButton = document.createElement('button');
            backButton.textContent = 'Back';
            backButton.style.fontSize = '20px';
            backButton.style.padding = '10px 20px';
            backButton.style.marginTop = '25px';
            backButton.style.border = '2px solid #ffffff50';
            backButton.style.borderRadius = '8px';
            backButton.style.backgroundColor = 'transparent';
            backButton.style.color = 'white';
            backButton.style.cursor = 'pointer';
            backButton.style.transition = 'all 0.2s ease';
            
            // Apply Mighty Soul font using FontHelper
            FontHelper.applyMightySoulyFont(backButton, '20px');
            
            backButton.onmouseenter = () => {
                backButton.style.backgroundColor = '#ffffff20';
            };
            
            backButton.onmouseleave = () => {
                backButton.style.backgroundColor = 'transparent';
            };
            
            backButton.onclick = () => {
                // Animation de sortie
                this.container.style.opacity = '0';
                this.container.style.transform = 'translate(-50%, -50%) scale(0.95)';
                this.container.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    this.hide();
                    resolve('back'); // Resolve with 'back' to indicate back action
                }, 300);
            };
            
            this.addElement(backButton);
            
            // Animation d'entrée
            this.container.style.opacity = '0';
            this.container.style.transform = 'translate(-50%, -50%) scale(0.95)';
            this.container.style.transition = 'all 0.3s ease';
            
            this.container.style.display = 'block';
            this.isVisible = true;
            
            // Trigger animation
            setTimeout(() => {
                this.container.style.opacity = '1';
                this.container.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
        });
    }
}