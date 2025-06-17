export class GameControls {
    static setupKeyboardControls(
        socket: WebSocket | null, 
        isRunning: boolean, 
        user_info: any, 
        uuid_room: string,
        global_uuid: string
    ) {
        // Key state object with boolean values
        const keyState = {
            ArrowUp: false,
            ArrowDown: false,
            z: false,
            s: false,
        };

        document.addEventListener('keydown', (event) => {
            if (!isRunning || !socket) return;
            
            // Check if the key exists in our state object
            if (event.key in keyState) {
                keyState[event.key as keyof typeof keyState] = true;
                
                socket.send(JSON.stringify({
                    type: 'key_command',
                    key_state: keyState,
                    user_id: user_info?.id,
                    uuid_room: uuid_room,
                    global_uuid: global_uuid
                }));
            }
        });

        document.addEventListener('keyup', (event) => {
            if (!isRunning || !socket) return;
            
            // Check if the key exists in our state object
            if (event.key in keyState) {
                keyState[event.key as keyof typeof keyState] = false;
                
                socket.send(JSON.stringify({
                    type: 'key_command',
                    key_state: keyState,
                    user_id: user_info?.id,
                    uuid_room: uuid_room,
                    global_uuid: global_uuid
                }));
            }
        });
    }
}