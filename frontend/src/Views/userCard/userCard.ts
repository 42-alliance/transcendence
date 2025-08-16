import { getUserInfos, userInfos } from "../../User/me.js";
import { updateUserInfos } from "../../User/updateUser.js";
import { gameWsClass, navigateTo } from "../viewManager.js";
import { createConversation } from "../../Chat/createConversation.js";
import { showToast } from "../triggerToast.js";
import { GetUserByName } from "../../User/getUserByName.js";
import { UserData } from "../../types.js";
import { removeFriend } from "../../Friends/removeFriend.js";
import { addFriend } from "../../Friends/addFriend.js";
import { updateFriendStatus } from "../../Friends/updateFriendStatus.js";
import { on } from "events";
import { blockUser, unblockUser } from "../../User/blockFunctions.js";

// Définition de plusieurs constantes utiles pour la réutilisation (comme des "define")
export const status: Record<string, string> = {
	online: "bg-green-500",
	offline: "bg-gray-500",
	away: "bg-yellow-500",
	inGame: "bg-red-500"
};

export const defaultImages = {
	profile: "assets/default.jpeg",
	banner: "assets/default_banner.jpeg"
};

export const userStatusLabels: Record<string, string> = {
	online: "Online",
	offline: "Offline",
	away: "Away",
	inGame: "In Game"
};

let NewuserData: UserData = {};

export async function goChat(userInfos: UserData): Promise<void> {
	try {
		const conv_id = await createConversation([userInfos.name!, (await getUserInfos())?.name!]);
		navigateTo(`/chat/${conv_id}`);	
	} catch (error) {
		showToast({
			text: "Error going to chat",
			buttons: [],
			duration: 5000
		});
	}
}

export function miniPendingUserCard(
	userInfos: UserData,
	onAccept: () => void,
	onDecline: () => void,
	onInvite: () => void, // callback pour "inviter à jouer" dans le dropdown
	onChat: () => void, // callback pour "inviter à jouer" dans le dropdown
	onProfile: () => void // callback pour "voir profil" dans le dropdown
): HTMLDivElement {
	const card = document.createElement("div");
	card.classList.add(
		`incoming-friend-${userInfos.id}`,
		"friend-card",
		"rounded-xl",
		"p-4",
		"transition-all",
		"duration-300",
		"border",
		"border-gray-700/30",
		"hover:border-gray-600/50",
		"flex",
		"flex-col",
		"relative",
		"shadow-lg",
		"hover:shadow-xl",
		"overflow-hidden",
		"w-full",
	);
	card.style.backgroundImage = `url('${userInfos.banner || "assets/default_banner.jpeg"}')`;
	card.style.backgroundSize = "cover";
	card.style.backgroundAttachment = "local";
	card.style.backgroundPosition = "center";
	card.style.backgroundRepeat = "no-repeat";

	const overlay = document.createElement("div");
	overlay.className = "absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0 pointer-events-none rounded-xl";
	card.appendChild(overlay);

	const topSection = document.createElement("div");
	topSection.className = "flex items-center gap-3 mb-3 relative z-10";

	const avatarContainer = document.createElement("div");
	avatarContainer.className = "relative";
	const profileImg = document.createElement("img");
	profileImg.className = "w-12 h-12 rounded-full object-cover border-2 border-orange-400/80";
	profileImg.src = userInfos.picture || "assets/default.jpeg";
	profileImg.alt = `${userInfos.name || "User"} profile picture`;
	avatarContainer.appendChild(profileImg);

	const userInfo = document.createElement("div");
	const userName = document.createElement("h3");
	userName.className = "font-semibold text-white truncate max-w-[150px]";
	userName.textContent = userInfos.name || "Unknown User";
	const userStatus = document.createElement("p");
	userStatus.className = "text-xs text-orange-400";
	userStatus.textContent = "Demande d'ami";
	userInfo.appendChild(userName);
	userInfo.appendChild(userStatus);

	topSection.appendChild(avatarContainer);
	topSection.appendChild(userInfo);

	// Dropdown (avec placement intelligent)
	let dropdown: HTMLDivElement | null = null;
	const optionsBtn = document.createElement("button");
	optionsBtn.className =
		"absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-700/50 rounded-full transition-colors z-20";
	optionsBtn.title = "Plus d'options";
	optionsBtn.innerHTML = `
		<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<circle cx="5" cy="12" r="1.5"></circle>
			<circle cx="12" cy="12" r="1.5"></circle>
			<circle cx="19" cy="12" r="1.5"></circle>
		</svg>
	`;
	optionsBtn.onclick = (e) => {
		e.stopPropagation();
		if (dropdown) {
			dropdown.remove();
			dropdown = null;
			return;
		}
		dropdown = document.createElement("div");
		dropdown.className = "absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[170px] animate-fade-in";
		dropdown.innerHTML = `
			<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm rounded-t-lg">Voir profil</button>
			<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm rounded-t-lg">Go chat</button>
			<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-blue-400 text-sm">Inviter à jouer</button>
		`;
		document.body.appendChild(dropdown);
		const btnRect = optionsBtn.getBoundingClientRect();
		dropdown.style.top = `${btnRect.bottom + window.scrollY + 4}px`;
		dropdown.style.left = `${btnRect.right - dropdown.offsetWidth + window.scrollX}px`;
		// Click out
		function handleClickOutside(event: MouseEvent) {
			if (dropdown && !dropdown.contains(event.target as Node) && event.target !== optionsBtn) {
				dropdown.remove();
				dropdown = null;
				document.removeEventListener("mousedown", handleClickOutside);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);

		const btns = dropdown.querySelectorAll("button");
		btns[0].addEventListener("click", () => {
			onProfile && onProfile();
			dropdown?.remove();
			dropdown = null;
		});
		btns[1].addEventListener("click", () => {
			onChat && onChat();
			dropdown?.remove();
			dropdown = null;
		});
		btns[2].addEventListener("click", () => {
			onInvite && onInvite();
			dropdown?.remove();
			dropdown = null;
		});
	};
	card.appendChild(optionsBtn);

	const btnGroup = document.createElement("div");
	btnGroup.className = "mt-auto flex gap-2 relative z-10";

	// Responsive : affiche le texte sur largeur > 400px, icône sinon
	function createButton(label: string, iconSvg: string, colorClass: string, onClick: () => void) {
		const btn = document.createElement("button");
		btn.className = `flex-1 min-w-[2.5rem] px-2 py-2 flex items-center justify-center ${colorClass} text-white text-sm rounded-lg transition-colors select-none`;
		btn.innerHTML = `
			<span class="inline-block sm:hidden">${iconSvg}</span>
			<span class="hidden sm:inline">${label}</span>
		`;
		btn.onclick = (e) => {
			e.stopPropagation();
			onClick();
		};
		return btn;
	}

	// Bouton Accepter
	const acceptIcon = `
		<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
			<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.004 7.004a1 1 0 01-1.414 0l-3.004-3.004a1 1 0 111.414-1.414l2.297 2.297 6.297-6.297a1 1 0 011.414 0z" clip-rule="evenodd" />
		</svg>
	`;
	const acceptBtn = createButton("Accepter", acceptIcon, "bg-green-600 hover:bg-green-700", onAccept);

	// Bouton Refuser
	const refuseIcon = `
		<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<line x1="18" y1="6" x2="6" y2="18"/>
			<line x1="6" y1="6" x2="18" y2="18"/>
		</svg>
	`;
	const refuseBtn = createButton("Refuser", refuseIcon, "bg-red-600 hover:bg-red-700", onDecline);

	btnGroup.appendChild(acceptBtn);
	btnGroup.appendChild(refuseBtn);

	card.appendChild(topSection);
	card.appendChild(btnGroup);

	return card;
}

export function addAttribute(Elem: Element, attribute: string) {
	if (!Elem) return;
	Elem.classList.remove(status.online, status.offline, status.away, status.inGame);
	if (attribute === "online") {
		Elem.classList.add(status.online);
	}
	else if (attribute === "offline") {	
		Elem.classList.add(status.offline);
	}
	else if (attribute === "away") {
		Elem.classList.add(status.away);
	}
	else if (attribute === "inGame") {
		Elem.classList.add(status.inGame);
	}
	else {
		console.warn("Unknown status attribute:", attribute);
		return;
	}
}

export function writeStatus(Elem: Element, status_to_write: string) {
	if (!Elem) return;
	Elem.classList.remove(status.online, status.offline, status.away, status.inGame);
	if (status_to_write === "online" || status_to_write === "offline" || status_to_write === "away") {
		Elem.textContent = status_to_write;
	} else if (status_to_write === "inGame") {
		Elem.textContent = "In Game";
	}
}

type DropdownOption = {
    label: string;
    colorClass?: string;
    onClick: (user: UserData, card: HTMLDivElement) => void;
};

export async function miniUserCard(
	targetElement: HTMLElement,
	userInfos: UserData,
	dropdownOptions: DropdownOption[] = []
) {
	const card = createMiniUserCard(userInfos, dropdownOptions);
	targetElement.appendChild(card);
}

export function createMiniUserCard(
	userInfos: UserData,
	dropdownOptions: DropdownOption[] = []
): HTMLDivElement {
	const card = createMiniUserCardContainer(userInfos);
	const overlay = createMiniUserCardOverlay();
	card.appendChild(overlay);

	const topSection = createMiniUserCardTopSection(userInfos);
	card.appendChild(topSection);

	let dropdown: HTMLDivElement | null = null;
	const optionsBtn = createMiniUserCardOptionsBtn(() => dropdown, (d) => dropdown = d, userInfos, dropdownOptions, card);
	card.appendChild(optionsBtn);

	const btnGroup = createMiniUserCardBtnGroup(userInfos);
	card.appendChild(btnGroup);

	return card;
}

function createMiniUserCardContainer(userInfos: UserData): HTMLDivElement {
	const card = document.createElement("div");
	card.classList.add(`friend-${userInfos.id}`);
	card.classList.add(
		"friend-card",
		"rounded-xl",
		"p-4",
		"transition-all",
		"duration-300",
		"border",
		"border-gray-700/30",
		"hover:border-gray-600/50",
		"flex",
		"flex-col",
		"relative",
		"shadow-lg",
		"hover:shadow-xl",
		"overflow-hidden"
	);
	card.style.backgroundImage = `url('${userInfos.banner || "assets/default_banner.jpeg"}')`;
	card.style.backgroundSize = "cover";
	card.style.backgroundAttachment = "local";
	card.style.backgroundPosition = "center";
	card.style.backgroundRepeat = "no-repeat";
	return card;
}

function createMiniUserCardOverlay(): HTMLDivElement {
	const overlay = document.createElement("div");
	overlay.className = "absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0 pointer-events-none rounded-xl";
	return overlay;
}

function createMiniUserCardTopSection(userInfos: UserData): HTMLDivElement {
	const topSection = document.createElement("div");
	topSection.className = "flex items-center gap-3 mb-3 relative z-10";

	const avatarContainer = document.createElement("div");
	avatarContainer.className = "relative";

	const profileImg = document.createElement("img");
	profileImg.className = "w-12 h-12 rounded-full object-cover border-2 border-blue-500/80";
	profileImg.src = userInfos.picture || "assets/default.jpeg";
	profileImg.alt = `${userInfos.name || "User"} profile picture`;

	const statusIndicator = document.createElement("span");
	statusIndicator.classList.add(`status-indicator-${userInfos.id}`);
	addAttribute(statusIndicator, userInfos.status!);
	statusIndicator.classList.add(
		"absolute",
		"bottom-0",
		"right-0",
		"w-3",
		"h-3",
		"rounded-full",
		"border-2",
		"border-gray-800"
	);

	avatarContainer.appendChild(profileImg);
	avatarContainer.appendChild(statusIndicator);

	const userInfo = document.createElement("div");

	const userName = document.createElement("h3");
	userName.className = "font-semibold text-white truncate max-w-[150px]";
	userName.textContent = userInfos.name || "Unknown User";

	const userStatus = document.createElement("p");
	userStatus.className = `status-text-${userInfos.id} text-xs text-blue-400`;
	writeStatus(userStatus, userInfos.status!);

	userInfo.appendChild(userName);
	userInfo.appendChild(userStatus);

	topSection.appendChild(avatarContainer);
	topSection.appendChild(userInfo);

	return topSection;
}

function createMiniUserCardOptionsBtn(
	getDropdown: () => HTMLDivElement | null,
	setDropdown: (d: HTMLDivElement | null) => void,
	userInfos: UserData,
	dropdownOptions: DropdownOption[],
	card: HTMLDivElement
): HTMLButtonElement {
	const optionsBtn = document.createElement("button");
	optionsBtn.className =
		"absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-700/50 rounded-full transition-colors z-20";
	optionsBtn.title = "Plus d'options";
	optionsBtn.innerHTML = `
		<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<circle cx="5" cy="12" r="1.5"></circle>
			<circle cx="12" cy="12" r="1.5"></circle>
			<circle cx="19" cy="12" r="1.5"></circle>
		</svg>
	`;
	optionsBtn.onclick = (e) => {
		e.stopPropagation();

		let dropdown = getDropdown();
		if (dropdown) {
			dropdown.remove();
			setDropdown(null);
			return;
		}

		dropdown = document.createElement("div");
		dropdown.className = "absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[170px] animate-fade-in";

		dropdown.innerHTML = dropdownOptions.map((opt, idx) => `
			<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm ${opt.colorClass || ""} ${idx === 0 ? "rounded-t-lg" : ""} ${idx === dropdownOptions.length - 1 ? "rounded-b-lg" : ""}" data-opt-index="${idx}">
				${opt.label}
			</button>
		`).join('');

		document.body.appendChild(dropdown);
		const btnRect = optionsBtn.getBoundingClientRect();
		const dropdownRect = dropdown.getBoundingClientRect();
		let top = btnRect.bottom + window.scrollY + 4;
		let left = btnRect.right - dropdown.offsetWidth + window.scrollX;

		if (top + dropdown.offsetHeight > window.scrollY + window.innerHeight) {
			top = btnRect.top + window.scrollY - dropdown.offsetHeight - 4;
		}
		if (left + dropdown.offsetWidth > window.scrollX + window.innerWidth) {
			left = window.scrollX + window.innerWidth - dropdown.offsetWidth - 12;
		}
		if (left < 0) left = 12;

		dropdown.style.position = "absolute";
		dropdown.style.top = `${top}px`;
		dropdown.style.left = `${left}px`;

		function handleClickOutside(event: MouseEvent) {
			if (dropdown && !dropdown.contains(event.target as Node) && event.target !== optionsBtn) {
				dropdown.remove();
				setDropdown(null);
				document.removeEventListener("mousedown", handleClickOutside);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);

		dropdown.querySelectorAll("button").forEach((btn, idx) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				dropdownOptions[idx].onClick(userInfos, card);
				dropdown?.remove();
				setDropdown(null);
			});
		});

		setDropdown(dropdown);
	};
	return optionsBtn;
}

function createMiniUserCardBtnGroup(userInfos: UserData): HTMLDivElement {
	const btnGroup = document.createElement("div");
	btnGroup.className = "mt-auto flex gap-2 relative z-10";

	const chatBtn = document.createElement("button");
	chatBtn.className = "flex-1 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors";
	chatBtn.textContent = "Message";
	chatBtn.onclick = async () => { await goChat(userInfos); };

	const inviteBtn = document.createElement("button");
	inviteBtn.className = "w-9 h-9 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors";
	inviteBtn.title = "Inviter à jouer";
	inviteBtn.innerHTML = `
		<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
		</svg>
	`;
	inviteBtn.onclick = async () => {
		const me = await getUserInfos();
		if (!me) return;
		navigateTo(`/game`);
		gameWsClass?.sendMessage("create_inv_game", {
			user: userInfos,
			type: "create_inv_game",
			conversationId: await createConversation([me.name!, userInfos.name!]),
		});
	};

	btnGroup.appendChild(chatBtn);
	btnGroup.appendChild(inviteBtn);

	return btnGroup;
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
	bannerImg.src = userInfos.banner || "assets/default_banner.jpeg";
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

function createDropdownButton(
	bannerContainer: HTMLElement,
	onChat: () => void,
	onInvite: () => void,
	onAddDelete: () => void,
	onAddDelete_msg: string,
	onAddDelete_color: string,
	onBlock: () => void,
	onBlock_msg: string,
): HTMLButtonElement {

	// Bouton ... (dropdown) positionné en bas à droite de la bannière
	const dropdownBtn = document.createElement("button");
	dropdownBtn.className = "absolute bottom-4 right-8 w-10 h-10 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors z-20";
	dropdownBtn.title = "Plus d'options";
	dropdownBtn.innerHTML = `
		<svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<circle cx="5" cy="12" r="1.5"></circle>
			<circle cx="12" cy="12" r="1.5"></circle>
			<circle cx="19" cy="12" r="1.5"></circle>
		</svg>
	`;

	let dropdown: HTMLDivElement | null = null;
	dropdownBtn.onclick = (e) => {
		e.stopPropagation();
		if (dropdown) {
			dropdown.remove();
			dropdown = null;
			return;
		}
		dropdown = document.createElement("div");
		dropdown.className = "absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[170px] animate-fade-in";
		dropdown.style.top = `${dropdownBtn.offsetTop + dropdownBtn.offsetHeight + 8}px`;
		dropdown.style.right = "0.5rem";
		dropdown.innerHTML = `
		<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm rounded-t-lg">Go chat</button>
		<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-blue-400 text-sm">Invite to play</button>
		<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 ${onAddDelete_color} text-sm ">${onAddDelete_msg}</button>
			<button class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 text-sm">${onBlock_msg}</button>
		`;
		bannerContainer.appendChild(dropdown);

		// Click out
		function handleClickOutside(event: MouseEvent) {
			if (dropdown && !dropdown.contains(event.target as Node) && event.target !== dropdownBtn) {
				dropdown.remove();
				dropdown = null;
				document.removeEventListener("mousedown", handleClickOutside);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);

		const btns = dropdown.querySelectorAll("button");
		btns[0].addEventListener("click", () => {
			onChat();
			dropdown?.remove();
			dropdown = null;
		});
		btns[1].addEventListener("click", () => {
			onInvite();
			dropdown?.remove();
			dropdown = null;
		});
		btns[2].addEventListener("click", () => {
			onAddDelete();
			dropdown?.remove();
			dropdown = null;
		});
		btns[3].addEventListener("click", () => {
			onBlock();
			dropdown?.remove();
			dropdown = null;
		});
	};
	return dropdownBtn;	
}

export async function createUserCard(targetElement: HTMLElement, userInfos: UserData): Promise<void> {
	const container = createUserCardContainer();
	const bannerContainer = createUserCardBanner(userInfos);
	const me = await getUserInfos();
	if (!me) return;

	if (userInfos.id !== me.id) {
		const isFriend = me.friends?.some(friend => friend.id === userInfos.id);
		const isblocked = me.blocked?.some(blockedUser => blockedUser.id === userInfos.id!);
		const dropdownBtn = createDropdownButton(
			bannerContainer,
			async () => { await goChat(userInfos); },
			async () => {
				navigateTo(`/game`);
				gameWsClass?.sendMessage("create_inv_game", {
					user: userInfos,
					type: "create_inv_game",
					conversationId: await createConversation([me.name!, userInfos.name!]),
				});
			},
			async () => {
				if (isFriend) {
					await removeFriend(userInfos.id!);
				} else {
					await addFriend(userInfos.name!);
				}
			},
			isFriend ? "Remove Friend" : "Add to Friend",
			isFriend ? "text-red-400" : "text-green-400",
			async () => {
				if (isblocked) {
					await unblockUser(userInfos.id!);
				} else {
					await blockUser(userInfos.id!);
				}
			},
			isblocked ? "Unblock User" : "Block User",
		);
		bannerContainer.appendChild(dropdownBtn);
	}

	const profileWrapper = createUserCardProfile(userInfos);
	bannerContainer.appendChild(profileWrapper);

	const userInfoContainer = createUserCardInfo(userInfos);

	container.appendChild(bannerContainer);
	container.appendChild(userInfoContainer);

	targetElement.innerHTML = "";
	targetElement.appendChild(container);
}

function createUserCardContainer(): HTMLDivElement {
	const container = document.createElement("div");
	container.className = "flex flex-col w-full h-120 relative bg-[#1a1826] text-white p-8 rounded-2xl shadow-2xl";
	return container;
}

function createUserCardBanner(userInfos: UserData): HTMLDivElement {
	const bannerContainer = document.createElement("div");
	bannerContainer.className = "h-55 relative";

	const bannerWrapper = document.createElement("div");
	bannerWrapper.className = "w-full h-40 overflow-hidden relative rounded-lg shadow-xl place-self-center";

	const bannerImg = document.createElement("img");
	bannerImg.id = "banner-card";
	bannerImg.className = "bg-[#1a1826] w-full h-full object-cover";
	bannerImg.src = userInfos.banner || "assets/default_banner.jpeg";
	bannerImg.alt = "Bannière utilisateur";

	bannerWrapper.appendChild(bannerImg);
	bannerContainer.appendChild(bannerWrapper);

	return bannerContainer;
}

function createUserCardProfile(userInfos: UserData): HTMLDivElement {
	const profileWrapper = document.createElement("div");
	profileWrapper.className = "absolute bottom-[1px] left-[5%] w-[120px] h-[120px]";

	const profileBg = document.createElement("div");
	profileBg.className = "absolute inset-0 bg-[#1a1826] rounded-full";

	const profileImg = document.createElement("img");
	profileImg.id = "profile-picture-card";
	profileImg.className = "w-full h-full rounded-full border-8 border-[#1a1826] relative z-10";
	profileImg.src = userInfos.picture!;
	profileImg.alt = "Photo de profil";

	const statusBadgeElement = document.createElement("span");
	statusBadgeElement.className = `
		status-indicator-${userInfos.id!}
		absolute
		bottom-[1px] right-[1px]
		w-10 h-10
		rounded-full
		border-4 border-[#1a1826]
		flex items-center justify-center
		${status[userInfos.status!]}
		z-30
		pointer-events-none
		shadow-lg
	`;

	const srText = document.createElement("span");
	srText.className = "sr-only";
	srText.textContent = userStatusLabels[userInfos.status || "offline"];
	statusBadgeElement.appendChild(srText);

	profileWrapper.appendChild(profileBg);
	profileWrapper.appendChild(profileImg);
	profileWrapper.appendChild(statusBadgeElement);

	return profileWrapper;
}

function createUserCardInfo(userInfos: UserData): HTMLDivElement {
	const userInfoContainer = document.createElement("div");
	userInfoContainer.className = "ml-12 mt-2";

	const userName = document.createElement("h2");
	userName.className = "text-3xl font-bold";
	userName.id = "userCardName";
	userName.textContent = userInfos.name!;

	const userBio = document.createElement("p");
	userBio.className = "text-gray-400 text-xl mt-2 break-words max-h-34 overflow-y-auto";
	userBio.id = "userBio";
	userBio.style.whiteSpace = "pre-line";
	userBio.textContent = userInfos.bio || "Aucune biographie disponible.";

	userInfoContainer.appendChild(userName);
	userInfoContainer.appendChild(userBio);

	return userInfoContainer;
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

export async function injectExportUserCard(targetId: string, username: string): Promise<void> {
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
        return;
    }

	// await getUserInfos();
	let user = await GetUserByName(username);
	console.error("user found => ", user);
	if (!user)
		return;
	updateUserCardMaxi(targetElement, user, user);
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
