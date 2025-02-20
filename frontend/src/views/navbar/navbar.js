import { me, profileProfile, userIsLogin } from "../../../script.js";


export function cleanSessionStorage() {
	sessionStorage.removeItem("userPicture");
	sessionStorage.removeItem("username");
	sessionStorage.removeItem("userId");
}

export async function getInfoSessionStorage() {
	const infos = {
		userPicture: sessionStorage.getItem("userPicture"),
		username: sessionStorage.getItem("username"),
		userId: sessionStorage.getItem("userId"),
	};

	if (!infos.userId || !infos.userPicture || !infos.username) {
		const userData = await me();
		if (userData === null) {
			infos.userId = null;
			infos.userPicture = null;
			infos.username = null;
		}
		else {
			infos.userId = userData.id;
			infos.userPicture = profileProfile(userData);
			infos.username = userData.username;
			sessionStorage.setItem("userId", infos.userId);
			sessionStorage.setItem("userPicture", infos.userPicture);
			sessionStorage.setItem("username", infos.username);
		}
	}
	return infos;
}

export async function setUserName() {
    const elem = document.getElementById("user-id");
    if (elem === null)
		return;
	const userData = await getInfoSessionStorage();
	if (userData) {
		const username = document.createElement("span");
		username.textContent = userData.username;

		const userPicture = document.createElement("img");
		userPicture.src = userData.userPicture;
		userPicture.alt = `${userData.username} image`;
		userPicture.classList.add("user-profile-picture");

		elem.append(username, userPicture);
	}
}

export async function printNavbar() {
    const navbarDiv = document.getElementById("navbar-id");

    if (!navbarDiv) return;

    try {
        const response = await fetch("src/views/navbar/navbar.html");
        if (!response.ok) {
            throw new Error(`Failed to load HTML file: ${response.statusText}`);
        }
        navbarDiv.innerHTML = await response.text();

        // Ensure elements exist before modifying
        const userProfile = document.getElementById("user-profile");
        const loginButton = document.getElementById("login-button");

        if (!userProfile || !loginButton) {
            console.error("User profile or login button element not found.");
            return;
        }

        if (await userIsLogin()) {
            userProfile.style.display = "flex"; // Show user profile
            await setUserName();

            // Show all `.hide-or-show` elements
            document.querySelectorAll(".hide-or-show").forEach(item => {
                item.style.display = "block";
            });
        } else {
            loginButton.style.display = "block"; // Show login button

            // Hide `.hide-or-show` elements for unauthenticated users
            document.querySelectorAll(".hide-or-show").forEach(item => {
                item.style.display = "none";
            });
        }
    } catch (error) {
        console.error("Error loading navbar:", error);
    }
}
