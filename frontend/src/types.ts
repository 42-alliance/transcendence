
export interface IUser {
	id?: number;
	name?: string;
	picture?: string;
	banner?: string;
	bio?: string;
}

export interface WebSockets {
	chat: WebSocket | null;
	game: WebSocket | null;
}