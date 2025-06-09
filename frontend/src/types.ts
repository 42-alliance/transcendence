
export interface IUser {
	id?: number;
	name?: string;
	picture?: string;
	banner?: string;
	bio?: string;
	email?: string;
}

export interface WebSockets {
	chat: WebSocket | null;
	game: WebSocket | null;
	user: WebSocket | null;
}