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
	// Création du conteneur principal avec la bannière en fond
	const container = document.createElement("div");
	container.className = "flex flex-col items-center p-4 rounded-lg shadow-lg w-[300px] hover:shadow-xl transition-shadow duration-300 relative cursor-pointer hover:scale-105 transition-transform";
	container.style.backgroundImage = `url('${userInfos.banner || "assets/default_banner.jpeg"}')`;
	container.style.backgroundSize = "cover";
	container.style.backgroundPosition = "center";
	container.style.backgroundRepeat = "no-repeat";
	container.style.backgroundColor = "#1a1826"; // fallback si pas d'image

	// Overlay sombre pour lisibilité
	const overlay = document.createElement("div");
	overlay.className = "absolute inset-0 rounded-lg";
	overlay.style.background = "rgba(26, 24, 38, 0.7)";
	overlay.style.zIndex = "0";
	container.appendChild(overlay);

	// Photo de profil
	const profileImg = document.createElement("img");
	profileImg.id = "profile-picture-card";
	profileImg.className = "w-[100px] h-[100px] rounded-full border-4 border-[#1a1826] mb-4 object-cover z-10";
	profileImg.src = userInfos.picture || "assets/default.jpeg";
	profileImg.alt = "Photo de profil";
	profileImg.style.position = "relative";

	// Nom d'utilisateur
	const userName = document.createElement("h2");
	userName.id = "userCardName";
	userName.className = "text-xl font-bold text-white mb-2 z-10";
	userName.textContent = userInfos.name || "Nom inconnu";
	userName.style.position = "relative";

	// Bouton "plus d'options" (icône ...)
	const optionsBtn = document.createElement("button");
	optionsBtn.className = "absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none z-20";
	optionsBtn.title = "Plus d'options";
	optionsBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<circle cx="5" cy="12" r="2"/>
		<circle cx="12" cy="12" r="2"/>
		<circle cx="19" cy="12" r="2"/>
	</svg>`;

	// Conteneur pour les boutons côte à côte
	const btnGroup = document.createElement("div");
	btnGroup.className = "flex gap-2 mt-2 z-10";
	btnGroup.style.position = "relative";

	// Bouton Chat
	const chatBtn = document.createElement("button");
	chatBtn.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded shadow cursor-pointer transition-colors";
	chatBtn.textContent = "Chat";
	chatBtn.title = "Envoyer un message";
	chatBtn.onclick = () => {
		alert(`Ouvrir le chat avec ${userInfos.name || "cet utilisateur"}`);
	};

	// Bouton Inviter à une partie rapide
	const inviteBtn = document.createElement("button");
	inviteBtn.className = "bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded shadow cursor-pointer transition-colors";
	inviteBtn.textContent = "Inviter à jouer";
	inviteBtn.title = "Inviter à une partie rapide";
	inviteBtn.onclick = () => {
		alert(`Inviter ${userInfos.name || "cet utilisateur"} à une partie rapide`);
	};

	btnGroup.appendChild(chatBtn);
	btnGroup.appendChild(inviteBtn);

	// Positionnement relatif pour le bouton
	container.style.position = "relative";
	container.appendChild(optionsBtn);

	// Assemblage final (overlay en premier, puis le reste)
	container.appendChild(profileImg);
	container.appendChild(userName);
	container.appendChild(btnGroup);

	// Injection dans l'élément cible
	targetElement.innerHTML = "";
	targetElement.appendChild(container);
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
