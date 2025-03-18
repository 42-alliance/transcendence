import { getAuthUrl } from "./Auth/getAuthUrl.js"
import { closeFriendSearch, openFriendSearch } from "./Friends/searchFriends.js";
import { deleteUser } from "./User/deleteUser.js";
import { logOutUser } from "./User/logoutUser.js";
import { closeChangeImage, openChangeImage } from "./User/updateUser.js";
import { formSubmit } from "./Views/Login/Login.js";

// Ajoutez la fonction au contexte global
(window as any).getAuthUrl = getAuthUrl;
(window as any).formSubmit = formSubmit;
(window as any).openFriendSearch = openFriendSearch;
(window as any).closeFriendSearch = closeFriendSearch;
(window as any).deleteUser = deleteUser;
(window as any).openChangeImage = openChangeImage;
(window as any).closeChangeImage = closeChangeImage;
(window as any).logOutUser = logOutUser;