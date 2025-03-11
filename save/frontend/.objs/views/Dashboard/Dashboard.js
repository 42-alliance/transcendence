import AView from "../AView.js";
const dev_token = "Token 37cff866c48347a856dcfae3cbbbb7f5c2b14c33";
export default class extends AView {
    constructor() {
        super();
        this.setTitle("Dragon Pong");
    }
    async getHtml() {
        try {
            const response = await fetch("src/views/Dashboard/Dashboard.html");
            if (!response.ok) {
                throw new Error(`Failed to load HTML file: ${response.statusText}`);
            }
            return await response.text();
        }
        catch (error) {
            console.error(error);
            return `<p>Error loading content</p>`;
        }
    }
}
export async function GetUserInfos(username) {
    try {
        console.log("Try to fetch ", username, " infos");
        const headers = new Headers();
        headers.append('Authorization', dev_token);
        headers.append('Content-Type', 'application/json');
        const response = await fetch(`http://localhost:8000/api/get-user/${username}/`, {
            method: "GET",
            credentials: "include",
            headers: headers,
        });
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des donnes de l'utilisateur");
        }
        console.log("DEBUG => ", response);
        const user_infos = await response.json();
        console.log("Infos recuperer :", user_infos);
        return user_infos;
    }
    catch (e) {
        throw new Error("Erreur lors de la récupération des donnes de l'utilisateur");
    }
}
//# sourceMappingURL=Dashboard.js.map