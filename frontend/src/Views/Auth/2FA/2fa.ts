import { send_2fa_code, send_2fa_code_setup } from "../../../Auth/2FA/send_2FA_code.js";
import { setup_2fa } from "../../../Auth/2FA/setup_2FA.js";
import { showToast } from "../../triggerToast.js";

function fadeIn(el: HTMLElement) {
	el.classList.remove("opacity-0", "pointer-events-none");
	el.classList.add("opacity-100");
}

function fadeOut(el: HTMLElement) {
	el.classList.remove("opacity-100");
	el.classList.add("opacity-0");
	el.classList.add("pointer-events-none");
}

async function inject_2fa_setup_modal() {
	try {
		const response = await fetch("/src/Views/Auth/2FA/2FA_qr_code.html");
		if (!response.ok) {
			throw new Error(`Failed to load setup modal HTML: ${response.statusText}`);
		}
		const div_2fa = document.getElementById("2FA");
		if (!div_2fa) return;

		// Append instead of replacing
		div_2fa.insertAdjacentHTML("beforeend", await response.text());
	} catch (error) {
		console.error(error);
	}
}

async function inject_enable_2fa_modal() {
	try {
		const response = await fetch("/src/Views/Auth/2FA/2FA_modal.html");
		if (!response.ok) {
			throw new Error(`Failed to load HTML file: ${response.statusText}`);
		}
		const div_2fa = document.getElementById("2FA");
		if (!div_2fa) return;

		div_2fa.innerHTML = await response.text();
	} catch (error) {
		console.error(error);
	}
}

async function enable_2fa_accepted() {
	await inject_2fa_setup_modal();

	const setupModal = document.getElementById("2FA-setup-modal");
	if (!setupModal) return;
	fadeIn(setupModal);

	const qr_code = await setup_2fa();
	if (!qr_code) return;

	const qr_code_img = document.getElementById("qrcode") as HTMLImageElement;
	qr_code_img.src = qr_code;
	qr_code_img.alt = "2FA QR code"; 

	const closeSetup = document.getElementById("close-setup-btn");
	closeSetup?.addEventListener("click", () => fadeOut(setupModal));

	const form = document.getElementById("verify-2fa-form") as HTMLFormElement | null;
	form?.addEventListener("submit", async (e) => {
		e.preventDefault();
		const code = (document.getElementById("code") as HTMLInputElement).value;
		console.log("Code submitted:", code);

		const errorEl = document.getElementById("2fa-error");
		if (!code || !errorEl) return;

		const is_success = await send_2fa_code_setup(code);
		if (is_success) {
			fadeOut(setupModal);
			showToast({
				text: "2FA successfully enable",
				buttons: [],
			});
		} else {
			errorEl.classList.remove("hidden");
		}
	});
}

export async function enable_2fa_modal() {
	await inject_enable_2fa_modal();

	const modal = document.getElementById("2FA-default-modal");
	if (!modal) return;
	fadeIn(modal);

	const decline = document.getElementById("decline-btn");
	decline?.addEventListener("click", () => fadeOut(modal));

	const close_button = document.getElementById("close-modal-btn");
	close_button?.addEventListener("click", () => fadeOut(modal));

	modal.addEventListener("click", (event: MouseEvent) => {
		if (event.target === modal) {
			fadeOut(modal);
		}
	});

	const accept = document.getElementById("enable-2fa-btn");
	accept?.addEventListener("click", async () => {
		fadeOut(modal);
		await enable_2fa_accepted();
	});
}