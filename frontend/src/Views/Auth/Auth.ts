import { login_pwd } from "../../Auth/login_password.js";
import { is_email_dispo, is_name_dispo, register_pwd } from "../../Auth/register_pwd.js";
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

async function listerEnterEvent(event: KeyboardEvent) {
	if (event.key === "Enter") {
		await login();
	}
}

function listerEscEvent(event: KeyboardEvent) {
	if (event.key === "Escape") {
		closeLoginModal();
	}
}

function handleOutsideLoginClick(e: MouseEvent) {
	const modal = document.getElementById("email-login-modal");
	if (!modal) return;

	// le contenu = le premier enfant (ta div "glass-dark")
	const content = modal.querySelector(".glass-dark");
	if (!content) return;

	// si on clique directement sur l'overlay (pas sur le contenu)
	if (!content.contains(e.target as Node)) {
		closeLoginModal();
	}
}

export function openLoginModal() {
	const login_modal = document.getElementById("email-login-modal");

	if (!login_modal) return;

	login_modal.classList.remove("hidden", "animate-slide-down");
	login_modal.classList.add("animate-slide-up");

	login_modal.addEventListener("click", handleOutsideLoginClick);

	document.addEventListener("keyup", listerEscEvent);

	["login-email", "login-password"].forEach(inputId => {
		const input = document.getElementById(inputId);
		if (!input) return;
		input.addEventListener("keypress", listerEnterEvent);
	});
}

export function closeLoginModal() {
	const login_modal = document.getElementById("email-login-modal");

	if (!login_modal) return;

	login_modal.classList.remove("animate-slide-up");
	login_modal.classList.add("animate-slide-down");

	["login-email", "login-password"].forEach(inputId => {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (!input) return;
		input.removeEventListener("keypress", listerEnterEvent);
		input.value = "";
	});

	document.removeEventListener("keyup", listerEscEvent);
	login_modal.removeEventListener("click", handleOutsideLoginClick);
	setTimeout(() => {
		login_modal.classList.add("hidden");
	}, 300);
}

async function sendLogin(email: string, password: string) {
	const email_input = document.getElementById("login-email") as HTMLInputElement;
	const password_input = document.getElementById("login-password") as HTMLInputElement;
	const error_msg = document.getElementById("login-error-msg") as HTMLParagraphElement;

	if (!email_input || !password_input) return;

	const login = await login_pwd(email, password);
	if (login.success === false) {
		if (error_msg) {
			error_msg.textContent = login.error!;
			error_msg.classList.remove("hidden");
		}

		email_input.classList.add("border-red-500", "focus:ring-red-500");
    	password_input.classList.add("border-red-500", "focus:ring-red-500");
    	password_input.focus();
		return;
	} 
	localStorage.setItem("access_token", login.access_token!);
	navigateTo("/");

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

	await sendLogin(email, password);
}

// --------------------------------- REGISTER PART --------------------

async function listerEnterEventRegister(event: KeyboardEvent) {
	if (event.key === "Enter") {
		await register();
	}
}

function listerEscEventRegister(event: KeyboardEvent) {
	if (event.key === "Escape") {
		closeRegisterModal();
	}
}

function handleOutsideRegisterClick(e: MouseEvent) {
	const modal = document.getElementById("signup-modal");
	if (!modal) return;

	// le contenu = le premier enfant (ta div "glass-dark")
	const content = modal.querySelector(".glass-dark");
	if (!content) return;

	// si on clique directement sur l'overlay (pas sur le contenu)
	if (!content.contains(e.target as Node)) {
		closeRegisterModal();
	}
}

export function openRegisterModal() {
	const login_modal = document.getElementById("signup-modal");

	if (!login_modal) return;

	login_modal.classList.remove("hidden", "animate-slide-down");
	login_modal.classList.add("animate-slide-up");

	login_modal.addEventListener("click", handleOutsideRegisterClick);

	document.addEventListener("keyup", listerEscEventRegister);

	["signup-username", "signup-email", "signup-password"].forEach(inputId => {
		const input = document.getElementById(inputId);
		if (!input) return;
		input.addEventListener("keypress", listerEnterEventRegister);
	});
}

export function closeRegisterModal() {
	const login_modal = document.getElementById("signup-modal");

	if (!login_modal) return;

	login_modal.classList.remove("animate-slide-up");
	login_modal.classList.add("animate-slide-down");

	["signup-username", "signup-email", "signup-password"].forEach(inputId => {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (!input) return;
		input.removeEventListener("keypress", listerEnterEventRegister);
		input.value = "";
	});

	document.removeEventListener("keyup", listerEscEventRegister);
	login_modal.removeEventListener("click", handleOutsideRegisterClick);
	setTimeout(() => {
		login_modal.classList.add("hidden");
	}, 300);
}

async function sendRegister(username: string, email: string, password: string) {

	const register = await register_pwd(username, email, password);
	if (register.success === false) {
		const register_error = document.getElementById("register-error-msg");
		if (!register_error) return;

		register_error.classList.remove("hidden");
		register_error.textContent = register.error!;
		return;
	}
	localStorage.setItem("access_token", register.access_token!);
	navigateTo("/");
}


// === Utils d'affichage d'erreurs ===
function showError(input: HTMLInputElement, errorElement: HTMLParagraphElement | null, message: string) {
	if (errorElement) {
		errorElement.textContent = message;
		errorElement.classList.remove("hidden");
		
	}
	input.classList.add("border-red-500", "focus:ring-red-500");
	input.setCustomValidity(message);
	input.reportValidity();
	input.focus();
}

function clearError(input: HTMLInputElement, errorElement: HTMLParagraphElement | null) {
	if (errorElement) errorElement.classList.add("hidden");
	input.classList.remove("border-red-500", "focus:ring-red-500");
	input.setCustomValidity("");
}

// === Validation par champ ===
async function validateUsername(username_input: HTMLInputElement, error_username: HTMLParagraphElement | null): Promise<boolean> {
	const username = username_input.value.trim();
	if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
		showError(username_input, error_username, "Username must be 3–20 characters, only letters, numbers and underscores.");
		return false;
	}

	const result = await is_name_dispo(username);
	if (result.success === false) {
		showError(username_input, error_username, result.error!);
		return false;
	}
	clearError(username_input, error_username);
	return true;
}

async function validateEmail(email_input: HTMLInputElement, error_email: HTMLParagraphElement | null): Promise<boolean> {
	const email = email_input.value.trim();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		showError(email_input, error_email, "Please enter a valid email address.");
		return false;
	}

	const result = await is_email_dispo(email);
	if (result.success === false) {
		showError(email_input, error_email, result.error!);
		return false;
	}
	clearError(email_input, error_email);
	return true;
}

function validatePassword(password_input: HTMLInputElement, error_password: HTMLParagraphElement | null): boolean {
	const password = password_input.value;
	if (password.length < 8) {
		showError(password_input, error_password, "Password must be at least 8 characters.");
		return false;
	}
	clearError(password_input, error_password);
	return true;
}

function validateConfirmPassword(password_input: HTMLInputElement, confirm_password_input: HTMLInputElement, error_password: HTMLParagraphElement | null): boolean {
	if (password_input.value !== confirm_password_input.value) {
		showError(confirm_password_input, error_password, "Passwords do not match.");
		return false;
	}
	clearError(confirm_password_input, error_password);
	return true;
}

// === Fonction principale ===
export async function register() {
	const username_input = document.getElementById("signup-username") as HTMLInputElement;
	const email_input = document.getElementById("signup-email") as HTMLInputElement;
	const password_input = document.getElementById("signup-password") as HTMLInputElement;
	const confirm_password_input = document.getElementById("signup-password-confirm") as HTMLInputElement;

	const error_username = document.getElementById("signup-username-error") as HTMLParagraphElement;
	const error_email = document.getElementById("signup-email-error") as HTMLParagraphElement;
	const error_password = document.getElementById("signup-password-error") as HTMLParagraphElement;

	if (!username_input || !email_input || !password_input || !confirm_password_input) return;

	// Validations
	if (!await validateUsername(username_input, error_username)) return;
	if (!await validateEmail(email_input, error_email)) return;
	if (!validatePassword(password_input, error_password)) return;
	if (!validateConfirmPassword(password_input, confirm_password_input, error_password)) return;

	// Tout est bon → envoi
	const username = username_input.value.trim();
	const email = email_input.value.trim();
	const password = password_input.value;

	await sendRegister(username, email, password);
}
