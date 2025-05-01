import { getUserInfos, userInfos } from "../../User/me.js";

interface UserData {
    name?: string;
    picture	?: string;
    banner?: string;
    bio?: string;
}

let NewuserData: UserData = {};

function updateUserCard(targetElement: HTMLElement, NewuserData: UserData, userInfos: UserData): void {
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
	updateUserCard(targetElement, NewuserData, userInfos);
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
