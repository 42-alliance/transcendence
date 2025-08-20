import { verifyLoginCodeeeee } from "../../Auth/2fa/2fa_login.js";
import { verifyLoginCode } from "../../User/TwoFa/verify2faLogin.js";
import { navigateTo } from "../viewManager.js";

export async function inject_2fa_modals() {
	const login_modal = document.getElementById("twofa-login-modal");

	if (login_modal && login_modal.innerHTML === "") {
		const response = await fetch("/src/Views/2FA/2FA_login.html");
		if (!response.ok) {
			throw new Error(`Failed to load HTML file: ${response.statusText}`);
		}
		login_modal.innerHTML = await response.text();
	}

	const setup_modal = document.getElementById("twofa-setup-modal");

	if (setup_modal && setup_modal.innerHTML === "") {
		const response = await fetch("/src/Views/2FA/2FA_setup.html");
		if (!response.ok) {
			throw new Error(`Failed to load HTML file: ${response.statusText}`);
		}
		setup_modal.innerHTML = await response.text();
	}
}

function erase_window() {
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = "";
}

async function listerEnterEvent(event: KeyboardEvent, id: number) {
	if (event.key === "Enter") {
		await send_2fa(id);
	}
}

function show_2fa_login_modal(id: number) {
	const modal = document.getElementById("twofa-login-modal");
	if (!modal) return;

	modal.classList.remove("hidden", "animate-slide-down");
	modal.classList.add("animate-slide-up");

	const input = document.getElementById("login-verification-code");
	if (!input) return;
	input.addEventListener("keypress", (event) => listerEnterEvent(event, id));
}

function hide_2fa_login_modal(id: number) {
	const modal = document.getElementById("twofa-login-modal");

	if (!modal) return;

	modal.classList.remove("animate-slide-up");
	modal.classList.add("animate-slide-down");

	const input = document.getElementById(
		"login-verification-code"
	) as HTMLInputElement;
	if (!input) return;
	input.removeEventListener("keypress", (event) => listerEnterEvent(event, id));
	input.value = "";
	setTimeout(() => {
		modal.classList.add("hidden");
	}, 300);
}

function is_only_number(code: string): boolean {
	for (let i = 0; i < code.length; i++) {
		if (code[i] < '0' || code[i] > '9') {
			return false;
		}
	}
	return true;
}

async function send_2fa(id: number) {
	const input = document.getElementById("login-verification-code") as HTMLInputElement;
	if (!input) return;

	const code = input.value.trim();

	if (code === "") {
		 // TODO: afficher un message d'erreur en rouge
		return;
	}
	if (code.length !== 6) {
		// TODO: afficher un message d'erreur en rouge
	   return;
	}
	if (is_only_number(code) === false) {
		// TODO: afficher un message d'erreur en rouge
	   return;
	}
	const result = await verifyLoginCodeeeee(code, id);
	if (result.success === false) {
		// TODO: afficher un message d'erreur en rouge
	   return;
	}

	navigateTo("/");
	hide_2fa_login_modal(id);
}

export async function twoFactorLogin(id: number) {
	erase_window();
	show_2fa_login_modal(id);
	console.log("je suis la");
}
