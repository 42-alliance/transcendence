let userData = {
// name: form.elements["pseudo"].value,
// profilePicture: form.elements["profileImage"].value,
// banner: form.elements["banner"].value,
// // bio: form.elements["bio"].value
};
export function injectUserCard(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
        console.error(`Aucun élément trouvé avec l'ID "${targetId}"`);
        return;
    }
    targetElement.innerHTML = `
        <div class="card-container">
            <div class="banner-and-picture">
                <div class="banner-container">
                    <img id="banner-card" class="banner-card" src="assets/default_banner.jpeg" alt="Bannière utilisateur">
                </div>
                <img class="profile-picture-card" id="profile-picture-card" src="assets/default.jpeg" alt="Photo de profil">
            </div>
            <div class="card-user-infos">
                <h2 class="user-name">${userData.name || 'Nom inconnu'}</h2>
                <p class="user-bio">${userData.bio || 'Aucune biographie disponible.'}</p>
            </div>
        </div>
    `;
}
export function updateUserCardFromForm(formId, targetId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Aucun formulaire trouvé avec l'ID "${formId}"`);
        return;
    }
    userData = {
        name: form.elements["pseudo"].value,
        profilePicture: form.elements["profileImage"].value,
        banner: form.elements["profileBanner"].value,
        // bio: form.elements["bio"].value
    };
    injectUserCard(targetId);
}
export function previewImage(event, targetId, otherTargetId, otherInputId) {
    const file = event.target.files[0];
    const otherInput = document.getElementById(otherInputId);
    const otherFile = otherInput ? otherInput.files[0] : null;
    if (!file) {
        console.error("❌ Aucun fichier sélectionné.");
        return;
    }
    console.log("✅ Fichier sélectionné :", file.name);
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log("✅ Data URL générée :", e.target.result.substring(0, 50) + "...");
            const imagePreview = document.getElementById(targetId);
            if (imagePreview) {
                imagePreview.src = e.target.result;
                if (targetId === "profile-picture-card")
                    userData.profilePicture = e.target.result;
                else
                    userData.banner = e.target.result;
                console.log("✅ Image mise à jour !");
            }
            else {
                console.error("❌ Élément <img> introuvable !");
            }
        };
        reader.onerror = function () {
            console.error("❌ Erreur lors de la lecture du fichier !");
        };
        reader.readAsDataURL(file);
    }
    if (otherFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const otherImagePreview = document.getElementById(otherTargetId);
            if (otherImagePreview) {
                otherImagePreview.src = e.target.result; // Met à jour la source de l'image
                // Mettez à jour les données de l'utilisateur
                if (otherInputId === "profileImageInput") {
                    userData.profilePicture = e.target.result; // Mettre à jour les données de profil
                }
                else if (otherInputId === "profileBannerInput") {
                    userData.banner = e.target.result; // Mettre à jour les données de la bannière
                }
            }
        };
        reader.readAsDataURL(otherFile);
    }
}
//# sourceMappingURL=userCard.js.map