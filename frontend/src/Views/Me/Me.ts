import AView from "../AView.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Dragon Pong");
	}

	async getHtml() {
		try {
			const response = await fetch("/src/Views/Me/Me.html");
			if (!response.ok) {
				throw new Error(
					`Failed to load HTML file: ${response.statusText}`
				);
			}
			// Get the :username param from the URL
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Error loading content</p>`;
		}
	}
}
