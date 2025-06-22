import request from "supertest";
import { generateRandomString } from "../../utils/utils.ts";
import { User } from "../../utils/types.ts";

let users: User[] = [];
const USERS = 100; // Charge massive avec 100 utilisateurs

export function getFriends_tests(baseURL: string) {
  beforeAll(async () => {
    // Création de 100 utilisateurs
    for (let i = 0; i < USERS; i++) {
      users[i] = { name: generateRandomString(10), picture: generateRandomString(10), email: generateRandomString(10), id: 0};
      const res = await request(baseURL)
        .post("/users")
        .send({ name: users[i].name, picture: users[i].picture, email: users[i].email });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      users[i].id = res.body.id;
    }

    // Création de relations d'amitié (chaque utilisateur envoie 3 demandes max)
    for (let i = 0; i < USERS; i++) {
      const numFriends = Math.min(3, USERS - i - 1); // Assurer qu'on ne dépasse pas la liste
      for (let j = 1; j <= numFriends; j++) {
        await request(baseURL)
          .post("/friends/requests")
          .set("x-user-id", users[i].id.toString())
          .send({ friendName: users[i + j].name })
          .expect(201);
      }
    }

    // Accepter toutes les demandes d'amitié
    for (let i = 0; i < USERS; i++) {
      const numFriends = Math.min(3, USERS - i - 1);
      for (let j = 1; j <= numFriends; j++) {
        await request(baseURL)
          .post(`/friends/requests/${users[i + j].id}/status`)
          .set("x-user-id", users[i].id.toString())
          .send({ status: "accepted" })
          .expect(200);
      }
    }
  });

  afterAll(async () => {
    for (let i = 0; i < USERS; i++) {
      await request(baseURL)
        .delete("/users")
        .set("x-user-id", users[i].id.toString())
        .expect(200);
    }
  });

  test("GET /friends/list - Should return correct friends count for each user", async () => {
	for (let i = 0; i < USERS; i++) {
	  const userId = users[i].id;
	  const res = await request(baseURL)
		.get("/friends/list")
		.set("x-user-id", userId.toString())
		.expect(200);
  
	  expect(res.body).toBeInstanceOf(Array);
  
	  // Nouveau calcul du nombre attendu d'amis
	  const expectedFriends = 
		Math.min(3, USERS - i - 1) +  // Amis suivants
		(i > 0 ? Math.min(3, i) : 0); // Amis précédents (dans la limite)
  
	  expect(res.body.length).toBe(expectedFriends);
  
	  for (const friend of res.body) {
		expect(friend).toHaveProperty("friend");
		expect(friend).toHaveProperty("created_at");
		expect(friend).toHaveProperty("relation_id");
		expect(friend.friend).toHaveProperty("id");
		expect(friend.friend).toHaveProperty("name");
		expect(friend.friend).toHaveProperty("picture");
	  }
	}
  });
  

  test("GET /friends/list - Should return an empty list if the user has no friends", async () => {
    const lonelyUser = { name: generateRandomString(10), picture: generateRandomString(10), email: generateRandomString(10), id: 0 };
    const resCreate = await request(baseURL)
      .post("/users")
      .send({ name: lonelyUser.name, picture: lonelyUser.picture, email: lonelyUser.email });
    expect(resCreate.status).toBe(201);
    lonelyUser.id = resCreate.body.id;

    const res = await request(baseURL)
      .get("/friends/list")
      .set("x-user-id", lonelyUser.id.toString())
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);

    await request(baseURL)
      .delete("/users")
      .set("x-user-id", lonelyUser.id.toString())
      .expect(200);
  });

  test("GET /friends/list - Should return an error if the user ID is missing", async () => {
    const res = await request(baseURL)
      .get("/friends/list")
      .expect(400);

    expect(res.body.message).toBe("headers must have required property 'x-user-id'");
  });

  test("GET /friends/list - Should return an error if the user ID is invalid", async () => {
    const res = await request(baseURL)
      .get("/friends/list")
      .set("x-user-id", "invalid_id")
      .expect(400);

    expect(res.body.message).toBe("headers/x-user-id must match pattern \"^[0-9]+$\"");
  });
}
