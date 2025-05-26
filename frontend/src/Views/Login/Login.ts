import AView from "../AView.js";
import { updateUserInfos } from "../../User/updateUser.js";
import { injectUserCard, previewImage } from "../userCard/userCard.js";
import { navigateTo } from "../viewManager.js";
import { fetchApi } from "../../utils.js";
import { userInfos } from "../../User/me.js";

export default class extends AView {
    constructor() {
        super();
        this.setTitle("Create User");
    }


    // Charge le contenu HTML du formulaire
    async getHtml() {
        try {
            const response = await fetch("src/Views/Login/Login.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(error);
            return `<p>Erreur lors du chargement du formulaire</p>`;
        }
    }


}

export async function verifyIfUsernameInDatabase(username: string) {
	try {
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		
		const response = await fetchApi('http://localhost:8000/api/is-user-in-database/', {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				'username': username,
			})
		})
		if (!response.ok) {
			console.error("failed to check user creation")
			return;
		}
		
		const result = await response.json();

		return result.in_database;
	} catch (e) {
		console.error('Erreur :', e)
	}
}

async function validUsername(username: string, errorMessage: HTMLSpanElement) {
	const regex = /^[a-zA-Z0-9_]{3,20}$/;

	if (!regex.test(username)) {
		errorMessage.style.display = "inline";
		return false;
	}

	return true;
}

export async function formSubmit(event: Event) {
	event.preventDefault();

    const pseudoInput = document.getElementById('pseudo-input') as HTMLInputElement;
    if (pseudoInput === null)
        return;
	
	const errorMessage = document.getElementById('input-error') as HTMLSpanElement;
	if (errorMessage === null)
		return;
	
	const username = pseudoInput.value.trim();
	if (await validUsername(username, errorMessage) === false)
		return;
	
	errorMessage.style.display = "none"; // Hide error message if valid
	
	const profileImage = document.getElementById('profileImageInput') as HTMLInputElement;
	if (profileImage.files === null)
		return
	
	const profilePicture = profileImage.files[0];
	const maxSize = 2 * 1024 * 1024;
	if (profilePicture && profilePicture.size > maxSize) { 
		alert('File size exceeds 2 MB. Please select a smaller profile picture. Coucou <3');
		return;
	}
	updateUserInfos(username, profilePicture);
	navigateTo("/");
}

// Gestion des événements après le chargement du DOM
document.addEventListener("DOMContentLoaded", async () => {
	await new Promise<void>((r) => setTimeout(r, 400));
  
	await injectUserCard("card-login-container-id");
  
	const userForm = document.getElementById("user-form") as HTMLFormElement;
	if (userForm) {
		userForm.addEventListener("submit", async (event: Event) => {
			await formSubmit(event);
		});
	}
  
	const pseudoInput = document.getElementById("pseudo-input") as HTMLInputElement;
	if (pseudoInput) {
		pseudoInput.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement | null;
			if (!target) return;
			const pseudo = target.value;
			const userCardPseudo = document.getElementById('userCardName');
			if (!userCardPseudo) return;
			const previousName = userInfos.name || "Error pseudo";
			userCardPseudo.innerText = pseudo || previousName;
		});
	}

	const profileImageInput = document.getElementById("profileImageInput") as HTMLInputElement;
	if (profileImageInput)
		profileImageInput.addEventListener("change", (event) => {
			previewImage(event, "profile-picture-card", "banner-card", "profileBannerInput");
		});
  
	const profileBannerInput = document.getElementById("profileBannerInput") as HTMLInputElement;
	if (profileBannerInput)
		profileBannerInput.addEventListener("change", (event) => {
			previewImage(event, "banner-card", "profile-picture-card", "profileImageInput");
		});
});
  
