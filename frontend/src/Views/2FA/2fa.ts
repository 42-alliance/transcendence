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