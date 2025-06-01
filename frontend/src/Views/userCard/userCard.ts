import { getUserInfos, userInfos } from "../../User/me.js";
import { updateUserInfos } from "../../User/updateUser.js";
import { navigateTo } from "../viewManager.js";

interface UserData {
    name?: string;
    picture	?: string;
    banner?: string;
    bio?: string;
}

let NewuserData: UserData = {};


export function miniUserCard(targetElement: HTMLElement, userInfos: UserData): void {
    // Création de la carte d'ami moderne
    const card = document.createElement("div");
    card.className = "friend-card bg-gray-800/50 hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 flex flex-col";
    
    // Conteneur principal avec avatar et nom
    const topSection = document.createElement("div");
    topSection.className = "flex items-center gap-3 mb-3";
    
    // Avatar avec indicateur de statut
    const avatarContainer = document.createElement("div");
    avatarContainer.className = "relative";
    
    const profileImg = document.createElement("img");
    profileImg.className = "w-12 h-12 rounded-full object-cover border-2 border-blue-500/80";
    profileImg.src = userInfos.picture || "assets/default.jpeg";
    profileImg.alt = `${userInfos.name || "User"} profile picture`;
    
    // Indicateur de statut (vous pourriez ajouter une logique pour online/offline)
    const statusIndicator = document.createElement("span");
    statusIndicator.className = "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800";
    
    avatarContainer.appendChild(profileImg);
    avatarContainer.appendChild(statusIndicator);
    
    // Section info utilisateur
    const userInfo = document.createElement("div");
    
    const userName = document.createElement("h3");
    userName.className = "font-semibold text-white truncate max-w-[150px]";
    userName.textContent = userInfos.name || "Unknown User";
    
    const userStatus = document.createElement("p");
    userStatus.className = "text-xs text-blue-400";
    userStatus.textContent = "Online"; // Vous pourriez dynamiser ceci
    
    userInfo.appendChild(userName);
    userInfo.appendChild(userStatus);
    
    topSection.appendChild(avatarContainer);
    topSection.appendChild(userInfo);
    
    // Bouton d'options (ellipsis)
    const optionsBtn = document.createElement("button");
    optionsBtn.className = "absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-700/50 rounded-full transition-colors";
    optionsBtn.title = "More options";
    optionsBtn.innerHTML = `
        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
        </svg>
    `;
    
    // Conteneur des boutons d'action
    const btnGroup = document.createElement("div");
    btnGroup.className = "mt-auto flex gap-2";
    
    // Bouton Chat
    const chatBtn = document.createElement("button");
    chatBtn.className = "flex-1 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors";
    chatBtn.textContent = "Message";
    chatBtn.onclick = () => {
        alert(`Ouvrir le chat avec ${userInfos.name || "cet utilisateur"}`);
    };
    
    // Bouton Inviter à jouer
    const inviteBtn = document.createElement("button");
    inviteBtn.className = "w-9 h-9 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors";
    inviteBtn.title = "Inviter à jouer";
    inviteBtn.innerHTML = `
        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
    `;
    inviteBtn.onclick = () => {
        alert(`Inviter ${userInfos.name || "cet utilisateur"} à une partie rapide`);
    };
    
    btnGroup.appendChild(chatBtn);
    btnGroup.appendChild(inviteBtn);
    
    // Assemblage final
    card.appendChild(optionsBtn);
    card.appendChild(topSection);
    card.appendChild(btnGroup);
    
    // Injection dans l'élément cible
    targetElement.appendChild(card);
}

function updateUserCardMaxi(targetElement: HTMLElement, NewuserData: UserData, userInfos: UserData): void {
	// Fonction pour créer une icône stylo Font Awesome
	function createEditIcon(): HTMLElement {
		const icon = document.createElement("i");
		icon.className = "fa-solid fa-pen-to-square text-gray-400 hover:text-white ml-2 cursor-pointer";
		icon.title = "Modifier";
		icon.style.fontSize = "1.2rem";
		return icon;
	}

	// Création du conteneur principal
	const container = document.createElement("div");
	container.className = "flex flex-col w-full h-full relative";

	// ========== INPUTS CACHÉS (pour les images) ==========
	const bannerInput = document.createElement("input");
	bannerInput.type = "file";
	bannerInput.accept = "image/*";
	bannerInput.id = "bannerFileInput";
	bannerInput.className = "hidden";

	const profileInput = document.createElement("input");
	profileInput.type = "file";
	profileInput.accept = "image/*";
	profileInput.id = "profileFileInput";
	profileInput.className = "hidden";

	// ========== BANNIÈRE ==========
	const bannerContainer = document.createElement("div");
	bannerContainer.className = "relative h-[300px] group cursor-pointer";

	const bannerWrapper = document.createElement("div");
	bannerWrapper.className = "w-full h-full overflow-hidden";

	const bannerImg = document.createElement("img");
	bannerImg.id = "banner-card";
	bannerImg.className = "bg-[#1a1826] w-full h-full object-cover";
	bannerImg.src = NewuserData.banner || userInfos.banner || "assets/default_banner.jpeg";
	bannerImg.alt = "Bannière utilisateur";

	const bannerOverlay = document.createElement("div");
	bannerOverlay.className =
		"absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold opacity-0 group-hover:opacity-75 transition-opacity";
	bannerOverlay.textContent = "Changer la bannière";

	bannerInput.addEventListener("change", (event) => {
		previewImage(event, "banner-card", "profile-picture-card", "profileImageInput");
	});

	bannerContainer.appendChild(bannerWrapper);
	bannerWrapper.appendChild(bannerImg);
	bannerContainer.appendChild(bannerOverlay);

	bannerContainer.addEventListener("click", () => bannerInput.click());

	// ========== PHOTO DE PROFIL ==========
	const profileWrapper = document.createElement("div");
	profileWrapper.className = "absolute top-[220px] left-[40px] w-[180px] h-[180px] group cursor-pointer";

	const profileBg = document.createElement("div");
	profileBg.className = "absolute inset-0 bg-[#1a1826] rounded-full";

	const profileImg = document.createElement("img");
	profileImg.id = "profile-picture-card";
	profileImg.className = "w-full h-full rounded-full border-8 border-[#1a1826] relative z-10 object-cover";
	profileImg.src = NewuserData.picture || userInfos.picture || "assets/default.jpeg";
	profileImg.alt = "Photo de profil";

	const profileOverlay = document.createElement("div");
	profileOverlay.className =
		"absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-75 transition-opacity z-20";
	profileOverlay.textContent = "Changer la photo";

	profileInput.addEventListener("change", (event) => {
		previewImage(event, "profile-picture-card", "banner-card", "profileBannerInput");
	});

	profileWrapper.appendChild(profileBg);
	profileWrapper.appendChild(profileImg);
	profileWrapper.appendChild(profileOverlay);

	profileWrapper.addEventListener("click", () => profileInput.click());

	// ========== INFOS UTILISATEUR ==========
	const userInfoContainer = document.createElement("div");
	userInfoContainer.className = "ml-[240px] mt-20 px-10";

	// TITRE PSEUDO
	const pseudoTitle = document.createElement("label");
	pseudoTitle.textContent = "Pseudo";
	pseudoTitle.className = "text-white font-semibold mb-1 block";

	// Pseudo avec édition
	const userNameWrapper = document.createElement("div");
	userNameWrapper.className = "flex items-center";

	const userName = document.createElement("h2");
	userName.className = "text-3xl font-bold text-white";
	userName.id = "userCardName";
	userName.textContent = NewuserData.name || userInfos.name || "Nom inconnu";

	const editNameIcon = createEditIcon();

	userNameWrapper.appendChild(userName);
	userNameWrapper.appendChild(editNameIcon);

	// TITRE BIO
	const bioTitle = document.createElement("label");
	bioTitle.textContent = "Bio";
	bioTitle.className = "text-white font-semibold mt-6 mb-1 block";

	// Bio avec édition
	const userBioWrapper = document.createElement("div");
	userBioWrapper.className = "flex items-center";

	const userBio = document.createElement("p");
	userBio.className = "text-gray-400 text-lg";
	userBio.id = "userCardBio";
	userBio.textContent = NewuserData.bio || userInfos.bio || "Aucune biographie disponible.";

	const editBioIcon = createEditIcon();
	userBioWrapper.appendChild(userBio);
	userBioWrapper.appendChild(editBioIcon);

	userInfoContainer.appendChild(pseudoTitle);
	userInfoContainer.appendChild(userNameWrapper);

	userInfoContainer.appendChild(bioTitle);
	userInfoContainer.appendChild(userBioWrapper);

	// === Comportement édition ===
	function enableEditingText(element: HTMLElement, isTextArea = false) {
		const currentText = element.textContent || "";
		let inputEl: HTMLInputElement | HTMLTextAreaElement;

		if (isTextArea) {
			inputEl = document.createElement("textarea");
			inputEl.className = "bg-[#1a1826] text-white rounded p-2 w-full resize-none";
			(inputEl as HTMLTextAreaElement).rows = 4;
		} else {
			inputEl = document.createElement("input");
			inputEl.type = "text";
			inputEl.className = "bg-[#1a1826] text-white rounded p-1 w-full";
		}

		inputEl.value = currentText;
		element.style.display = "none"; // cacher le texte d’origine
		element.parentElement?.insertBefore(inputEl, element.nextSibling);
		inputEl.focus();

		function save() {
			const newText = inputEl.value.trim() || (isTextArea ? "Aucune biographie disponible." : "Nom inconnu");

			element.textContent = newText;
			element.style.display = "";  // montrer à nouveau l’élément texte
			inputEl.remove();
		}

		inputEl.addEventListener("blur", save);

		if (!isTextArea) {
			inputEl.addEventListener("keydown", (e) => {
				const event = e as KeyboardEvent;
				if (event.key === "Enter") {
					event.preventDefault();
					inputEl.blur();
				}
			});
		}
	}

	editNameIcon.addEventListener("click", (e) => {
		e.stopPropagation();
		enableEditingText(userName, false);
	});

	editBioIcon.addEventListener("click", (e) => {
		e.stopPropagation();
		enableEditingText(userBio, true);
	});

	// ========== BOUTON UPDATE PROFILE ==========
	const updateBtn = document.createElement("button");
	updateBtn.textContent = "Update Profile";
	updateBtn.className = "absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow cursor-pointer";

	updateBtn.addEventListener("click", async () => {
		const name = (document.getElementById("userCardName")?.textContent || "").trim();
		const bio = (document.getElementById("userCardBio")?.textContent || "").trim();

		const profileInputEl = container.querySelector<HTMLInputElement>("#profileFileInput");
		const bannerInputEl = container.querySelector<HTMLInputElement>("#bannerFileInput");

		const pictureFile = profileInputEl?.files?.[0];
		const bannerFile = bannerInputEl?.files?.[0];

		try {
			await updateUserInfos(name, pictureFile, bannerFile, bio);
			navigateTo("/");
		} catch (error) {
			alert("Erreur lors de la mise à jour du profil.");
			console.error(error);
		}
	});

	// ========== ASSEMBLAGE FINAL ==========
	targetElement.innerHTML = "";
	container.appendChild(bannerInput);
	container.appendChild(profileInput);
	container.appendChild(bannerContainer);
	container.appendChild(profileWrapper);
	container.appendChild(userInfoContainer);
	container.appendChild(updateBtn);
	targetElement.appendChild(container);
}


function updateUserCard(targetElement: HTMLElement, NewuserData: UserData, userInfos: UserData): void { // TODO: petit usercard
	// Création du conteneur principal
	const container = document.createElement("div");
	container.className = "flex flex-col";

	// Bannière et image de profil
	const bannerContainer = document.createElement("div");
	bannerContainer.className = "h-[220px] relative";

	// Conteneur de la bannière
	const bannerWrapper = document.createElement("div");
	bannerWrapper.className = "w-[410px] h-[150px] overflow-hidden";

	const bannerImg = document.createElement("img");
	bannerImg.id = "banner-card";
	bannerImg.className = "bg-[#1a1826] w-[450px] object-cover";
	bannerImg.src = NewuserData.banner || userInfos.banner || "assets/default_banner.jpeg";
	bannerImg.alt = "Bannière utilisateur";

	bannerWrapper.appendChild(bannerImg);
	bannerContainer.appendChild(bannerWrapper);

	// Conteneur de l'image de profil avec fond
	const profileWrapper = document.createElement("div");
	profileWrapper.className = "absolute top-[80px] left-[5%] w-[130px] h-[130px]";

	const profileBg = document.createElement("div");
	profileBg.className = "absolute inset-0 bg-[#1a1826] rounded-full";

	const profileImg = document.createElement("img");
	profileImg.id = "profile-picture-card";
	profileImg.className = "w-full h-full rounded-full border-8 border-[#1a1826] relative z-10";
	profileImg.src = NewuserData.picture	 || userInfos.picture	 || "assets/default.jpeg";
	profileImg.alt = "Photo de profil";

	profileWrapper.appendChild(profileBg);
	profileWrapper.appendChild(profileImg);
	bannerContainer.appendChild(profileWrapper);

	// Infos utilisateur
	const userInfoContainer = document.createElement("div");
	userInfoContainer.className = "ml-8 mt-4";

	const userName = document.createElement("h2");
	userName.className = "text-xl font-bold";
	userName.id = "userCardName";
	userName.textContent = NewuserData.name || userInfos.name || "Nom inconnu";

	const userBio = document.createElement("p");
	userBio.className = "text-gray-500";
    userBio.id = "userBio"
	userBio.textContent = NewuserData.bio || userInfos.bio || "Aucune biographie disponible.";

	userInfoContainer.appendChild(userName);
	userInfoContainer.appendChild(userBio);

	// Assemblage final
	container.appendChild(bannerContainer);
	container.appendChild(userInfoContainer);

	// Injection dans l'élément cible
	targetElement.innerHTML = "";
	targetElement.appendChild(container);
}


// 📌 Injecte la carte utilisateur dans l'élément cible
export async function injectUserCard(targetId: string): Promise<void> {
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
        return;
    }

	await getUserInfos();
	updateUserCardMaxi(targetElement, NewuserData, userInfos);
}

// 📌 Met à jour les données utilisateur et réinjecte la carte
// export function updateUserCardFromForm(formId: string, targetId: string): void {
//     const form = document.getElementById(formId) as HTMLFormElement | null;
    
//     if (!form) {
//         console.error(`Aucun formulaire trouvé avec l'ID "${formId}"`);
//         return;
//     }

// 	NewuserData.name = (form.elements.namedItem("pseudo") as HTMLInputElement)?.value || "";

//     injectUserCard(targetId);
// }

// 📌 Gère la prévisualisation des images et met à jour NewuserData
export function previewImage(event: Event, targetId: string, otherTargetId: string, otherInputId: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        console.error("❌ Aucun fichier sélectionné.");
        return;
    }

    const file = input.files[0];
    const otherInput = document.getElementById(otherInputId) as HTMLInputElement | null;
    const otherFile = otherInput?.files?.[0] || null;

    console.log("✅ Fichier sélectionné :", file.name);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) {
            console.error("❌ Erreur lors de la lecture du fichier !");
            return;
        }

        const imagePreview = document.getElementById(targetId) as HTMLImageElement | null;
        if (imagePreview) {
            imagePreview.src = e.target.result as string;

            if (targetId === "profile-picture-card") {
                NewuserData.picture	 = e.target.result as string;
            } else {
                NewuserData.banner = e.target.result as string;
            }

            console.log("✅ Image mise à jour !");
        } else {
            console.error("❌ Élément <img> introuvable !");
        }
    };
    reader.onerror = () => console.error("❌ Erreur lors de la lecture du fichier !");
    reader.readAsDataURL(file);

    // 🔹 Vérifie et charge l'autre fichier (bannière ou photo de profil)
    if (otherFile) {
        const otherReader = new FileReader();
        otherReader.onload = (e: ProgressEvent<FileReader>) => {
            if (!e.target?.result) return;

            const otherImagePreview = document.getElementById(otherTargetId) as HTMLImageElement | null;
            if (otherImagePreview) {
                otherImagePreview.src = e.target.result as string;

                if (otherInputId === "profileImageInput") {
                    NewuserData.picture	 = e.target.result as string;
                } else if (otherInputId === "profileBannerInput") {
                    NewuserData.banner = e.target.result as string;
                }
            }
        };
        otherReader.readAsDataURL(otherFile);
    }
}
