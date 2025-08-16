export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} animate-power-up`;

  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
  };

  toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="${iconMap[type]}"></i>
            <span>${message}</span>
        </div>
    `;

  // Trouver ou créer le conteneur de toast
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 right-4 flex flex-col space-y-2 z-50";
    document.body.appendChild(container);
  }

  // Ajouter le toast
  container.appendChild(toast);

  // Animation de sortie
  setTimeout(() => {
    toast.classList.add("animate-fade-out");
    setTimeout(() => {
      toast.remove();
      // Supprimer le conteneur s'il est vide
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 5000);
}

// Ajout des keyframes pour l'animation de fade-out dans le style global
const style = document.createElement("style");
style.textContent = `
@keyframes fade-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

.animate-fade-out {
    animation: fade-out 0.3s ease-out forwards;
}
`;
document.head.appendChild(style);
