import { userIsLogin } from "./User/userIsLogin.js";

function createUserDropdown(username: string, email: string): HTMLDivElement {
	const dropdown: HTMLDivElement = document.createElement('div');
	dropdown.id = 'dropdown-user';
	dropdown.className = 'absolute right-0 z-50 hidden mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600';

	dropdown.innerHTML = `
		<div class="px-4 py-3" role="none">
			<p id="username-dropdown" class="text-sm text-gray-900 dark:text-white" role="none">${username}</p>
			<p id="email-dropdown" class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">${email}</p>
		</div>
		<ul class="py-1" role="none">
			<li>
				<a href="/" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">My Profile</a>
			</li>
			<li>
				<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Setting</a>
			</li>
			<li>
				<a href="#" onclick="logOutUser()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Sign out</a>
			</li>
			<li>
				<a href="#" onclick="deleteUser()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Delete Account</a>
			</li>
		</ul>
	`;

	return dropdown;
}

// Exemple d'utilisation :
const parentElement = document.getElementById('user-button-wrapper');
if (parentElement) {
	const dropdown = createUserDropdown('JohnDoe', 'john@example.com');
	parentElement.appendChild(dropdown);
}


export async function sidebar_visibility() {

	const is_log = await userIsLogin();

	const sidebar = document.getElementById("sidebar");
	if (!sidebar) return;


	if (is_log) {
		sidebar.classList.remove("hidden");
	}
	else {
		sidebar.classList.add("hidden");
	}
}