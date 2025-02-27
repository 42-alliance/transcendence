import request from "supertest";

let testsUsers = [
	{ name: "imad", picture: "luffy", id: 1 },
	{ name: "moussa", picture: "goku", id: 2 },
]

export function test_friends_routes(baseURL: string) {
	test("POST /users - Create 2 users", async () => {
		for (let i = 0; i < testsUsers.length; i++) {
			const res = await request(baseURL)
			.post("/users")
			.send({ name: testsUsers[i].name, picture: testsUsers[i].picture });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("id");
			testsUsers[i].id = res.body.id;
		}
	});

	
}