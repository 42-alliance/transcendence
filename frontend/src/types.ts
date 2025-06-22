export interface Games {
	mode: string;
    status: string;
    score1: number;
    score2: number;
    id: number;
    winner: number | null;
    player1Id: number;
    player1_name: string;
    player1_picture: string;
    player2Id: number;
    player2_name: string;
    player2_picture: string;
	player1: UserData;
	player2: UserData;
    started_at: Date;
    finished_at: Date;
}

export interface UserData {
	id?: number;
	name?: string;
	picture	?: string;
	banner?: string;
	status?: string; // "online", "offline", "away", "inGame"
	email?: string;
	friends?: UserData[];
	blocked?: UserData[];
	common_friends?: UserData[];
	games?: Games[];
	bio?: string;
	created_at?: Date;
}

export interface WebSockets {
	chat: WebSocket | null;
	game: WebSocket | null;
	user: WebSocket | null;
}

export interface Member {
  userId: number;
  name: string;
  picture: string;
  conversationId: number;
  isAdmin: boolean;
}

export interface Message {
	id: number;
	createdAt: string;
	content: string;
	conversationId: number;
	userId: number;
	readBy: number[];
	conversation: Conversation;
}

export interface Conversation {
  id: number;
  name: string | null;
  isGroup: boolean;
  members: Member[]
  messages: Message[];
  unreadCount: number;
}
