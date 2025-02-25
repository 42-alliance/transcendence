import { triggerToast } from "../../../script.js";
import { displayMessage, openGeneralChat, openPrivateChat } from "./message.js";
import { webSockets } from "../viewManager.js";

const dev_token = "Token 37cff866c48347a856dcfae3cbbbb7f5c2b14c33"

export function setupWebSocket(username = null, caller = null) {

	console.log("☎️ Setting Up WebSocket calling by => ", caller ? caller : "global_init");

	if (webSockets.chat) {
        webSockets.chat.close();
    }

	const wsUrl = username 
        ? `ws://localhost:8000/ws/api/chat/${username}/`
        : `ws://localhost:8000/ws/api/chat/`;

	webSockets.chat = new WebSocket(wsUrl);

	webSockets.chat.onopen = () => {
		webSockets.chat.onopen = () => {
			console.log(`✅ Connecté au WebSocket ${username ? 'privé avec' : 'global'}`);
		};
	};

	webSockets.chat.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("📩 Message reçu => ", data);

		if (data.sender != sessionStorage.getItem("username")) 
			triggerToast(`📨 Nouveau message de ${data.sender}`, true);
		displayMessage(data);
	};

	webSockets.chat.onclose = (event) => {
		console.log("❌ WebSocket déconnecté !", event);
		// setTimeout(setupWebSocket, 3000);
	};

	webSockets.chat.onerror = (error) => {
		console.error("⚠️ Erreur WebSocket :", error);
	};
	// setupEventListeners();
}

function chatButtonClick() {
    const chatButton = document.getElementById("sticky-chat");
    let chatPanel = document.querySelector(".chat-panel");

    if (chatPanel.classList.contains("expanded")) {
        // Rétracter le chat
        chatPanel.classList.remove("expanded");
        chatButton.classList.remove("panel-expanded");
        setTimeout(() => {
            chatPanel.querySelector(".chat-content").innerHTML = "";
        }, 300);
    } else {
        // Étendre le chat
        chatPanel.classList.add("expanded");
        chatButton.classList.add("panel-expanded");
        setTimeout(() => {
            displayConversations();
        }, 50);
    }
}

export async function chatDiv() {
    const chatButton = document.getElementById('sticky-chat');
    
    if (chatButton === null)
        return;

    chatButton.addEventListener('click', chatButtonClick);
}

async function fetchConversations() {
	try {
		const headers = new Headers();
		headers.append('Authorization', dev_token);
		headers.append('Content-Type', 'application/json');
		const response = await fetch("http://localhost:8000/api/conversations/", {
			method: "GET",
			credentials: "include",
			headers: headers,
		});

		if (!response.ok) {
			throw new Error("Erreur lors de la récupération des conversations");
		}
		return await response.json();
	} catch (error) {
		console.error("Error:", error);
	}
	return null;
}
{/*  */}

// Fonction principale qui orchestre l'affichage des conversations
export async function displayConversations() {
    // Récupération des conversations
    const conversations = await fetchConversationsWithErrorHandling();
    if (!conversations) return;
    
    // Initialisation de l'interface utilisateur
    initializeUIComponents();
    
    // Affichage des conversations
    renderConversationsList(conversations);
    
    // Ajout des gestionnaires d'événements
    setupEventListeners();
    
    // Ajustement des classes du conteneur de conversation
    adjustContainerClasses();
}

// Récupère les conversations avec gestion d'erreur
async function fetchConversationsWithErrorHandling() {
    try {
        return await fetchConversations();
    } catch (error) {
        console.error("Error fetching conversations: ", error);
        return null;
    }
}

// Initialise les composants d'interface utilisateur
function initializeUIComponents() {
    const chatContent = document.querySelector(".chat-content");
    
    // Ajouter la barre de recherche avec les composants nécessaires
    chatContent.innerHTML = `
        <div class="input-group mb-3">
            <button id="global-chat" class="input-group-text">
                <i class="fas fa-globe"></i>
            </button>

            <div class="content-container">
                <div id="chat-message" class="form-control text-center">Vos conversations</div>
                
                <div class="search-container">
                    <div class="input-icon-container">
                        <input type="text" id="chat-search" class="form-control" 
                               placeholder="Search or start new chat..." autocomplete="off">
                        <i class="fas fa-paper-plane input-icon"></i>
                    </div>
                </div>
            </div>

            <button class="btn btn-primary" type="submit" id="search-conversation">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    `;
}

// Affiche la liste des conversations
function renderConversationsList(conversations) {
    const chatContent = document.querySelector(".chat-content");
    
    conversations.forEach(conv => {
        const convItem = createConversationItem(conv);
        chatContent.appendChild(convItem);
    });
}

// Crée un élément pour une conversation
function createConversationItem(conv) {
    const convItem = document.createElement("div");
    convItem.classList.add("conversation-item");
    
    convItem.innerHTML = `
        <img src="${conv.profile_picture || 'default_profile.png'}" alt="${conv.username}" class="p-msg-profile-picture">
        <div>
            <h4>${conv.username}</h4>
            <p>${conv.last_message}</p>
            <span class="timestamp">${new Date(conv.timestamp).toLocaleString()}</span>
        </div>
    `;
    
    convItem.addEventListener("click", () => openPrivateChat(conv.username));
    
    return convItem;
}

// Ajuste les classes du conteneur de conversation
function adjustContainerClasses() {
    let chat_content = document.getElementById("conv-container");
    chat_content.classList.remove("chat-content-chat");
    chat_content.classList.add("chat-content-conversation");
}

// Configuration des gestionnaires d'événements
function setupEventListeners() {
    // Événement pour le chat global
    document.getElementById('global-chat').addEventListener('click', () => {
        openGeneralChat();
    });

    // Événement pour la touche Entrée dans la barre de recherche
    const searchBar = document.getElementById("chat-search");
    searchBar.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSearchSubmit();
        }
    });

    // Configurez les événements de toggle pour le bouton de recherche
    setupSearchToggle();
    
    // Événement pour l'icône d'avion en papier
    document.querySelector('.input-icon').addEventListener('click', handleSearchSubmit);
}

// Gère la soumission de la recherche
function handleSearchSubmit() {
    const searchInput = document.getElementById('chat-search');
    const inputValue = searchInput.value.trim();
    
    if (inputValue !== '') {
        openPrivateChat(inputValue);
        searchInput.value = '';
    }
}

// Configuration du toggle de recherche
function setupSearchToggle() {
    const searchButton = document.getElementById('search-conversation');
    const chatMessage = document.getElementById('chat-message');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('chat-search');
    const buttonIcon = searchButton.querySelector('i');
    
    let isSearchMode = false;
    let isAnimating = false;
    
    searchButton.addEventListener('click', () => {
        if (isSearchMode) {
            disableSearchMode();
        } else {
            enableSearchMode();
        }
    });
    
    // Fonction pour passer en mode recherche
    function enableSearchMode() {
        if (isAnimating) return;
        isAnimating = true;
        
        // Modifier l'icône du bouton
        buttonIcon.classList.remove('fa-plus');
        buttonIcon.classList.add('fa-times');
        searchButton.classList.remove('btn-primary');
        searchButton.classList.add('btn-danger');
        
        // Faire disparaître le message et afficher la barre de recherche
        chatMessage.classList.add('slide-out');
        
        setTimeout(() => {
            searchContainer.classList.add('slide-in');
            searchInput.focus(); // Mettre le focus sur l'input
            
            setTimeout(() => {
                isAnimating = false;
                isSearchMode = true;
            }, 300);
        }, 300);
    }
    
    // Fonction pour revenir au mode normal
    function disableSearchMode() {
        if (isAnimating) return;
        isAnimating = true;
        
        // Modifier l'icône du bouton
        buttonIcon.classList.remove('fa-times');
        buttonIcon.classList.add('fa-plus');
        searchButton.classList.remove('btn-danger');
        searchButton.classList.add('btn-primary');
        
        // Vider le contenu de la recherche
        searchInput.value = '';
        
        // Faire disparaître la barre de recherche et afficher le message
        searchContainer.classList.remove('slide-in');
        
        setTimeout(() => {
            chatMessage.classList.remove('slide-out');
            
            setTimeout(() => {
                isAnimating = false;
                isSearchMode = false;
            }, 300);
        }, 300);
    }
    
    // Ajouter un événement pour la touche Escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSearchMode) {
            disableSearchMode();
        }
    });
}