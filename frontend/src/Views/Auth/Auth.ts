import { login_pwd } from "../../Auth/login_password.js";
import { register_pwd } from "../../Auth/register_pwd.js";
import { userIsLogin } from "../../User/userIsLogin.js";
import AView from "../AView.js";
import { navigateTo } from "../viewManager.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Authentification");
	}

	// Charge le contenu HTML du formulaire
	async getHtml(): Promise<string> {

        if (await userIsLogin() === true) {
            navigateTo("/");
            return "";
        }
		try {
			const response = await fetch("/src/Views/Auth/Auth.html");
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

export async function login() {
	const email_input = document.getElementById("login-email") as HTMLInputElement;
	const password_input = document.getElementById("login-password") as HTMLInputElement;
	const error_msg = document.getElementById("login-error-msg") as HTMLParagraphElement;

	if (!email_input || !password_input) return;

	const email = email_input.value.trim();
	const password = password_input.value;

	const clearError = () => {
		if (error_msg) error_msg.classList.add("hidden");
		email_input.classList.remove("border-red-500", "focus:ring-red-500");
		password_input.classList.remove("border-red-500", "focus:ring-red-500");
		email_input.setCustomValidity("");
		password_input.setCustomValidity("");
	};

	clearError();

	if (!email || !password) {
		if (error_msg) {
			error_msg.textContent = "Please enter both email and password.";
			error_msg.classList.remove("hidden");
		}
		email_input.classList.add("border-red-500", "focus:ring-red-500");
		password_input.classList.add("border-red-500", "focus:ring-red-500");
		return;
	}

	const login = await login_pwd(email, password);
	if (login.success === false) {
		console.error("you are not connected fail");
		error_msg.textContent = login.error!;
		error_msg.classList.remove("hidden");

		email_input.classList.add("border-red-500", "focus:ring-red-500");
    	password_input.classList.add("border-red-500", "focus:ring-red-500");
    	password_input.focus();
		return;
	} 
	console.log("you are connected gg");
	localStorage.setItem("access_token", login.access_token!);
	navigateTo("/");
}

export async function register() {
	const username_input = document.getElementById("signup-username") as HTMLInputElement;
	const email_input = document.getElementById("signup-email") as HTMLInputElement;
	const password_input = document.getElementById("signup-password") as HTMLInputElement;
	const confirm_password_input = document.getElementById("signup-password-confirm") as HTMLInputElement;
	const error_msg = document.getElementById("signup-password-error") as HTMLParagraphElement;


	if (!email_input || !password_input || !username_input || !confirm_password_input || !error_msg) return;



	const email = email_input.value.trim();
	const password = password_input.value;
	const confirm_password = confirm_password_input.value;
	const name = username_input.value.trim();

	const clearError = () => {
		if (error_msg) error_msg.classList.add("hidden");
		confirm_password_input.classList.remove("border-red-500", "focus:ring-red-500");
		confirm_password_input.setCustomValidity("");
	};

	clearError();

	if (password !== confirm_password) {
		if (error_msg) error_msg.classList.remove("hidden");
		// style d’erreur visuel
		confirm_password_input.classList.add("border-red-500", "focus:ring-red-500");
		// message de validité natif
		confirm_password_input.setCustomValidity("Passwords do not match");
		confirm_password_input.reportValidity();
		confirm_password_input.focus();
		return;
	}

	const sync = () => {
		if (password_input.value === confirm_password_input.value) {
		clearError();
		confirm_password_input.removeEventListener("input", sync);
		password_input.removeEventListener("input", sync);
		}
	};
	confirm_password_input.addEventListener("input", sync);
	password_input.addEventListener("input", sync);

	const data = await register_pwd(name, email, password);
	if (data === null) {
		console.error("you are not connected fail");
		return;
	}
	localStorage.setItem("access_token", data.access_token);
	navigateTo(data.redirect_url);
}