import { userInfos } from "../../User/me.js";

interface UserData {
    name?: string;
    profilePicture?: string;
    banner?: string;
    bio?: string;
}

let NewuserData: UserData = {};

// 📌 Injecte la carte utilisateur dans l'élément cible
export function injectUserCard(targetId: string): void {
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
        return;
    }

	targetElement.innerHTML = `
		<div class="flex flex-col">
			<!-- Bannière et image de profil -->
			<div class="h-[220px] relative">
				<!-- Conteneur de la bannière -->
				<div class="w-[410px] h-[150px] overflow-hidden">
					<img id="banner-card" class="bg-[#1a1826] w-[450px] object-cover" 
						src="${NewuserData.banner || userInfos.banner || 'assets/default_banner.jpeg'}" 
						alt="Bannière utilisateur">
				</div>

				<!-- Conteneur de l'image de profil avec fond -->
				<div class="absolute top-[80px] left-[5%] w-[130px] h-[130px]">
					<div class="absolute inset-0 bg-[#1a1826] rounded-full"></div> <!-- Fond -->
					<img class="w-full h-full rounded-full border-8 border-[#1a1826] relative z-10" 
						id="profile-picture-card"
						src="${NewuserData.profilePicture || userInfos.picture || 'assets/default.jpeg'}" 
						alt="Photo de profil">
				</div>
			</div>

			<!-- Infos utilisateur -->
			<div class="ml-8 mt-4">
				<h2 class="text-xl font-bold">${NewuserData.name || userInfos.name || 'Nom inconnu'}</h2>
				<p class="text-gray-500">${NewuserData.bio || userInfos.bio || 'Aucune biographie disponible.'}</p>
			</div>
		</div>
	`;
}

// 📌 Met à jour les données utilisateur et réinjecte la carte
export function updateUserCardFromForm(formId: string, targetId: string): void {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    
    if (!form) {
        console.error(`Aucun formulaire trouvé avec l'ID "${formId}"`);
        return;
    }

	NewuserData.name = (form.elements.namedItem("pseudo") as HTMLInputElement)?.value || "";

    injectUserCard(targetId);
}

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
                NewuserData.profilePicture = e.target.result as string;
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
                    NewuserData.profilePicture = e.target.result as string;
                } else if (otherInputId === "profileBannerInput") {
                    NewuserData.banner = e.target.result as string;
                }
            }
        };
        otherReader.readAsDataURL(otherFile);
    }
}
