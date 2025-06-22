// Singleton pour stocker les informations utilisateur
export class UserStore {
    private static instance: UserStore;
    private _userInfo: any = null;

    private constructor() {}

    public static getInstance(): UserStore {
        if (!UserStore.instance) {
            UserStore.instance = new UserStore();
        }
        return UserStore.instance;
    }

    set userInfo(info: any) {
        this._userInfo = info;
        console.log("User info set in UserStore:", this._userInfo);
    }

    get userInfo() {
        return this._userInfo;
    }
}

// Fonction d'aide pour récupérer les informations utilisateur
export function getUserInfo() {
    const userInfo = UserStore.getInstance().userInfo;
    if (!userInfo) {
        console.warn("User info not found in UserStore, using default");
        return { id: "player1", name: "Player 1" };
    }
    return userInfo;
}