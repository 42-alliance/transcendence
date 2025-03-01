

export interface User {
	name: string,
	picture: string,
	id: number,
  };

export interface WebSocketMessage {
    conversationId: number;
    content: string;
}