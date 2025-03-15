import { getAuthUrl } from "./Auth/getAuthUrl.js";
import { closeFriendSearch, openFriendSearch } from "./Friends/searchFriends.js";
import { formSubmit } from "./Views/Login/Login.js";
// Ajoutez la fonction au contexte global
window.getAuthUrl = getAuthUrl;
window.formSubmit = formSubmit;
window.openFriendSearch = openFriendSearch;
window.closeFriendSearch = closeFriendSearch;
//# sourceMappingURL=include.js.map