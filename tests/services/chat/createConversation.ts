import request from "supertest";
import { generateRandomString } from "../utils/utils.ts";
import { User } from "../utils/types.ts";

let users: User[] = [];
const USERS = 3;

export function createConversation_tests(userURL: string, chatURL_HTTP: string) {
	beforeAll(async () => {
		for (let i = 0; i < USERS; i++) {
			users[i] = { name: generateRandomString(10), picture: generateRandomString(10), id: 0 };
			const res = await request(userURL)
				.post("/users")
				.send({ name: users[i].name, picture: users[i].picture });
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			users[i].id = res.body.id;
		}
	});

	afterAll(async () => {
		for (let i = 0; i < USERS; i++) {
			const userId = users[i].id;
			const res = await request(userURL)
				.delete("/users")
				.set("x-user-id", userId.toString());
			expect(res.status).toBe(200);
		}
	});

	test("POST /chat/create - Should create a conversation with two members", async () => {
		const res = await request(chatURL_HTTP)
		.post("/chat/create")
		.set("x-user-id", users[0].id.toString())
		.send({ members: [users[0].name, users[1].name] })
		.expect(201);
		
		expect(res.body).toHaveProperty("conversation");
		expect(res.body.conversation.members.length).toBe(2);
	});

	test("POST /chat/create - Should create a group conversation", async () => {
		const res = await request(chatURL_HTTP)
		.post("/chat/create")
		.set("x-user-id", users[0].id.toString())
		.send({ members: [users[0].name, users[1].name, users[2].name], isGroup: true })
		.expect(201);
		
		expect(res.body).toHaveProperty("conversation");
		expect(res.body.conversation.members.length).toBe(3);
		expect(res.body.conversation.isGroup).toBe(true);
	});

	test("POST /chat/create - Should return an error if only one member is provided", async () => {
		const res = await request(chatURL_HTTP)
		.post("/chat/create")
		.set("x-user-id", users[0].id.toString())
		.send({ members: [users[0].name] })
		.expect(400);
		
		expect(res.body.message).toBe("body/members must NOT have fewer than 2 items");
	});

	test("POST /chat/create - Should return existing conversation ID if conversation already exists", async () => {
		const res = await request(chatURL_HTTP)
		.post("/chat/create")
		.set("x-user-id", users[0].id.toString())
		.send({ members: [users[0].name, users[1].name] })
		.expect(200);
		
		expect(res.body.message).toBe("Une conversation existe déjà avec ces membres.");
		expect(res.body).toHaveProperty("conversationId");
	});
}
