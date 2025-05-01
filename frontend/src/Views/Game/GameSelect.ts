const handleRandomAdversaireButton = (socket: WebSocket, user_info: any) => {
    console.log("Random adversaire button clicked");
    socket?.send(JSON.stringify({
        type: 'random_adversaire',
        user: user_info
    }));
}

const handleLocalButton = (socket: WebSocket, user_info: any) => {
    console.log("Local button clicked");
    socket?.send(JSON.stringify({
        type: 'local',
        user: user_info
    }));
}

const handleIAButton = (socket: WebSocket, user_info: any) => {
    console.log("IA button clicked");
    socket?.send(JSON.stringify({
        type: 'ia',
        user: user_info
    }));
}


export {handleIAButton, handleLocalButton, handleRandomAdversaireButton}