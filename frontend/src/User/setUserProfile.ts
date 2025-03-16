import { getUserInfos } from "./me.js";


export async function setUserProfile() {
	const profileButton = document.getElementById("userProfile-button");
	if (!profileButton) return;

	const user = await getUserInfos();
	if (!user || !user.name || !user.picture) return;

	profileButton.innerHTML = "";

	const userImg = document.createElement('img');
	userImg.classList.add("rounded-[50%]", "w-10", "h-10");
	userImg.src = user.picture;
	userImg.alt = `${user.name} picture`;

	const userSpan = document.createElement('span');
	userSpan.innerText = user.name;

	profileButton.appendChild(userImg);
	profileButton.appendChild(userSpan);
}