import { profileProfile, triggerToast } from "../../../script.js";
import { GetUserInfos } from "../Dashboard/Dashboard.js";
import { showUserInfos } from "../Friends/Friends.js";
import { webSockets } from "../viewManager.js";
import { displayConversations } from "./Chat.js";

const dev_token = "Token 37cff866c48347a856dcfae3cbbbb7f5c2b14c33"

function openInTheGoodChannel(chatBox, msg) {
	console.log("chatbox: ", chatBox);
	console.log("msg", msg);
	const receiver = chatBox.getAttribute("receiver");
	if (msg.sender === receiver)
		return true;
	return false;
}

export function displayMessage(msg) {
    const chatBox = document.getElementById("chat-container");
    if (!chatBox) return;

    const msgDiv = document.createElement("div");

    const headerElement = document.createElement("div");
    headerElement.classList.add("private-message-header");
    headerElement.style.display = "flex";
    headerElement.style.alignItems = "center";
    
    const profileImg = document.createElement("img");
    profileImg.src = msg.profile_picture;
    profileImg.alt = `${msg.sender}'s profile picture`;
    profileImg.classList.add("private-chat-profile-img", "user-profile-picture");

    const title = document.createElement("h2");
    title.textContent = `${msg.sender}`;
    title.classList.add("sender-name");
    
    title.onclick = (event) => {
    	const infoBox = document.getElementById("info-box");
		
		const parentElement = title.offsetParent; // L'élément parent relatif
		console.log("parentElement: ", parentElement);
		const top = title.offsetTop; // Position top par rapport au parent
		const right = title.offsetLeft + title.offsetWidth; // Position left par rapport au parent
			

		console.log("title top: ", top);
		console.log("title right: ", right);
        infoBox.style.left = `${title.getBoundingClientRect().right + 10}px`;
        // infoBox.style.top = `${10}px`;
        infoBox.style.display = infoBox.style.display === "none" ? "block" : "none";
    };
    
    // chatBox.appendChild(infoBox);
    
    headerElement.appendChild(profileImg);
    headerElement.appendChild(title);

    const messageText = document.createElement("span");
    messageText.textContent = `${msg.message}`;
    messageText.classList.add("private-msg-content");

    msgDiv.classList.add("private-chat-message");
    
    msgDiv.appendChild(headerElement);
    msgDiv.appendChild(messageText);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}



function createChatBody() {
	const chatBody = document.createElement("div");
	chatBody.classList.add("msg-container");
	chatBody.id = "chat-container";

	// chatBody.innerHTML = `
	// 	<div class="card" style="width: 18rem; display: none; z-index: 1000;">
	// 		<img src="..." class="card-img-top" alt="...">
	// 		<div class="card-body">
	// 			<h5 class="card-title">Card title</h5>
	// 			<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
	// 			<a href="#" class="btn btn-primary">Go somewhere</a>
	// 		</div>
	// 	</div>
	// `


	const infoBox = document.createElement("div");
	infoBox.id = "info-box";
    infoBox.classList.add("info-box");
    infoBox.style.width = "200px";
    infoBox.style.height = "200px";
    infoBox.style.backgroundColor = "white";
    infoBox.style.zIndex = "1000";
    infoBox.style.border = "1px solid black";
    infoBox.style.borderRadius = "5px";
    infoBox.style.boxShadow = "0px 0px 5px rgba(0,0,0,0.2)";
    infoBox.style.position = "absolute";
    infoBox.style.display = "none";

	chatBody.appendChild(infoBox);

	return chatBody;
}

// Private messages

async function fetchPrivateMessage(username) {
	try {
		const headers = new Headers();
		headers.append('Authorization', dev_token);
		headers.append('Content-Type', 'application/json');
		
		const response = await fetch(`http://localhost:8000/api/private-messages/${username}`, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});
		
		if (!response.ok) {
			throw new Error("Erreur lors de la récupération des messages privee");
		}
		return await response.json();

	} catch (error) {
		throw new Error("Erreur lors de la récupération des messages privee");
	}
}

function createPrivateChatHeader(interlocutor_infos) {
    const header = document.createElement('div');
    header.classList.add('private-chat-header');


    const backArrowDiv = document.createElement('div');
	backArrowDiv.innerHTML = `
		<i class="fa-solid fa-arrow-left-long"></i>
	`
    backArrowDiv.classList.add('chat-back-arrow');
    backArrowDiv.onclick = displayConversations;

    const userNavbar = document.createElement('div');
    userNavbar.classList.add('chat-user-navbar');
	userNavbar.onclick = () => showUserInfos(interlocutor_infos);

    const userImg = document.createElement('img');
    userImg.classList.add('pravate-chat-header-user');
    userImg.src = profileProfile(interlocutor_infos);
    userImg.alt = `${interlocutor_infos.username} profile picture`;

    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('chat-user-username');
    usernameSpan.textContent = interlocutor_infos.username;

    userNavbar.appendChild(userImg);
    userNavbar.appendChild(usernameSpan);

    header.appendChild(backArrowDiv);
    header.appendChild(userNavbar);

    return header;
}

function createChatFooter(interlocutor = null) {
	// Création de l'input de recherche
	const chatInput = document.createElement("input");
	chatInput.type = "text";
	chatInput.id = "chat-search";
	chatInput.className = "form-control";
	if (interlocutor)
		chatInput.placeholder = `Message ${interlocutor.username}`;
	else
		chatInput.placeholder = `Message General`;
	chatInput.autocomplete = "off";
	chatInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			let data;
			if (interlocutor) {
				
				data = {
					"message": event.target.value,
					"receiver": interlocutor.username
				};
			}
			else 
				data = {
					"message": event.target.value,
				};
			webSockets.chat.send(JSON.stringify(data)); // ajouter infos supplementaire
			event.target.value = "";
		}
	});


	// Création du bouton de soumission
	const sendButton = document.createElement("button");
	sendButton.className = "btn btn-primary";
	sendButton.type = "submit";
	sendButton.id = "search-conversation";
	sendButton.onclick = () => {
		const message = input.value.trim();
		console.log("message", message);
		if (message) {
			const data = {message: message};
			webSockets.chat.send(JSON.stringify(data));
			input.value = "";
		}
	};
	// Ajout de l'icône à l'intérieur du bouton
	const icon = document.createElement("i");
	icon.className = "fas fa-paper-plane";
	sendButton.appendChild(icon);



	// Ajout des éléments au DOM (par exemple, dans un div avec id="chat-container")
	const chatFooter = document.createElement("div");
	chatFooter.classList.add("input-group", "mb-3");

	chatFooter.appendChild(chatInput);
	chatFooter.appendChild(sendButton);
	return chatFooter;
}

export async function openPrivateChat(username) {
	let interlocutor;
	let messages;

	try {
		interlocutor = await GetUserInfos(username);
		messages = await fetchPrivateMessage(interlocutor.username);
		
	} catch (error) {
		triggerToast(error, false); // TODO: a changer
		console.error("Error: ", error);
		return;
	}

	const container = document.getElementById("conv-container");
	container.classList.remove("chat-content-conversation");
	container.classList.add("chat-content-chat");
	container.innerHTML = "";
	
	const privateChatHeader = createPrivateChatHeader(interlocutor);
	container.appendChild(privateChatHeader);

	const privateChatBody = createChatBody();
	privateChatBody.setAttribute("receiver", interlocutor.username);
	container.appendChild(privateChatBody);
	messages.forEach(msg => displayMessage(msg));

	const privateChatFooter = createChatFooter(interlocutor);
	container.appendChild(privateChatFooter);
}

// General

async function fetchMessages() {
	try {
		const response = await fetch("http://localhost:8000/api/messages/", {
			method: "GET",
			credentials: "include",
		});
	
		if (!response.ok) {
			throw new Error("Failed to get global messages");
		}
		return await response.json();
	} catch (error) {
		throw new Error("Failed to get global messages");
	}
}

function createGeneralChatHeader() {
    const header = document.createElement('div');
    header.classList.add('private-chat-header');


    const backArrowDiv = document.createElement('div');
	backArrowDiv.innerHTML = `
		<i class="fa-solid fa-arrow-left-long"></i>
	`
    backArrowDiv.classList.add('chat-back-arrow');
    backArrowDiv.onclick = displayConversations;

    const userNavbar = document.createElement('div');
    userNavbar.classList.add('chat-user-navbar');

    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('chat-user-username');
    usernameSpan.textContent = "General chat";

    userNavbar.appendChild(usernameSpan);

    header.appendChild(backArrowDiv);
    header.appendChild(userNavbar);

    return header;	
}

export async function openGeneralChat() {
	let messages;
	
	try {
		messages = await fetchMessages();
		
	} catch (error) {
		triggerToast(error, false); // TODO: a changer
		console.error("Error: ", error);
		return;
	}

	const container = document.getElementById("conv-container");
	container.classList.remove("chat-content-conversation");
	container.classList.add("chat-content-chat");
	container.innerHTML = "";

	const generalChatHeader = createGeneralChatHeader();
	container.appendChild(generalChatHeader);

	const generalChatBody = createChatBody();
	generalChatBody.setAttribute("receiver", null);
	container.appendChild(generalChatBody);
	messages.forEach(msg => displayMessage(msg));

	const generalChatFooter = createChatFooter();
	container.appendChild(generalChatFooter);
}


