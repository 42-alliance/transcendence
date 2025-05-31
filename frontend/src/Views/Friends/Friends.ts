import { get } from "http";
import AView from "../AView.js";
import { getAllFriends } from "../../Friends/getAllFriends.js";
import { getUserInfos } from "../../User/me.js";
import { miniUserCard } from "../userCard/userCard.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("My Friends");
	}
	
	async getHtml() {
		try {
			const response = await fetch("src/Views/Friends/Friends.html");
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

export async function injectFriends() {

	const test_card = document.getElementById("test-card");
	if (!test_card) {
		return;
	}
	console.log("okoko");

	const userInfos = await getUserInfos();
	if (!userInfos) {
		return;
	}

	console.log("User Infos: ", userInfos);
	miniUserCard(test_card, userInfos);

	// const friends = await getAllFriends();
	// if (!friends) {
	// 	return;
	// }
	

	// for (const friend of friends) {
	// 	const card = test_card.cloneNode(true) as HTMLElement;
	// 	card.id = "";
	// 	card.querySelector(".card-title")!.textContent = friend.name;
	// 	card.querySelector(".card-text")!.textContent = friend.bio;
	// 	card.querySelector(".card-img-top")!.setAttribute("src", friend.picture);
	// 	card.querySelector(".card-img-top")!.setAttribute("alt", friend.name);
	// 	card.querySelector(".card-footer")!.textContent = `Status: ${friend.status}`;
		
	// 	const friendsContainer = document.getElementById("friends-container");
	// 	if (friendsContainer) {
	// 		friendsContainer.appendChild(card);
	// 	}
	// }
}