import request from "supertest";
import { generateRandomString } from "../utils/utils.ts";
import { User } from "../utils/types.ts";

let users: User[] = [];
const USERS = 3;

export async function getAllConversations_tests(userURL: string, chatURL: string) {
	beforeAll(async () => {
		for (let i = 0; i < USERS; i++) {
			users[i] = { name: generateRandomString(10), picture: generateRandomString(10), id: 0 };
			const res = await request(userURL)
				.post("/users")
				.send({ name: users[i].name, picture: users[i].picture });
			expect(res.status).toBe(200);
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

	test("GET /chat/conversations - Should fetch all conversations for a user", async () => {
		const res = await request(chatURL)
		  .get("/chat/conversations")
		  .set("x-user-id", users[0].id.toString());
		
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("conversations");
		expect(Array.isArray(res.body.conversations)).toBe(true);
	  });
	
	  test("GET /chat/conversations - Should return empty array if user has no conversations", async () => {
		const newUser = await request(userURL)
		  .post("/users")
		  .send({ name: generateRandomString(10), picture: generateRandomString(10) });
		
		const res = await request(chatURL)
		  .get("/chat/conversations")
		  .set("x-user-id", newUser.body.id.toString());
		
		expect(res.status).toBe(200);
		expect(res.body.conversations).toEqual([]);
	  });
	
	test("GET /chat/conversations - Should return 400 if x-user-id is missing", async () => {
		const res = await request(chatURL).get("/chat/conversations");
		expect(res.status).toBe(400);
		expect(res.body.message).toBe("headers must have required property 'x-user-id'");
	  });
}