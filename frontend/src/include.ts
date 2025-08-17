import { getAuthUrl } from "./Auth/getAuthUrl.js";
import { getFriendStatus } from "./Friends/getFriendStatus.js";
import { getPendingFriendRequest } from "./Friends/getPendingFriendRequest.js";
import { getSendFriendRequest } from "./Friends/getSendFriendRequest.js";
import {
  closeFriendList,
  closeFriendSearch,
  openFriendList,
  openFriendSearch,
} from "./Friends/searchFriends.js";
import { updateFriendStatus } from "./Friends/updateFriendStatus.js";
import { changeLanguage } from "./lang/langManager.js";
import { deleteUser } from "./User/deleteUser.js";
import { GetUserByName } from "./User/getUserByName.js";
import { logOutUser } from "./User/logoutUser.js";
import { setTwoFa } from "./User/TwoFa/setTwoFa.js";
import { closeChangeImage, openChangeImage } from "./User/updateUser.js";
import { formSubmit } from "./Views/Login/Login.js";
import { check2faEnabled } from "./User/TwoFa/setTwoFa.js";
// ... autres imports ...
import { initTwoFaToggle } from "./User/TwoFa/initTwoFaToggle.js";
import { login, register } from "./Views/Auth/Auth.js";

// ... autres code ...

// Exécuter l'initialisation quand le DOM est chargé

// Ajoutez la fonction au contexte global
(window as any).getAuthUrl = getAuthUrl;
(window as any).changeLanguage = changeLanguage;
(window as any).setTwoFa = setTwoFa;
(window as any).check2faEnabled = check2faEnabled;

(window as any).formSubmit = formSubmit;
(window as any).openFriendSearch = openFriendSearch;
(window as any).openFriendList = openFriendList;
(window as any).closeFriendList = closeFriendList;
(window as any).closeFriendSearch = closeFriendSearch;
(window as any).deleteUser = deleteUser;
(window as any).openChangeImage = openChangeImage;
(window as any).closeChangeImage = closeChangeImage;
(window as any).logOutUser = logOutUser;
(window as any).getPendingFriendRequest = getPendingFriendRequest;
(window as any).getSendFriendRequest = getSendFriendRequest;
(window as any).getFriendStatus = getFriendStatus; // for test in navigator
(window as any).updateFriendStatus = updateFriendStatus; // for test in navigator
(window as any).GetUserByName = GetUserByName; // for test in navigator
(window as any).register = register;
(window as any).login = login;
document.addEventListener("DOMContentLoaded", () => {
  initTwoFaToggle();
});
