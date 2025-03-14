import AView from "../AView.js";
import { userIsLogin } from "../../User/userIsLogin.js";
import { navigateTo } from "../viewManager.js";
import { updateUserInfos } from "../../User/updateUser.js";
import { injectUserCard, previewImage, updateUserCardFromForm } from "../userCard/userCard.js";

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
		
		const response = await fetch('http://localhost:8000/api/is-user-in-database/', {
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
	const regex = /^[a-zA-Z0-9_]+$/;

	if (!regex.test(username)) {
		errorMessage.style.display = "inline";
		return false;
	}

	// if (await verifyIfUsernameInDatabase(username) === true) {
	// 	return false;
	// }
	return true;
}

export async function formSubmit() {
    const form = document.querySelector('.login-form');
    if (form === null) return;

    const pseudoInput = document.querySelector('#pseudo') as HTMLInputElement;
    if (pseudoInput === null)
        return;

    // Create an error message element
    const errorMessage = document.createElement("span");
    errorMessage.style.color = "red";
    errorMessage.style.display = "none";
    errorMessage.textContent = "Only letters, numbers, and underscores allowed!";
    if (pseudoInput && pseudoInput.parentNode)
        pseudoInput.parentNode.appendChild(errorMessage);

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Get the value of the input field
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
          alert('File size exceeds 2 MB. Please select a smaller profile picture.');
          return;
        }
        if (profilePicture)
            console.log("profilePicture name : " + profilePicture.name);
		updateUserInfos(username, profilePicture);
    });
}

// Gestion des événements après le chargement du DOM
document.addEventListener("DOMContentLoaded", async () => {
	await new Promise<void>((r) => setTimeout(r, 400));
  
	injectUserCard("card-login-container-id");
  
	const userForm = document.getElementById("user-form") as HTMLFormElement;
	if (userForm)
		userForm.addEventListener("input", () => {
			updateUserCardFromForm("user-form", "card-login-container-id");
		});
  
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
  
