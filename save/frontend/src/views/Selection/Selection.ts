import AView from "../AView.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Game Selection");
	}

	// Charge le contenu HTML du formulaire
	async getHtml() {

		try {
			const response = await fetch("src/views/Selection/Selection.html");
			if (!response.ok) {
				throw new Error(`Failed to load HTML file: ${response.statusText}`);
			}
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Erreur lors du chargement de la page</p>`;
		}
	}
}

class GameCarousel {
	constructor() {
	  this.init();
	}
  
	init() {
	  const cards = document.querySelectorAll('.game-card');
	  
	  if (!cards.length) {
		setTimeout(() => this.init(), 100);
		return;
	  }
  
	  // Ajouter les event listeners pour chaque carte
	  cards.forEach(card => {
		card.addEventListener('click', () => {
		  // Retirer la classe active de toutes les cartes
		  cards.forEach(c => c.classList.remove('active'));
		  // Ajouter la classe active à la carte cliquée
		  card.classList.add('active');
		});
	  });
  
	  // Activer la première carte par défaut
	  cards[0].classList.add('active');
	}
  }
  
  // Initialiser le carousel quand le DOM est chargé
  document.addEventListener('DOMContentLoaded', () => {
	new GameCarousel();
  });