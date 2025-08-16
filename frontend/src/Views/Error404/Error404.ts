import AView from "../AView.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Erreur 404");
	}

	// Charge le contenu HTML de la page d'erreur
	async getHtml(): Promise<string> {
		try {
		const response = await fetch("/src/Views/Error404/Error404.html");
		if (!response.ok) {
			throw new Error(`Failed to load HTML file: ${response.statusText}`);
		}

		return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Erreur lors du chargement de la page d'erreur</p>`;
		}
	}
}
