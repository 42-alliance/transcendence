import { IUser } from "../../types.js";
import { getUserInfos } from "../../User/me.js";
import AView from "../AView.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Dragon Pong");
	}
	
	async getHtml() {
		try {
			const response = await fetch("/src/Views/Dashboard/Dashboard.html");
			if (!response.ok) {
				throw new Error(`Failed to load HTML file: ${response.statusText}`);
			}
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Error loading content</p>`;
		}
	}
}
