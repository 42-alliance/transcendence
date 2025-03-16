import WebSocket from "ws";
import request from "supertest";
import { generateRandomString } from "../utils/utils.ts";
import { User } from "../utils/types.ts";

let users: User[] = [];
const USERS = 2;
let conversationId: number | null = null;

export function websocket_chat_tests(userURL: string, chatURL_HTTP: string, chatURL_WS: string) {
	beforeAll(async () => {
		for (let i = 0; i < USERS; i++) {
			users[i] = { name: generateRandomString(10), picture: generateRandomString(10), email: generateRandomString(10), id: 0};
			const res = await request(userURL)
				.post("/users")
				.send({ name: users[i].name, picture: users[i].picture, email: users[i].email });
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			users[i].id = res.body.id;
		}

		// Create a conversation before running WebSocket message tests
		const conversationRes = await request(chatURL_HTTP)
			.post("/chat/create")
			.set("x-user-id", users[0].id.toString())
			.send({ members: [users[0].name, users[1].name] });
		
		expect(conversationRes.status).toBe(201);
		expect(conversationRes.body).toHaveProperty("conversation.id");
		conversationId = conversationRes.body.conversation.id;
	});

	afterAll(async () => {
		for (let i = 0; i < USERS; i++) {
			const userId = users[i].id;
			const res = await request(userURL)
				.delete("/users")
				.set("x-user-id", userId.toString());
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ message: "User successfully deleted" });
		}
	});

	test("WebSocket /ws/chat - Should establish a connection", (done) => {
		const userId = users[0].id;
		const wsURL = `${chatURL_WS}/ws/chat?userId=${userId}`;
		
		console.log("🔍 Trying to connect to:", wsURL);
		
		const ws = new WebSocket(wsURL);
	
		ws.on("open", () => {
			console.log("✅ Connection established to:", wsURL);
			expect(ws.readyState).toBe(WebSocket.OPEN);
			ws.close();
		});
	
		ws.on("error", (err) => {
			console.error("❌ WebSocket error on:", wsURL);
			console.error("Error details:", err);
			done.fail(err);
		});
	
		ws.on("close", (code) => {
			console.log(`🛑 WebSocket closed with code: ${code}`);
			done();
		});
	});
  

	test("WebSocket /ws/chat - Should reject connection if userId is missing", (done) => {
		const ws = new WebSocket(`${chatURL_WS}/ws/chat`);
	
		ws.on("close", (code) => {
			expect(code).toBe(1008);
			done();
		});
	});

	test("WebSocket /ws/chat - Should send and receive messages", (done) => {
		const senderId = users[0].id;
		const receiverId = users[1].id;
		const wsSender = new WebSocket(`${chatURL_WS}/ws/chat?userId=${senderId}`);
		const wsReceiver = new WebSocket(`${chatURL_WS}/ws/chat?userId=${receiverId}`);

		wsReceiver.on("message", (data) => {
			const message = JSON.parse(data.toString());
			expect(message.type).toBe("new_message");
			expect(message.data).toHaveProperty("conversationId");
			expect(message.data).toHaveProperty("content");
			expect(message.data).toHaveProperty("createdAt");
			expect(message.data).toHaveProperty("id");
			expect(message.data).toHaveProperty("userId");
			expect(message.data.content).toBe("Hello");
			wsSender.close();
			wsReceiver.close();
			done();
		});

		wsSender.on("open", () => {
			wsSender.send(JSON.stringify({ conversationId, content: "Hello" }));
		});

		wsSender.on("error", (err) => done.fail(err));
		wsReceiver.on("error", (err) => done.fail(err));
	});
}

