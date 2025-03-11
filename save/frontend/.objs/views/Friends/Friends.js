import AView from "../AView.js";
import { me, profileProfile, triggerToast } from "../../../script.js";
const dev_token = "Token 37cff866c48347a856dcfae3cbbbb7f5c2b14c33";
export default class extends AView {
    constructor() {
        super();
        this.setTitle("Friend List");
    }
    // Charge le contenu HTML du formulaire
    async getHtml() {
        try {
            const response = await fetch("src/views/Friends/Friends.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
            return await response.text();
        }
        catch (error) {
            console.error(error);
            return `<p>Erreur lors du chargement du formulaire</p>`;
        }
    }
}
let isLoadingFriends = false;
async function addFriendToDatabase(username) {
    const headers = new Headers();
    headers.append("Authorization", dev_token);
    headers.append("Content-Type", "application/json");
    try {
        const response = await fetch("http://localhost:8000/api/friends/", {
            method: "POST",
            headers: headers,
            credentials: "include",
            body: JSON.stringify({ username }),
        });
        if (!response.ok) {
            console.error("Failed to add friend:", await response.text());
            return { success: false, message: `${username} n'est pas trouvé.<br>` };
        }
        const data = await response.json();
        console.log("Friend added successfully:", data);
        return { success: true, message: `${username} est ajouté à votre liste de contacts.<br>` };
    }
    catch (error) {
        console.error("Error adding friend:", error);
        return { success: false, message: "Internal Server Error" };
    }
}
async function deleteFriendDatabase(username) {
    const headers = new Headers();
    headers.append("Authorization", dev_token);
    headers.append("Content-Type", "application/json");
    try {
        const response = await fetch("http://localhost:8000/api/friends/", {
            method: "DELETE",
            headers: headers,
            credentials: "include",
            body: JSON.stringify({ username }),
        });
        if (!response.ok) {
            console.error("Failed to delete friend:", await response.text());
            return { success: false, message: `${username} n'est pas trouvé.<br>` };
        }
        const data = await response.json();
        console.log("Friend deleted successfully:", data);
        return { success: true, message: `${username} a bien été effacé de vos amis.<br>` };
    }
    catch (error) {
        console.error("Error deleting friend:", error);
        return { success: false, message: "Internal Server Error" };
    }
}
function openAddFriend() {
    const modal = new bootstrap.Modal('#addFriendModal', {});
    modal.show();
    setTimeout(() => {
        document.getElementById('addFriendInput').focus();
        document.getElementById('addFriendInput').select();
    }, 500);
}
async function addingFriendModal() {
    const username = document.getElementById('addFriendInput').value;
    const spinner = document.querySelector('#addFriendButton .spinner-border');
    const icon = document.querySelector('#addFriendButton .fa-user-plus');
    const addFriendButton = document.getElementById('addFriendButton');
    spinner.hidden = false;
    icon.hidden = true;
    addFriendButton.disabled = true;
    document.getElementById('addFriendInput').value = '';
    const result = await addFriendToDatabase(username);
    spinner.hidden = true;
    icon.hidden = false;
    addFriendButton.disabled = false;
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFriendModal'));
    if (modal)
        modal.hide();
    triggerToast(result.message, result.success);
    await printFriendList();
}
async function isMyFriend(username) {
    const userData = await me();
    if (userData === null) {
        triggerToast("Error when trying fetch user data!", false);
        return null;
    }
    for (let i = 0; i < userData.friends.length; i++) {
        if (userData.friends[i].username === username)
            return true;
    }
    return false;
}
export async function showUserInfos(friend) {
    const modal = new bootstrap.Modal('#openFriendModal');
    document.getElementById('openFriendModalPic').src = profileProfile(friend);
    document.getElementById('openFriendModalName').querySelector('.name').textContent = friend.username;
    document.getElementById('openFriendProfile').href = `https://profile/${friend.username}`;
    document.getElementById('openFriendLabelAddFriend').hidden = true;
    document.getElementById('openFriendLabelDeleteFriend').hidden = true;
    const isFriendwithMe = await isMyFriend(friend.username);
    if (isFriendwithMe === null) {
        triggerToast("Impossible de vérifier l'amitié. Réessayez plus tard.", false);
        return;
    }
    if (isFriendwithMe) {
        document.getElementById('openFriendLabelDeleteFriend').hidden = false;
        const deleteButton = document.getElementById('openFriendLabelDeleteFriend');
        const newDeleteButton = deleteButton.cloneNode(true);
        deleteButton.parentNode.replaceChild(newDeleteButton, deleteButton);
        newDeleteButton.addEventListener('click', async () => {
            const result = await deleteFriendDatabase(friend.username);
            modal.hide();
            triggerToast(result.message, result.success);
            await printFriendList();
        });
    }
    else {
        document.getElementById('openFriendLabelAddFriend').hidden = false;
        const addButton = document.getElementById('openFriendLabelAddFriend');
        const newAddButton = addButton.cloneNode(true);
        addButton.parentNode.replaceChild(newAddButton, addButton);
        newAddButton.addEventListener('click', async () => {
            const result = await addFriendToDatabase(friend.username);
            modal.hide();
            triggerToast(result.message, result.success);
            await printFriendList();
        });
    }
    modal.show();
}
function createAddFriendCard(elem) {
    if (!elem)
        return;
    const addFriendDiv = document.createElement("div");
    addFriendDiv.classList.add("card", "shadow", "m-2", "p-0", "card-size", "grow");
    addFriendDiv.innerHTML = `
        <div class="m-1 w-100 text-center card-img-top card-not-img-size">
            <i class="fa-solid fa-plus fa-5x"></i>
        </div>
        <div class="card-body">
            <h5 class="card-title">Add a Friend</h5>
        </div>`;
    addFriendDiv.addEventListener('click', openAddFriend);
    elem.appendChild(addFriendDiv);
    const addFriendButton = document.getElementById('addFriendButton');
    if (!addFriendButton.dataset.listenerAdded) {
        addFriendButton.addEventListener('click', addingFriendModal);
        addFriendButton.dataset.listenerAdded = true;
    }
    document.getElementById('addFriendInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addingFriendModal();
        }
    });
}
export async function printFriendList() {
    if (isLoadingFriends)
        return;
    const elem = document.getElementById("friends-list");
    if (!elem)
        return;
    const userData = await me();
    if (!userData)
        return;
    isLoadingFriends = true;
    elem.innerHTML = "";
    if (userData.friends.length !== 0) {
        userData.friends.forEach(friend => {
            const newDiv = document.createElement("div");
            newDiv.classList.add("card", "shadow", "m-2", "pl-fix", "card-size", "grow");
            newDiv.innerHTML = `
                <img src="${profileProfile(friend)}" alt="${friend.username} image" class="m-1 card-img-top card-img-size">
                <div class="card-body text-center">
                    <h5 class="card-title">${friend.username}</h5>
                </div>`;
            newDiv.addEventListener('click', () => showUserInfos(friend));
            elem.appendChild(newDiv);
        });
    }
    createAddFriendCard(elem);
    isLoadingFriends = false;
}
//# sourceMappingURL=Friends.js.map