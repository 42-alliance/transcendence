/**
 * Logs in the user with the given username.
 *
 * @param username - The username of the user to log in.
 * @returns A boolean indicating whether the login was successful.
 */
export async function logUserApi(username) {
    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        await fetchApi('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({
                'username': username,
            })
        });
        console.log("User creation test succesed");
        navigateTo("/");
        return true;
    }
    catch (e) {
        console.error('Erreur :', e);
        return false;
    }
}
//# sourceMappingURL=logUser.js.map