import request from "supertest";
import { generateRandomString } from "../utils/utils.ts";	

interface User {
	name: string;
	picture: string;
	id: number;
}

let users: User[] = [];
const USERS = 100;

export function test_users_routes(baseURL: string) {
	test("POST /users - Should create a new user", async () => {
		for (let i = 0; i < USERS; i++) {
			users[i] = { name: generateRandomString(10), picture: generateRandomString(10), id: 0};
			const res = await request(baseURL)
				.post("/users")
				.send({ name: users[i].name, picture: users[i].picture });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("id");
			users[i].id = res.body.id;
		}
	});

	test("POST /users - Should return an error if the name is missing", async () => {
		const res = await request(baseURL)
			.post("/users")
			.send({ picture: generateRandomString(10) });
		expect(res.status).toBe(400);
		expect(res.body.message).toEqual("body must have required property 'name'" );
	});
	
	test("POST /users - Should return an error if the picture is missing", async () => {
		const res = await request(baseURL)
			.post("/users")
			.send({ name: generateRandomString(10) });
		expect(res.status).toBe(400);
		expect(res.body.message).toEqual("body must have required property 'picture'");
	});

	test("POST /users - Should return an error if the name is too long", async () => {
		const res = await request(baseURL)
			.post("/users")
			.send({ name: generateRandomString(1000), picture: generateRandomString(10) });
		expect(res.status).toBe(400);
		expect(res.body.message).toEqual("body/name must NOT have more than 100 characters");
	});

	test("GET /users - Should return all users", async () => {
		const res = await request(baseURL)
			.get("/users")
			.set("x-user-id", users[0].id.toString());
		expect(res.status).toBe(200);
		expect(res.body.length).toBeGreaterThan(USERS - 1);
	});

	test("GET /users/@me - Should return a user info", async () => {
		for (let i = 0; i < USERS; i++) {
			const userId = users[i].id;
			const res = await request(baseURL)
				.get("/users/@me")
				.set("x-user-id", userId.toString());
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("name");
			expect(res.body.name).toBe(users[i].name);
			expect(res.body).toHaveProperty("picture");
			expect(res.body.picture).toBe(users[i].picture);
			expect(res.body).toHaveProperty("id");
			expect(res.body.id).toBe(users[i].id);
		}
	});

	test("GET /users/@me - Should return an error if the user ID is missing", async () => {
		const res = await request(baseURL).get("/users/@me");
		expect(res.status).toBe(400);
		expect(res.body.message).toEqual("headers must have required property 'x-user-id'");
	});

	test("GET /users/@me - Should return an error if the user does not exist", async () => {
		const res = await request(baseURL)
			.get("/users/@me")
			.set("x-user-id", "999999");
		expect(res.status).toBe(404);
		expect(res.body.message).toEqual("User not found");
	});

	test("Should return a user if the name exists", async () => {
		for (let i = 0; i < USERS; i++) {
			const user: User = users[i];
			const res = await request(baseURL)
				.post("/users")
				.set("x-user-id", user.id.toString())
				.send({ name: user.name, picture: user.picture });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("id");
			user.id = res.body.id;
	
			const test = await request(baseURL)
				.get(`/users/${user.name}`)
				.set("x-user-id", user.id.toString());
			expect(test.status).toBe(200);
			expect(test.body).toHaveProperty("id");
			expect(test.body.id).toEqual(user.id);
			expect(test.body).toHaveProperty("name");
			expect(test.body.name).toEqual(user.name);
			expect(test.body).toHaveProperty("picture");
			expect(test.body.picture).toEqual(user.picture);
		}
	});

	test("Should return a 404 error if the user does not exist", async () => {
		// Appelez la route avec un nom qui n'existe pas
		const response = await request(baseURL)
			.get("/users/non_existent_user")
			.set("x-user-id", users[0].id.toString())
			.expect(404);
	
		// Vérifiez le message d'erreur
		expect(response.body).toEqual({ error: "User not found" });
	});
	
	test("Should return a 400 error if the user name im params is not correct", async () => {
		// Appelez la route avec un nom qui n'existe pas
		const response = await request(baseURL)
			.get("/users/09090=sdsa")
			.set("x-user-id", users[0].id.toString())
			.expect(400);
	
		// Vérifiez le message d'erreur
		expect(response.body.message).toEqual("params/name must match pattern \"^[a-zA-Z0-9_]+$\"");
	});

	test("DELETE /users - Should delete a user", async () => {
		for (let i = 0; i < USERS; i++) {
			const userId = users[i].id;
			const res = await request(baseURL)
			.delete("/users")
			.set("x-user-id", userId.toString());
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ message: "User successfully deleted" });
		}
	});

	test("DELETE /users - Should return an error if the user ID is missing", async () => {
		const res = await request(baseURL).delete("/users");
		expect(res.status).toBe(400);
		expect(res.body.message).toEqual("headers must have required property 'x-user-id'");
	});

	test("DELETE /users - Should return an error if the user does not exist", async () => {
		const res = await request(baseURL)
			.delete("/users")
			.set("x-user-id", "999999");
		expect(res.status).toBe(404);
		expect(res.body.message).toEqual("User not found");
	});



	

	// test("POST /users - Should return an error if the picture URL is invalid", async () => {
	// 	const res = await request(baseURL)
	// 		.post("/users")
	// 		.send({ name: generateRandomString(10), picture: "invalid-url" });
	// 	expect(res.status).toBe(400);
	// 	expect(res.body.message).toEqual("picture must be a valid URL");
	// });
}