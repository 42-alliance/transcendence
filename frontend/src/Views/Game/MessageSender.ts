import { WebSocketState } from './WebSocketState.js';

export class MessageSender {
    private state: WebSocketState;

    constructor(state: WebSocketState) {
        this.state = state;
    }

    sendMessage(type: string, data?: any): boolean {
        const socket = this.state.getSocket();
        
        if (socket && this.state.isSocketOpen()) {
            // Reset UUID for new game requests
            if (this.isNewGameRequest(type)) {
                console.log(`Starting new game of type ${type}, resetting room UUID`);
                this.state.resetRoomUUID();
            }
            
            // Create a copy to avoid modifying the original object
            const messageData = { ...data };
            
            // Use room UUID if available
            if (!messageData.uuid_room && this.state.getRoomUUID()) {
                messageData.uuid_room = this.state.getRoomUUID();
            }
            
            // Warning for messages that should have a room UUID
            if (!messageData.uuid_room && this.needsRoomUUID(type)) {
                console.warn('Sending message without room UUID:', type);
            }
            
            const message = {
                type,
                ...messageData
            };
            
            socket.send(JSON.stringify(message));
			console.log(`Message sent: ${message.type}`, messageData);
            return true;
        } else {
            console.error('WebSocket not connected');
            return false;
        }
    }
    
    sendAuthMessage(): void {
        const socket = this.state.getSocket();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'auth',
                token: localStorage.getItem('access_token')
            }));
        }
    }
    
    private isNewGameRequest(type: string): boolean {
        return ['random_adversaire', 'local', 'ia', 'tournament'].includes(type);
    }
    
    private needsRoomUUID(type: string): boolean {
        return ['game_state', 'move', 'disconnect'].includes(type);
    }
}