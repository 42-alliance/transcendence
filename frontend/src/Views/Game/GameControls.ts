export class GameControls {
    static setupKeyboardControls(
        socket: WebSocket | null, 
        isRunning: boolean, 
        user_info: any, 
        uuid_room: string,
        global_uuid: string
    ) {
        const pressedKeys = new Set<string>();

        document.addEventListener('keydown', (event) => {
            if (!isRunning || !socket) return;
            pressedKeys.add(event.key);

            socket.send(JSON.stringify({
                type: 'key_command',
                keys: Array.from(pressedKeys),
                user_id: user_info?.id,
                uuid_room: uuid_room,
                global_uuid: global_uuid
            }));
        });

        document.addEventListener('keyup', (event) => {
            if (!isRunning || !socket) return;
            pressedKeys.delete(event.key);

            socket.send(JSON.stringify({
                type: 'key_command',
                keys: Array.from(pressedKeys),
                user_id: user_info?.id,
                uuid_room: uuid_room
            }));
        });
    }
}