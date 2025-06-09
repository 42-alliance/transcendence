
export interface ToastType	{
	text: string;	
	img?: string; // URL de l'image de profil (ou null)
	buttons: Array<{
		label: string;
		onClick: () => void;
	}>;
	duration?: number; // Auto-fermeture après X ms (0 = reste affiché)
}

/**
 * Affiche un toast custom dans la page.
 * @param {Object} opts
 * @param {string} opts.text  - Texte à afficher
 * @param {string} opts.img   - URL de l’image de profil (ou null)
 * @param {Array<{label: string, onClick: function}>} opts.buttons - Liste de boutons [{label, onClick}]
 * @param {number} [opts.duration=0] - Auto-fermeture après X ms (0 = reste affiché)
 */
export function showToast(args: ToastType) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    // Toast principal
    const toast = document.createElement("div");
    toast.className = "flex items-center bg-gray-800 text-white px-4 py-3 rounded-xl toast-shadow min-w-[280px] max-w-xs relative animate-fade-in";
    toast.style.animation = "fade-in 0.2s";

    // Image
    const avatar = document.createElement("img");
    avatar.src = args.img || "/assets/default.jpeg";
    avatar.className = "w-10 h-10 rounded-full border-2 border-orange-400/30 mr-3 object-cover";
    avatar.alt = "avatar";
    toast.appendChild(avatar);

    // Texte & boutons
    const center = document.createElement("div");
    center.className = "flex-1 min-w-0 flex flex-col";
    const textDiv = document.createElement("div");
    textDiv.className = "font-semibold text-sm mb-1 truncate";
    textDiv.textContent = args.text;
    center.appendChild(textDiv);

    // Boutons
    if (args.buttons.length) {
        const btns = document.createElement("div");
        btns.className = "flex gap-2";
        args.buttons.forEach(btn => {
            const b = document.createElement("button");
            b.textContent = btn.label;
            b.className = "px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-xs font-bold transition";
            b.onclick = (e) => {
                e.stopPropagation();
                btn.onClick && btn.onClick();
                closeToast();
            };
            btns.appendChild(b);
        });
        center.appendChild(btns);
    }
    toast.appendChild(center);

    // Croix fermeture
    const close = document.createElement("button");
    close.className = "absolute top-2 right-2 text-gray-400 hover:text-white text-xl";
    close.innerHTML = "&times;";
    close.onclick = closeToast;
    toast.appendChild(close);

    // Anim fade-in (optionnel)
    toast.style.opacity = "0";
    setTimeout(() => { toast.style.opacity = "1"; }, 20);

    // Fermer
    function closeToast() {
        toast.style.opacity = '1';
        setTimeout(() => toast.remove(), 200);
    }

    toastContainer.appendChild(toast);

    if (args.duration && args.duration > 0) {
        setTimeout(closeToast, args.duration);
    }
}


