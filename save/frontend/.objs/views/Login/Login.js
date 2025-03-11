import AView from "../AView.js";
import { addUserApi, logUserApi, triggerToast, userIsLogin } from "../../../script.js";
import { navigateTo } from "../viewManager.js";
export default class extends AView {
    constructor() {
        super();
        this.setTitle("Create User");
    }
    // Charge le contenu HTML du formulaire
    async getHtml() {
        if (await userIsLogin() === true) {
            console.log("error");
            navigateTo("/");
            return;
        }
        try {
            const response = await fetch("src/views/Login/Login.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
            return await response.text();
        }
        catch (error) {
            console.error(error);
            return `<p>Erreur lors du chargement du formulaire</p>`;
        }
    }
}
// document.addEventListener("DOMContentLoaded", () => {
// 	injectUserCard("card-login-container", {});
// 	document.getElementById("user-form").addEventListener("input", () => {
// 		updateUserCardFromForm("user-form", "card-login-container");
// 	});
// });
const dev_token = "Token 37cff866c48347a856dcfae3cbbbb7f5c2b14c33";
export async function verifyIfUsernameInDatabase(username) {
    try {
        const headers = new Headers();
        headers.append("Authorization", dev_token);
        headers.append('Content-Type', 'application/json');
        const response = await fetch('http://localhost:8000/api/is-user-in-database/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                'username': username,
            })
        });
        if (!response.ok) {
            console.error("failed to check user creation");
            return;
        }
        const result = await response.json();
        return result.in_database;
    }
    catch (e) {
        console.error('Erreur :', e);
    }
}
async function validUsername(username, errorMessage) {
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) {
        errorMessage.style.display = "inline";
        return false;
    }
    if (await verifyIfUsernameInDatabase(username) === true) {
        triggerToast(`${username} already in database`, false);
        return false;
    }
    return true;
}
export async function formSubmit() {
    const form = document.querySelector('.login-form');
    if (form === null)
        return;
    const pseudoInput = document.querySelector('#pseudo');
    // Create an error message element
    const errorMessage = document.createElement("span");
    errorMessage.style.color = "red";
    errorMessage.style.display = "none";
    errorMessage.textContent = "Only letters, numbers, and underscores allowed!";
    pseudoInput.parentNode.appendChild(errorMessage);
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        // Get the value of the input field
        const username = pseudoInput.value.trim();
        if (await validUsername(username, errorMessage) === false)
            return;
        errorMessage.style.display = "none"; // Hide error message if valid
        const profileImage = document.getElementById('profileImageInput');
        const profilePicture = profileImage.files[0];
        const maxSize = 2 * 1024 * 1024;
        if (profilePicture && profilePicture.size > maxSize) {
            alert('File size exceeds 2 MB. Please select a smaller profile picture.');
            return;
        }
        if (profilePicture)
            console.log("profilePicture name : " + profilePicture.name);
        console.log("je quitte la la fonction");
        const isLogged = logUserApi(pseudo); // verifier si l'utilisateur a deja un compte et le log si c'est le cas
        console.log("de retour dans la fonction");
        if (isLogged == true) {
            window.location.href = "http://localhost:8080/";
            console.log("Stop here");
            return;
        }
        else {
            console.log("User not log try to Sign IN");
            addUserApi(username, profilePicture);
        }
    });
}
//# sourceMappingURL=Login.js.map