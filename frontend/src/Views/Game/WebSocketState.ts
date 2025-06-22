export class WebSocketState {
    private socket: WebSocket | null = null;
    private isRunning: boolean = false;
    private frameId: number | null = null;
    private user_info: any;
    private gameState: any = null;
    private lastRender: number = 0;
    private frameInterval: number = 1000 / 60; // Milliseconds per frame
    private uuid_room: string = '';
    private global_uuid: string = '';

    constructor(user_info: any) {
        this.user_info = user_info;
    }

    // Getters and setters
    getSocket(): WebSocket | null {
        return this.socket;
    }

    setSocket(socket: WebSocket | null): void {
        this.socket = socket;
    }

    isSocketOpen(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }

    getRunningState(): boolean {
        return this.isRunning;
    }

    setRunningState(isRunning: boolean): void {
        this.isRunning = isRunning;
    }

    getFrameId(): number | null {
        return this.frameId;
    }

    setFrameId(frameId: number | null): void {
        this.frameId = frameId;
    }

    getUserInfo(): any {
        return this.user_info;
    }

    getGameState(): any {
        return this.gameState;
    }

    setGameState(state: any): void {
        if (!state) return;
        this.gameState = state;
    }

    getLastRender(): number {
        return this.lastRender;
    }

    setLastRender(timestamp: number): void {
        this.lastRender = timestamp;
    }

    getFrameInterval(): number {
        return this.frameInterval;
    }

    getRoomUUID(): string {
        return this.uuid_room;
    }

    setRoomUUID(uuid: string): void {
        this.uuid_room = uuid;
    }

    getGlobalUUID(): string {
        return this.global_uuid;
    }

    setGlobalUUID(uuid: string): void {
        this.global_uuid = uuid;
    }

    resetRoomUUID(): void {
        this.uuid_room = '';
    }
}