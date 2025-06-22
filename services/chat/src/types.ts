

export interface User {
	name: string,
	picture: string,
	id: number,
  };

export interface WebSocketMessage {
	type: "new_message" | "invitation_game";
    conversationId: number;
    content: string;
}